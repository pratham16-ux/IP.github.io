/* Stackly IP — sign-in */
(function () {
  'use strict';
  const toggle = document.querySelector('.role-toggle');
  const form = document.getElementById('signinForm');
  if (!form) return;
  let role = 'client';

  // Role toggle
  toggle.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      role = b.dataset.role;
      toggle.dataset.role = role;
      toggle.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    });
  });

  // Password visibility
  const pw = form.querySelector('#password');
  const pwToggle = form.querySelector('.pw-toggle');
  if (pwToggle) pwToggle.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? 'Hide' : 'Show';
  });

  const emailEl = form.querySelector('#email');
  const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const setErr = (el, on) => el.closest('.fld').classList.toggle('invalid', on);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    if (!emailRe.test(emailEl.value.trim())) { setErr(emailEl, true); ok = false; } else setErr(emailEl, false);
    if (pw.value.length < 6) { setErr(pw, true); ok = false; } else setErr(pw, false);
    if (!ok) { const f = form.querySelector('.fld.invalid input'); if (f) f.focus(); return; }

    const email = emailEl.value.trim();
    const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    const name = local.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 24) || 'Member';
    const auth = { role, email, name, loginAt: new Date().toISOString() };
    try { sessionStorage.setItem('stacklyAuth', JSON.stringify(auth)); } catch (e) {}

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Signing in…';
    setTimeout(() => { window.location.href = role === 'attorney' ? 'attorney-dashboard.html' : 'client-dashboard.html'; }, 550);
  });
})();