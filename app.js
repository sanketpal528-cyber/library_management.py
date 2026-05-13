// ── Storage helpers ───────────────────────────────────────────────────────────
const load = key => JSON.parse(localStorage.getItem(key) || '{}');
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── Data stores ───────────────────────────────────────────────────────────────
let books   = load('lms_books');
let members = load('lms_members');
let records = load('lms_records');

// ── Navigation ────────────────────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Refresh relevant section
  if (id === 'dashboard') renderDashboard();
  if (id === 'books')     renderBooks();
  if (id === 'members')   renderMembers();
  if (id === 'records')   renderRecords();
  if (id === 'reports')   renderReports();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ── Modal ─────────────────────────────────────────────────────────────────────
let modalCallback = null;
function confirm(msg, cb) {
  document.getElementById('modalMsg').textContent = msg;
  document.getElementById('modal').classList.remove('hidden');
  modalCallback = cb;
  document.getElementById('modalConfirm').onclick = () => { closeModal(); cb(); };
}
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  modalCallback = null;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const today    = () => new Date().toISOString().split('T')[0];
const addDays  = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split('T')[0]; };
const daysDiff = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);
const fmtDate  = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const totalBooks     = Object.values(books).reduce((s, b) => s + b.copies, 0);
  const availableBooks = Object.values(books).reduce((s, b) => s + b.available, 0);
  const totalMembers   = Object.keys(members).length;
  const activeRecords  = Object.values(records).filter(r => !r.returnDate).length;
  const overdueCount   = Object.values(records).filter(r => !r.returnDate && today() > r.dueDate).length;
  const totalFines     = Object.values(records).reduce((s, r) => s + (r.fine || 0), 0);

  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card">
      <span class="stat-icon">📖</span>
      <div class="stat-label">Book Titles</div>
      <div class="stat-value">${Object.keys(books).length}</div>
    </div>
    <div class="stat-card green">
      <span class="stat-icon">✅</span>
      <div class="stat-label">Available Copies</div>
      <div class="stat-value">${availableBooks}</div>
    </div>
    <div class="stat-card blue">
      <span class="stat-icon">👥</span>
      <div class="stat-label">Total Members</div>
      <div class="stat-value">${totalMembers}</div>
    </div>
    <div class="stat-card orange">
      <span class="stat-icon">🔄</span>
      <div class="stat-label">Active Borrows</div>
      <div class="stat-value">${activeRecords}</div>
    </div>
    <div class="stat-card red">
      <span class="stat-icon">⚠️</span>
      <div class="stat-label">Overdue Books</div>
      <div class="stat-value">${overdueCount}</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">💰</span>
      <div class="stat-label">Fines Collected</div>
      <div class="stat-value">₹${totalFines}</div>
    </div>
  `;
}

// ── BOOKS ─────────────────────────────────────────────────────────────────────
function saveBook(e) {
  e.preventDefault();
  const editId  = document.getElementById('editBookId').value.trim();
  const id      = document.getElementById('bookId').value.trim().toUpperCase();
  const title   = document.getElementById('bookTitle').value.trim();
  const author  = document.getElementById('bookAuthor').value.trim();
  const genre   = document.getElementById('bookGenre').value.trim();
  const copies  = parseInt(document.getElementById('bookCopies').value);

  if (!editId && books[id]) { toast('Book ID already exists!', 'error'); return; }

  if (editId) {
    // Editing — keep available proportional
    const diff = copies - books[editId].copies;
    books[editId] = { ...books[editId], title, author, genre, copies, available: Math.max(0, books[editId].available + diff) };
    toast(`Book "${title}" updated.`);
  } else {
    books[id] = { title, author, genre, copies, available: copies };
    toast(`Book "${title}" added successfully.`);
  }

  save('lms_books', books);
  cancelBookEdit();
  renderBooks();
}

function editBook(id) {
  const b = books[id];
  document.getElementById('editBookId').value   = id;
  document.getElementById('bookId').value       = id;
  document.getElementById('bookId').disabled    = true;
  document.getElementById('bookTitle').value    = b.title;
  document.getElementById('bookAuthor').value   = b.author;
  document.getElementById('bookGenre').value    = b.genre;
  document.getElementById('bookCopies').value   = b.copies;
  document.getElementById('bookFormTitle').textContent  = 'Edit Book';
  document.getElementById('bookSubmitBtn').textContent  = 'Update Book';
  document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelBookEdit() {
  document.getElementById('bookForm').reset();
  document.getElementById('editBookId').value  = '';
  document.getElementById('bookId').disabled   = false;
  document.getElementById('bookFormTitle').textContent = 'Add New Book';
  document.getElementById('bookSubmitBtn').textContent = 'Add Book';
}

function deleteBook(id) {
  confirm(`Delete book "${books[id].title}"? This cannot be undone.`, () => {
    delete books[id];
    save('lms_books', books);
    renderBooks();
    toast('Book deleted.', 'warning');
  });
}

function renderBooks() {
  const q    = (document.getElementById('bookSearch').value || '').toLowerCase();
  const tbody = document.getElementById('booksBody');
  const list  = Object.entries(books).filter(([id, b]) =>
    b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || id.toLowerCase().includes(q)
  );

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No books found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(([id, b]) => {
    const pct    = b.copies > 0 ? (b.available / b.copies) : 0;
    const status = b.available === 0
      ? `<span class="badge badge-danger">Out of Stock</span>`
      : pct < 0.4
      ? `<span class="badge badge-warning">Low Stock</span>`
      : `<span class="badge badge-success">Available</span>`;
    return `
      <tr>
        <td><strong>${id}</strong></td>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.genre || '—'}</td>
        <td>${b.copies}</td>
        <td>${b.available}</td>
        <td>${status}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="editBook('${id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBook('${id}')">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

