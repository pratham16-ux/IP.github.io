/* Stackly IP — dashboard (shared by client & attorney) */
(function () {
  'use strict';
  const body = document.body;
  const pageRole = body.dataset.role; // 'client' | 'attorney'

  /* ---- Auth guard ---- */
  let auth = null;
  try { auth = JSON.parse(sessionStorage.getItem('stacklyAuth')); } catch (e) {}
  if (!auth || !auth.email) { window.location.replace('signin.html'); return; }
  if (auth.role !== pageRole) { window.location.replace('dashboard-' + auth.role + '.html'); return; }

  /* ---- Render user ---- */
  const initials = (auth.name || auth.email).trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  document.querySelectorAll('[data-user-email]').forEach((el) => el.textContent = auth.email);
  document.querySelectorAll('[data-user-name]').forEach((el) => el.textContent = auth.name || 'Member');
  document.querySelectorAll('[data-user-initials]').forEach((el) => el.textContent = initials);
  document.querySelectorAll('[data-user-role]').forEach((el) => el.textContent = auth.role === 'attorney' ? 'Attorney' : 'Client');

  /* ---- Sidebar nav switching ---- */
  const navLinks = document.querySelectorAll('.snav a');
  const panels = document.querySelectorAll('.panel');
  const title = document.querySelector('.t-title');
  const showPanel = (id) => {
    panels.forEach((p) => p.classList.toggle('show', p.id === 'panel-' + id));
    navLinks.forEach((a) => a.classList.toggle('active', a.dataset.panel === id));
    const active = [...navLinks].find((a) => a.dataset.panel === id);
    if (active && title) title.textContent = active.dataset.title || active.textContent.trim();
    // animate counters & progress in the panel
    runCounters(document.getElementById('panel-' + id));
    runProgress(document.getElementById('panel-' + id));
    closeSide();
  };
  navLinks.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); showPanel(a.dataset.panel); }));

  /* ---- Mobile sidebar ---- */
  const openSide = () => body.classList.add('side-open');
  const closeSide = () => body.classList.remove('side-open');
  const tMenu = document.querySelector('.t-menu');
  const sClose = document.querySelector('.side-close');
  const scrim = document.querySelector('.scrim-d');
  if (tMenu) tMenu.addEventListener('click', openSide);
  if (sClose) sClose.addEventListener('click', closeSide);
  if (scrim) scrim.addEventListener('click', closeSide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSide(); closeModal(); } });

  /* ---- Counters ---- */
  function runCounters(scope) {
    if (!scope) return;
    scope.querySelectorAll('[data-count]').forEach((el) => {
      if (el.dataset.done) return; el.dataset.done = '1';
      const target = parseFloat(el.dataset.count), prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '', dur = 1100, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target % 1 === 0 ? Math.round(target * e) : (target * e).toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }
  function runProgress(scope) {
    if (!scope) return;
    scope.querySelectorAll('.progress-line span').forEach((s) => { const w = s.dataset.w || '0'; requestAnimationFrame(() => { s.style.width = w + '%'; }); });
  }

  /* ---- Filters ---- */
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const chips = group.querySelectorAll('.chip');
    const listSel = group.dataset.target;
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.toggle('on', c === chip));
      const f = chip.dataset.filter;
      document.querySelectorAll(listSel + ' [data-status]').forEach((item) => {
        item.classList.toggle('hidden', !(f === 'all' || item.dataset.status === f));
      });
    }));
  });

  /* ---- Toast ---- */
  let toastWrap = document.querySelector('.toast-wrap');
  if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; body.appendChild(toastWrap); }
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="tk">✓</span>' + msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
  }

  /* ---- Generic action buttons ---- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const a = btn.dataset.action;
    if (a === 'pay') toast('Payment link sent — pay via UPI or card.');
    else if (a === 'download') toast('Document download started.');
    else if (a === 'track') toast('Opening matter timeline…');
    else if (a === 'view') toast('Opening details…');
    else if (a === 'message') toast('Message thread opened.');
    else if (a === 'done') {
      const row = btn.closest('.matter'); if (row) { row.classList.toggle('done'); btn.textContent = row.classList.contains('done') ? 'Undo' : 'Mark done'; toast(row.classList.contains('done') ? 'Marked as done.' : 'Reopened.'); }
    }
  });

  /* ---- Modal ---- */
  const modal = document.querySelector('.modal');
  function openModal() { if (modal) modal.classList.add('open'); }
  function closeModal() { if (modal) modal.classList.remove('open'); }
  document.querySelectorAll('[data-modal-open]').forEach((b) => b.addEventListener('click', openModal));
  if (modal) {
    modal.querySelector('.mbg')?.addEventListener('click', closeModal);
    modal.querySelector('.mclose')?.addEventListener('click', closeModal);
    const mform = modal.querySelector('form');
    if (mform) mform.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = mform.querySelector('[name="title"]');
      if (title && !title.value.trim()) { title.closest('.fld').classList.add('invalid'); return; }
      closeModal(); mform.reset();
      toast('New request submitted — we\'ll be in touch.');
    });
  }

  /* ---- Bell ---- */
  document.querySelector('.t-bell')?.addEventListener('click', () => { toast('No new notifications.'); document.querySelector('.t-bell .dot')?.remove(); });

  /* ---- Profile form ---- */
  const pform = document.getElementById('profileForm');
  if (pform) {
    const nameEl = pform.querySelector('#pname'), phoneEl = pform.querySelector('#pphone'), emailEl = pform.querySelector('#pemail');
    if (emailEl) emailEl.value = auth.email;
    if (nameEl) { nameEl.value = auth.name || ''; nameEl.addEventListener('input', () => nameEl.value = nameEl.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 16)); }
    if (phoneEl) phoneEl.addEventListener('input', () => phoneEl.value = phoneEl.value.replace(/\D/g, '').slice(0, 10));
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    pform.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const setErr = (el, on) => el.closest('.fld').classList.toggle('invalid', on);
      if (!nameEl.value.trim()) { setErr(nameEl, true); ok = false; } else setErr(nameEl, false);
      if (phoneEl.value.length !== 10) { setErr(phoneEl, true); ok = false; } else setErr(phoneEl, false);
      if (!emailRe.test(emailEl.value.trim())) { setErr(emailEl, true); ok = false; } else setErr(emailEl, false);
      if (!ok) return;
      auth.name = nameEl.value.trim(); auth.email = emailEl.value.trim();
      try { sessionStorage.setItem('stacklyAuth', JSON.stringify(auth)); } catch (e) {}
      document.querySelectorAll('[data-user-email]').forEach((el) => el.textContent = auth.email);
      document.querySelectorAll('[data-user-name]').forEach((el) => el.textContent = auth.name);
      toast('Profile saved.');
    });
  }

  /* ---- Logout ---- */
  document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', () => {
    try { sessionStorage.removeItem('stacklyAuth'); } catch (e) {}
    window.location.href = 'signin.html';
  }));

  /* ---- Init ---- */
  showPanel('overview');
})();