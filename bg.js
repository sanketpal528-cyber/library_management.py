/* ═══════════════════════════════════════════════════════════════════
   bg.js  —  Futuristic Animated Background Engine
   Particles · Circuit Lines · Neon Waves · Mouse Interaction
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Canvas setup ─────────────────────────────────────────────── */
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initAll(); });

  /* ── Mouse ────────────────────────────────────────────────────── */
  const mouse = { x: W / 2, y: H / 2, active: false };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  /* ── Colour palette ───────────────────────────────────────────── */
  const COLORS = ['#6c63ff','#a89cff','#f72585','#06d6a0','#00d4ff','#7b2fff'];
  const rand   = (a, b) => Math.random() * (b - a) + a;
  const pick   = arr  => arr[Math.floor(Math.random() * arr.length)];

  /* ══════════════════════════════════════════════════════════════
     1. FLOATING PARTICLES
  ══════════════════════════════════════════════════════════════ */
  const PARTICLE_COUNT = 90;
  let particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x     = rand(0, W);
      this.y     = init ? rand(0, H) : H + 10;
      this.r     = rand(1, 3.5);
      this.color = pick(COLORS);
      this.alpha = rand(0.3, 0.9);
      this.vx    = rand(-0.3, 0.3);
      this.vy    = rand(-0.6, -0.15);
      this.pulse = rand(0, Math.PI * 2);
      this.pulseSpeed = rand(0.02, 0.05);
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.vx += (dx / dist) * force * 0.4;
        this.vy += (dy / dist) * force * 0.4;
      }
      // Damping
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;
      if (this.y < -10) this.reset(false);
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
    }
    draw() {
      const glow = this.r + Math.sin(this.pulse) * 1.5;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glow * 4);
      grad.addColorStop(0, this.color + 'ff');
      grad.addColorStop(1, this.color + '00');
      ctx.beginPath();
      ctx.arc(this.x, this.y, glow * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalAlpha = this.alpha * 0.4;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, glow, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     2. CIRCUIT LINES
  ══════════════════════════════════════════════════════════════ */
  const CIRCUIT_COUNT = 18;
  let circuits = [];

  class Circuit {
    constructor() { this.reset(); }
    reset() {
      this.x     = rand(0, W);
      this.y     = rand(0, H);
      this.len   = rand(60, 200);
      this.angle = [0, 90, 180, 270][Math.floor(rand(0, 4))] * Math.PI / 180;
      this.speed = rand(0.4, 1.2);
      this.color = pick(['#6c63ff','#00d4ff','#06d6a0']);
      this.alpha = rand(0.1, 0.35);
      this.progress = 0;
      this.branches = [];
      // Random L-shaped branch
      if (Math.random() > 0.4) {
        this.branches.push({
          at: rand(0.3, 0.7),
          angle: this.angle + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 2,
          len: rand(30, 80),
          progress: 0
        });
      }
    }
    update() {
      this.progress += this.speed / this.len;
      this.branches.forEach(b => {
        if (this.progress >= b.at) b.progress += this.speed / b.len;
      });
      if (this.progress >= 1.5) this.reset();
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = 1;
      ctx.shadowColor = this.color;
      ctx.shadowBlur  = 6;
      // Main line
      const p = Math.min(this.progress, 1);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x + Math.cos(this.angle) * this.len * p,
        this.y + Math.sin(this.angle) * this.len * p
      );
      ctx.stroke();
      // Dot at tip
      ctx.beginPath();
      ctx.arc(
        this.x + Math.cos(this.angle) * this.len * p,
        this.y + Math.sin(this.angle) * this.len * p,
        2, 0, Math.PI * 2
      );
      ctx.fillStyle = this.color;
      ctx.fill();
      // Branches
      this.branches.forEach(b => {
        if (this.progress < b.at) return;
        const bx = this.x + Math.cos(this.angle) * this.len * b.at;
        const by = this.y + Math.sin(this.angle) * this.len * b.at;
        const bp = Math.min(b.progress, 1);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(b.angle) * b.len * bp, by + Math.sin(b.angle) * b.len * bp);
        ctx.stroke();
      });
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     3. NEON WAVES
  ══════════════════════════════════════════════════════════════ */
  let waveOffset = 0;
  const WAVES = [
    { amp: 40, freq: 0.008, speed: 0.012, color: '#6c63ff', alpha: 0.06, yFrac: 0.55 },
    { amp: 30, freq: 0.012, speed: 0.018, color: '#f72585', alpha: 0.05, yFrac: 0.65 },
    { amp: 25, freq: 0.006, speed: 0.008, color: '#00d4ff', alpha: 0.04, yFrac: 0.75 },
  ];

  function drawWaves(t) {
    WAVES.forEach(w => {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        const y = H * w.yFrac + Math.sin(x * w.freq + t * w.speed) * w.amp
                               + Math.sin(x * w.freq * 2 + t * w.speed * 1.5) * (w.amp * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.globalAlpha = w.alpha;
      ctx.fill();
      // Glowing top edge
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const y = H * w.yFrac + Math.sin(x * w.freq + t * w.speed) * w.amp
                               + Math.sin(x * w.freq * 2 + t * w.speed * 1.5) * (w.amp * 0.4);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = w.color;
      ctx.lineWidth   = 1.5;
      ctx.globalAlpha = w.alpha * 3;
      ctx.shadowColor = w.color;
      ctx.shadowBlur  = 12;
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.globalAlpha = 1;
    });
  }

  /* ══════════════════════════════════════════════════════════════
     4. STAR DOTS (depth layer)
  ══════════════════════════════════════════════════════════════ */
  const STAR_COUNT = 120;
  let stars = [];

  class Star {
    constructor() {
      this.x     = rand(0, W);
      this.y     = rand(0, H);
      this.r     = rand(0.3, 1.2);
      this.alpha = rand(0.1, 0.6);
      this.twinkle = rand(0, Math.PI * 2);
      this.twinkleSpeed = rand(0.01, 0.04);
    }
    update() { this.twinkle += this.twinkleSpeed; }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.alpha * (0.5 + 0.5 * Math.sin(this.twinkle));
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     5. MOVING GRID
  ══════════════════════════════════════════════════════════════ */
  let gridOffset = 0;
  function drawGrid(t) {
    const spacing = 60;
    const shift   = (t * 0.3) % spacing;
    ctx.strokeStyle = 'rgba(108,99,255,0.04)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    for (let x = -spacing + shift; x < W + spacing; x += spacing) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
    }
    for (let y = -spacing + shift; y < H + spacing; y += spacing) {
      ctx.moveTo(0, y); ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  /* ══════════════════════════════════════════════════════════════
     6. FLOATING ICONS
  ══════════════════════════════════════════════════════════════ */
  const ICONS = ['📚','💻','⚡','🔮','📊','🌐','⚙️','🔬'];
  let floatIcons = [];

  class FloatIcon {
    constructor() { this.reset(true); }
    reset(init) {
      this.icon  = pick(ICONS);
      this.x     = rand(0, W);
      this.y     = init ? rand(0, H) : H + 60;
      this.size  = rand(14, 28);
      this.alpha = rand(0.04, 0.12);
      this.vy    = rand(-0.2, -0.06);
      this.vx    = rand(-0.1, 0.1);
      this.rot   = rand(0, Math.PI * 2);
      this.rotV  = rand(-0.005, 0.005);
    }
    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.rotV;
      if (this.y < -60) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.globalAlpha = this.alpha;
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.icon, 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     7. MOUSE GLOW CURSOR
  ══════════════════════════════════════════════════════════════ */
  function drawMouseGlow() {
    if (!mouse.active) return;
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
    grad.addColorStop(0, 'rgba(108,99,255,0.12)');
    grad.addColorStop(0.5, 'rgba(108,99,255,0.04)');
    grad.addColorStop(1, 'rgba(108,99,255,0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  /* ── Init all arrays ──────────────────────────────────────────── */
  function initAll() {
    particles  = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    circuits   = Array.from({ length: CIRCUIT_COUNT  }, () => new Circuit());
    stars      = Array.from({ length: STAR_COUNT      }, () => new Star());
    floatIcons = Array.from({ length: 12              }, () => new FloatIcon());
  }
  initAll();

  /* ── Main render loop ─────────────────────────────────────────── */
  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);

    // Layer 1 — grid
    drawGrid(t);

    // Layer 2 — stars
    stars.forEach(s => { s.update(); s.draw(); });

    // Layer 3 — waves
    drawWaves(t);

    // Layer 4 — circuits
    circuits.forEach(c => { c.update(); c.draw(); });

    // Layer 5 — floating icons
    floatIcons.forEach(f => { f.update(); f.draw(); });

    // Layer 6 — particles
    // Draw connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#6c63ff';
          ctx.globalAlpha = (1 - dist / 100) * 0.15;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    particles.forEach(p => { p.update(); p.draw(); });

    // Layer 7 — mouse glow
    drawMouseGlow();

    t++;
    requestAnimationFrame(loop);
  }
  loop();

})();