// ── MEMBERS ───────────────────────────────────────────────────────────────────
function saveMember(e) {
  e.preventDefault();
  const editId = document.getElementById('editMemberId').value.trim();
  const id     = document.getElementById('memberId').value.trim().toUpperCase();
  const name   = document.getElementById('memberName').value.trim();
  const email  = document.getElementById('memberEmail').value.trim();
  const phone  = document.getElementById('memberPhone').value.trim();

  if (!editId && members[id]) { toast('Member ID already exists!', 'error'); return; }

  if (editId) {
    members[editId] = { ...members[editId], name, email, phone };
    toast(`Member "${name}" updated.`);
  } else {
    members[id] = { name, email, phone, borrowedBooks: [] };
    toast(`Member "${name}" registered.`);
  }

  save('lms_members', members);
  cancelMemberEdit();
  renderMembers();
}

function editMember(id) {
  const m = members[id];
  document.getElementById('editMemberId').value    = id;
  document.getElementById('memberId').value        = id;
  document.getElementById('memberId').disabled     = true;
  document.getElementById('memberName').value      = m.name;
  document.getElementById('memberEmail').value     = m.email;
  document.getElementById('memberPhone').value     = m.phone;
  document.getElementById('memberFormTitle').textContent = 'Edit Member';
  document.getElementById('memberSubmitBtn').textContent = 'Update Member';
  document.getElementById('memberForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelMemberEdit() {
  document.getElementById('memberForm').reset();
  document.getElementById('editMemberId').value    = '';
  document.getElementById('memberId').disabled     = false;
  document.getElementById('memberFormTitle').textContent = 'Register New Member';
  document.getElementById('memberSubmitBtn').textContent = 'Register Member';
}

function deleteMember(id) {
  if (members[id].borrowedBooks.length > 0) {
    toast('Cannot delete — member has active borrowed books.', 'error');
    return;
  }
  confirm(`Delete member "${members[id].name}"?`, () => {
    delete members[id];
    save('lms_members', members);
    renderMembers();
    toast('Member deleted.', 'warning');
  });
}

function renderMembers() {
  const q     = (document.getElementById('memberSearch').value || '').toLowerCase();
  const tbody = document.getElementById('membersBody');
  const list  = Object.entries(members).filter(([id, m]) =>
    m.name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
  );

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No members found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(([id, m]) => `
    <tr>
      <td><strong>${id}</strong></td>
      <td>${m.name}</td>
      <td>${m.email || '—'}</td>
      <td>${m.phone || '—'}</td>
      <td>
        ${m.borrowedBooks.length > 0
          ? `<span class="badge badge-warning">${m.borrowedBooks.length} book(s)</span>`
          : `<span class="badge badge-muted">None</span>`}
      </td>
      <td>
        <button class="btn btn-info btn-sm" onclick="editMember('${id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteMember('${id}')">Delete</button>
      </td>
    </tr>`).join('');
}

// ── BORROW ────────────────────────────────────────────────────────────────────
function borrowBook(e) {
  e.preventDefault();
  const mid = document.getElementById('borrowMemberId').value.trim().toUpperCase();
  const bid = document.getElementById('borrowBookId').value.trim().toUpperCase();

  if (!members[mid]) { toast('Member ID not found.', 'error'); return; }
  if (!books[bid])   { toast('Book ID not found.', 'error'); return; }
  if (books[bid].available <= 0) { toast('No copies available right now.', 'error'); return; }
  if (members[mid].borrowedBooks.includes(bid)) { toast('Member already borrowed this book.', 'error'); return; }

  const recCount = Object.keys(records).length + 1;
  const recId    = `R${String(recCount).padStart(4, '0')}`;
  const borrowed = today();
  const due      = addDays(borrowed, 14);

  records[recId] = { memberId: mid, bookId: bid, borrowDate: borrowed, dueDate: due, returnDate: null, fine: 0 };
  books[bid].available--;
  members[mid].borrowedBooks.push(bid);

  save('lms_records', records);
  save('lms_books', books);
  save('lms_members', members);

  document.getElementById('borrowMemberId').value = '';
  document.getElementById('borrowBookId').value   = '';

  toast(`✔ "${books[bid].title}" borrowed by ${members[mid].name}. Due: ${fmtDate(due)}. Record: ${recId}`);
}

// ── RETURN ────────────────────────────────────────────────────────────────────
function returnBook(e) {
  e.preventDefault();
  const rid = document.getElementById('returnRecordId').value.trim().toUpperCase();

  if (!records[rid])              { toast('Record ID not found.', 'error'); return; }
  if (records[rid].returnDate)    { toast('This book has already been returned.', 'error'); return; }

  const rec  = records[rid];
  const fine = today() > rec.dueDate ? daysDiff(rec.dueDate, today()) * 5 : 0;

  rec.returnDate = today();
  rec.fine       = fine;

  books[rec.bookId].available++;
  members[rec.memberId].borrowedBooks = members[rec.memberId].borrowedBooks.filter(b => b !== rec.bookId);

  save('lms_records', records);
  save('lms_books', books);
  save('lms_members', members);

  document.getElementById('returnRecordId').value = '';
  document.getElementById('finePreview').classList.add('hidden');

  const msg = fine > 0
    ? `✔ Book returned. Overdue fine: ₹${fine}`
    : `✔ Book returned on time. No fine.`;
  toast(msg, fine > 0 ? 'warning' : 'success');
}

// Live fine preview while typing record ID
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('returnRecordId');
  if (inp) {
    inp.addEventListener('input', () => {
      const rid = inp.value.trim().toUpperCase();
      const preview = document.getElementById('finePreview');
      if (records[rid] && !records[rid].returnDate) {
        const fine = today() > records[rid].dueDate ? daysDiff(records[rid].dueDate, today()) * 5 : 0;
        preview.classList.remove('hidden');
        preview.innerHTML = fine > 0
          ? `⚠️ Overdue by ${daysDiff(records[rid].dueDate, today())} day(s). Fine: <strong>₹${fine}</strong>`
          : `✅ Within due date. No fine.`;
      } else {
        preview.classList.add('hidden');
      }
    });
  }

  // Init dashboard
  renderDashboard();
});

