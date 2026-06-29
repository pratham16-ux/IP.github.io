/* =========================================================
   STACKLY IP — main.js (Emerald edition)
   ========================================================= */
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(pointer: fine)').matches;
  const body = document.body;

  /* ---------- Global animated background ---------- */
  const bg = document.createElement('div');
  bg.className = 'site-bg';
  if (!reduceMotion) bg.innerHTML = '<span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span>';
  body.prepend(bg);

  /* ---------- Scroll progress + cursor glow ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  body.appendChild(progress);
  let glow = null;
  if (finePointer && !reduceMotion) {
    glow = document.createElement('div');
    glow.className = 'cursor-glow';
    body.appendChild(glow);
  }

  /* ---------- Full-screen mobile navigation ---------- */
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  const openNav = () => { body.classList.add('nav-open'); body.style.overflow = 'hidden'; if (burger) burger.setAttribute('aria-expanded', 'true'); };
  const closeNav = () => { body.classList.remove('nav-open'); body.style.overflow = ''; if (burger) burger.setAttribute('aria-expanded', 'false'); };
  if (burger) burger.addEventListener('click', () => body.classList.contains('nav-open') ? closeNav() : openNav());
  if (mobileNav) mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (window.innerWidth > 860) closeNav(); }, 120); });

  /* ---------- Header shadow + progress ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    const st = window.scrollY;
    if (header) header.classList.toggle('scrolled', st > 12);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Cursor glow ---------- */
  if (glow) {
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, shown = false;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!shown) { glow.style.opacity = '1'; shown = true; } }, { passive: true });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; shown = false; });
    (function loop() { cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; glow.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
  }

  /* ---------- Rotating hero word ---------- */
  const rotator = document.querySelector('.rotator');
  if (rotator) {
    const words = [...rotator.querySelectorAll('.rw')];
    let i = 0;
    if (!reduceMotion && words.length > 1) {
      setInterval(() => { words[i].classList.remove('active'); i = (i + 1) % words.length; words[i].classList.add('active'); rotator.setAttribute('aria-label', words[i].textContent); }, 2200);
    }
  }

  /* ---------- Scroll reveal (auto-stagger) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (!/d[1-4]/.test(en.target.className)) {
            const sibs = [...en.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
            const idx = sibs.indexOf(en.target);
            if (idx > 0) en.target.style.transitionDelay = Math.min(idx * 0.07, 0.42) + 's';
          }
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else { reveals.forEach((el) => el.classList.add('in')); }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', dur = 1600, start = performance.now();
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- 3D tilt + glare ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.p-card, .member, .quote').forEach((card) => {
      if (!card.querySelector('.glare')) { const g = document.createElement('span'); g.className = 'glare'; card.appendChild(g); }
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(800px) rotateY(${(px - 0.5) * 7}deg) rotateX(${(0.5 - py) * 7}deg) translateY(-6px)`;
        card.style.setProperty('--mx', px * 100 + '%'); card.style.setProperty('--my', py * 100 + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3 - 3}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq')?.querySelectorAll('.faq-item.open').forEach((o) => { if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false'); } });
      item.classList.toggle('open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Footer year ---------- */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    const nameEl = form.querySelector('#name'), phoneEl = form.querySelector('#phone'), emailEl = form.querySelector('#email');
    const success = form.querySelector('.form-success');
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (nameEl) nameEl.addEventListener('input', () => { nameEl.value = nameEl.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 16); });
    if (phoneEl) phoneEl.addEventListener('input', () => { phoneEl.value = phoneEl.value.replace(/\D/g, '').slice(0, 10); });
    const setErr = (f, on) => f.closest('.field').classList.toggle('invalid', on);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      if (!nameEl.value.trim() || nameEl.value.trim().length < 2) { setErr(nameEl, true); ok = false; } else setErr(nameEl, false);
      if (!emailRe.test(emailEl.value.trim())) { setErr(emailEl, true); ok = false; } else setErr(emailEl, false);
      if (phoneEl.value.length !== 10) { setErr(phoneEl, true); ok = false; } else setErr(phoneEl, false);
      const m = form.querySelector('#matter'); if (m && !m.value) { setErr(m, true); ok = false; } else if (m) setErr(m, false);
      const msg = form.querySelector('#message'); if (msg && msg.value.trim().length < 10) { setErr(msg, true); ok = false; } else if (msg) setErr(msg, false);
      if (ok) { form.reset(); if (success) { success.classList.add('show'); success.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => success.classList.remove('show'), 6000); } }
      else { const f = form.querySelector('.field.invalid'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }
})();