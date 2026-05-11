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