// ── RECORDS ───────────────────────────────────────────────────────────────────
function renderRecords() {
  const filter = document.getElementById('recordFilter').value;
  const tbody  = document.getElementById('recordsBody');

  let list = Object.entries(records);

  if (filter === 'active')   list = list.filter(([, r]) => !r.returnDate);
  if (filter === 'returned') list = list.filter(([, r]) =>  r.returnDate);
  if (filter === 'overdue')  list = list.filter(([, r]) => !r.returnDate && today() > r.dueDate);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No records found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(([rid, r]) => {
    const memberName = members[r.memberId]?.name || r.memberId;
    const bookTitle  = books[r.bookId]?.title    || r.bookId;
    const isOverdue  = !r.returnDate && today() > r.dueDate;
    const status     = r.returnDate
      ? `<span class="badge badge-success">Returned</span>`
      : isOverdue
      ? `<span class="badge badge-danger">Overdue</span>`
      : `<span class="badge badge-info">Active</span>`;

    return `
      <tr>
        <td><strong>${rid}</strong></td>
        <td>${memberName}</td>
        <td>${bookTitle}</td>
        <td>${fmtDate(r.borrowDate)}</td>
        <td>${fmtDate(r.dueDate)}</td>
        <td>${fmtDate(r.returnDate)}</td>
        <td>${r.fine > 0 ? `<span class="badge badge-warning">₹${r.fine}</span>` : '—'}</td>
        <td>${status}</td>
      </tr>`;
  }).join('');
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function renderReports() {
  const totalBooks     = Object.values(books).reduce((s, b) => s + b.copies, 0);
  const availableBooks = Object.values(books).reduce((s, b) => s + b.available, 0);
  const totalMembers   = Object.keys(members).length;
  const activeRecords  = Object.values(records).filter(r => !r.returnDate).length;
  const overdueCount   = Object.values(records).filter(r => !r.returnDate && today() > r.dueDate).length;
  const totalFines     = Object.values(records).reduce((s, r) => s + (r.fine || 0), 0);

  document.getElementById('reportStats').innerHTML = `
    <div class="stat-card">
      <span class="stat-icon">📖</span>
      <div class="stat-label">Book Titles</div>
      <div class="stat-value">${Object.keys(books).length}</div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">📦</span>
      <div class="stat-label">Total Copies</div>
      <div class="stat-value">${totalBooks}</div>
    </div>
    <div class="stat-card green">
      <span class="stat-icon">✅</span>
      <div class="stat-label">Available</div>
      <div class="stat-value">${availableBooks}</div>
    </div>
    <div class="stat-card blue">
      <span class="stat-icon">👥</span>
      <div class="stat-label">Members</div>
      <div class="stat-value">${totalMembers}</div>
    </div>
    <div class="stat-card orange">
      <span class="stat-icon">🔄</span>
      <div class="stat-label">Active Borrows</div>
      <div class="stat-value">${activeRecords}</div>
    </div>
    <div class="stat-card red">
      <span class="stat-icon">💰</span>
      <div class="stat-label">Fines Collected</div>
      <div class="stat-value">₹${totalFines}</div>
    </div>
  `;

  // Top borrowed books
  const borrowCount = {};
  Object.values(records).forEach(r => {
    borrowCount[r.bookId] = (borrowCount[r.bookId] || 0) + 1;
  });
  const topBooks = Object.entries(borrowCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);

  document.getElementById('topBooks').innerHTML = topBooks.length
    ? topBooks.map(([id, count]) =>
        `<li>${books[id]?.title || id} <span>${count}x</span></li>`
      ).join('')
    : `<li style="color:var(--muted)">No borrow data yet.</li>`;

  // Overdue list
  const overdueRecs = Object.entries(records)
    .filter(([, r]) => !r.returnDate && today() > r.dueDate);

  document.getElementById('overdueList').innerHTML = overdueRecs.length
    ? overdueRecs.map(([rid, r]) => {
        const days = daysDiff(r.dueDate, today());
        return `<li>${members[r.memberId]?.name || r.memberId} — ${books[r.bookId]?.title || r.bookId} <span>${days}d overdue</span></li>`;
      }).join('')
    : `<li style="color:var(--muted)">No overdue books. 🎉</li>`;
}

// ═══════════════════════════════════════════════════════════════════
// NEW PAGES — CATALOGUE · ABOUT · SETTINGS
// ═══════════════════════════════════════════════════════════════════

// ── showSection extension ─────────────────────────────────────────
const _origShow = showSection;
showSection = function(id) {
  _origShow(id);
  if (id === 'catalogue') renderCatalogue();
  if (id === 'settings')  renderSettings();
};

// ── CATALOGUE ─────────────────────────────────────────────────────
const COVER_COLORS = [
  'linear-gradient(135deg,#6c63ff,#a89cff)',
  'linear-gradient(135deg,#f72585,#ef476f)',
  'linear-gradient(135deg,#06d6a0,#059669)',
  'linear-gradient(135deg,#ffd166,#f59e0b)',
  'linear-gradient(135deg,#118ab2,#0ea5e9)',
  'linear-gradient(135deg,#7b2fff,#6c63ff)',
  'linear-gradient(135deg,#00d4ff,#0099cc)',
  'linear-gradient(135deg,#ff6b6b,#f72585)',
];

const BOOK_EMOJIS = ['📚','📖','📕','📗','📘','📙','📓','📔','📒','🔬','💻','🌍','🎭','🔭','⚗️','🧬'];

function renderCatalogue() {
  books = load('lms_books');
  const q      = (document.getElementById('catSearch').value || '').toLowerCase();
  const genre  = document.getElementById('catGenre').value;
  const sort   = document.getElementById('catSort').value;
  const grid   = document.getElementById('catalogueGrid');
  const genSel = document.getElementById('catGenre');

  // Populate genre dropdown
  const genres = [...new Set(Object.values(books).map(b => b.genre).filter(Boolean))];
  const curVal = genSel.value;
  genSel.innerHTML = '<option value="">All Genres</option>' +
    genres.map(g => `<option value="${g}" ${g === curVal ? 'selected' : ''}>${g}</option>`).join('');

  // Filter
  let list = Object.entries(books).filter(([id, b]) => {
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.genre||'').toLowerCase().includes(q);
    const matchG = !genre || b.genre === genre;
    return matchQ && matchG;
  });

  // Sort
  list.sort((a, b) => {
    if (sort === 'title')     return a[1].title.localeCompare(b[1].title);
    if (sort === 'author')    return a[1].author.localeCompare(b[1].author);
    if (sort === 'available') return b[1].available - a[1].available;
    return 0;
  });

  document.getElementById('catCount').textContent = `${list.length} book${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">📭 No books found.</div>`;
    return;
  }

  grid.innerHTML = list.map(([id, b], i) => {
    const color = COVER_COLORS[i % COVER_COLORS.length];
    const emoji = BOOK_EMOJIS[i % BOOK_EMOJIS.length];
    const availClass = b.available === 0 ? 'none' : b.available / b.copies < 0.4 ? 'low' : 'ok';
    const availText  = b.available === 0 ? 'Out of Stock' : `${b.available} / ${b.copies} available`;
    return `
      <div class="book-card fade-in-card" onclick="quickBorrow('${id}')">
        <div class="book-card-cover" style="background:${color}">
          <span style="position:relative;z-index:1;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.4))">${emoji}</span>
        </div>
        <div class="book-card-body">
          <div class="book-card-title">${b.title}</div>
          <div class="book-card-author">by ${b.author}</div>
          <div class="book-card-footer">
            <span class="book-card-genre">${b.genre || 'General'}</span>
            <span class="book-card-avail ${availClass}">${availText}</span>
          </div>
        </div>
        <div class="book-card-overlay">
          <h4>${b.title}</h4>
          <p>${b.author} · ${b.genre || 'General'}</p>
          <p style="margin-top:.25rem;font-size:.7rem;opacity:.7">Click to borrow</p>
        </div>
      </div>`;
  }).join('');

  // Trigger fade-in observer on new cards
  document.querySelectorAll('.book-card.fade-in-card').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 50);
  });
}

function quickBorrow(bookId) {
  showSection('borrow');
  setTimeout(() => {
    document.getElementById('borrowBookId').value = bookId;
    document.getElementById('borrowBookId').focus();
    toast(`📖 Book ID "${bookId}" filled in. Enter Member ID to borrow.`, 'success');
  }, 300);
}

// ── SETTINGS ──────────────────────────────────────────────────────
function renderSettings() {
  books   = load('lms_books');
  members = load('lms_members');
  records = load('lms_records');

  // Data stats
  const ds = document.getElementById('dataStats');
  if (ds) {
    ds.innerHTML = `
      <div class="ds-item"><div class="ds-num">${Object.keys(books).length}</div><div class="ds-label">Books</div></div>
      <div class="ds-item"><div class="ds-num">${Object.keys(members).length}</div><div class="ds-label">Members</div></div>
      <div class="ds-item"><div class="ds-num">${Object.keys(records).length}</div><div class="ds-label">Records</div></div>
    `;
  }

  // Storage used
  let total = 0;
  ['lms_books','lms_members','lms_records'].forEach(k => {
    total += (localStorage.getItem(k) || '').length;
  });
  const su = document.getElementById('storageUsed');
  if (su) su.textContent = total < 1024 ? `${total} B` : `${(total/1024).toFixed(1)} KB`;

  // Browser
  const bi = document.getElementById('browserInfo');
  if (bi) {
    const ua = navigator.userAgent;
    bi.textContent = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
  }

  // Load saved config
  const cfg = JSON.parse(localStorage.getItem('lms_config') || '{}');
  if (cfg.loanDays) document.getElementById('loanDays').value = cfg.loanDays;
  if (cfg.fineRate) document.getElementById('fineRate').value = cfg.fineRate;
  if (cfg.libName)  document.getElementById('libName').value  = cfg.libName;
}

function saveSettings() {
  const cfg = {
    loanDays: parseInt(document.getElementById('loanDays').value) || 14,
    fineRate:  parseInt(document.getElementById('fineRate').value)  || 5,
    libName:  document.getElementById('libName').value.trim() || 'LibraryMS',
  };
  localStorage.setItem('lms_config', JSON.stringify(cfg));
  // Update navbar brand
  const brand = document.querySelector('.nav-brand');
  if (brand) brand.textContent = '📚 ' + cfg.libName;
  toast('✔ Settings saved successfully.', 'success');
}

function setAccent(primary, dark, light, el) {
  document.documentElement.style.setProperty('--primary',       primary);
  document.documentElement.style.setProperty('--primary-dark',  dark);
  document.documentElement.style.setProperty('--primary-light', light);
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  localStorage.setItem('lms_accent', JSON.stringify({ primary, dark, light }));
  toast('🎨 Accent color updated.', 'success');
}

function toggleAnimations(cb) {
  const canvas = document.getElementById('bgCanvas');
  if (canvas) canvas.style.display = cb.checked ? 'block' : 'none';
}

function toggleCompact(cb) {
  document.body.classList.toggle('compact', cb.checked);
}

function exportData() {
  const data = {
    books:   load('lms_books'),
    members: load('lms_members'),
    records: load('lms_records'),
    exported: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `libraryms_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  toast('📥 Data exported successfully.', 'success');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.books)   save('lms_books',   data.books);
      if (data.members) save('lms_members', data.members);
      if (data.records) save('lms_records', data.records);
      books   = load('lms_books');
      members = load('lms_members');
      records = load('lms_records');
      renderSettings();
      toast('📤 Data imported successfully.', 'success');
    } catch { toast('❌ Invalid JSON file.', 'error'); }
  };
  reader.readAsText(file);
}

function clearAllData() {
  confirm('⚠️ This will permanently delete ALL books, members, and records. Are you sure?', () => {
    localStorage.removeItem('lms_books');
    localStorage.removeItem('lms_members');
    localStorage.removeItem('lms_records');
    books = {}; members = {}; records = {};
    renderSettings();
    renderDashboard();
    toast('🗑️ All data cleared.', 'warning');
  });
}

// ── Restore accent on load ─────────────────────────────────────────
(function restoreAccent() {
  const a = JSON.parse(localStorage.getItem('lms_accent') || 'null');
  if (a) {
    document.documentElement.style.setProperty('--primary',       a.primary);
    document.documentElement.style.setProperty('--primary-dark',  a.dark);
    document.documentElement.style.setProperty('--primary-light', a.light);
  }
  const cfg = JSON.parse(localStorage.getItem('lms_config') || '{}');
  if (cfg.libName) {
    const brand = document.querySelector('.nav-brand');
    if (brand) brand.textContent = '📚 ' + cfg.libName;
  }
})();
