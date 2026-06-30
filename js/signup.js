/* Stackly IP — sign-up */
(function () {
  'use strict';
  const toggle = document.querySelector('.role-toggle');
  const form = document.getElementById('signupForm');
  if (!form) return;
  let role = 'client';

  toggle.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      role = b.dataset.role;
      toggle.dataset.role = role;
      toggle.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    });
  });

  const pw = form.querySelector('#password');
  const pwToggle = form.querySelector('.pw-toggle');
  if (pwToggle) pwToggle.addEventListener('click', () => {
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    pwToggle.textContent = show ? 'Hide' : 'Show';
  });

  const nameEl = form.querySelector('#name');
  const emailEl = form.querySelector('#email');
  const phoneEl = form.querySelector('#phone');
  const confirmEl = form.querySelector('#confirm');
  const termsEl = form.querySelector('#terms');
  const termsFld = document.getElementById('termsErr').closest('.fld');
  const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Live filters (Stackly standard)
  nameEl.addEventListener('input', () => { nameEl.value = nameEl.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 16); });
  phoneEl.addEventListener('input', () => { phoneEl.value = phoneEl.value.replace(/\D/g, '').slice(0, 10); });

  const setErr = (el, on) => el.closest('.fld').classList.toggle('invalid', on);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    if (nameEl.value.trim().length < 2) { setErr(nameEl, true); ok = false; } else setErr(nameEl, false);
    if (!emailRe.test(emailEl.value.trim())) { setErr(emailEl, true); ok = false; } else setErr(emailEl, false);
    if (phoneEl.value.length !== 10) { setErr(phoneEl, true); ok = false; } else setErr(phoneEl, false);
    if (pw.value.length < 6) { setErr(pw, true); ok = false; } else setErr(pw, false);
    if (confirmEl.value !== pw.value || !confirmEl.value) { setErr(confirmEl, true); ok = false; } else setErr(confirmEl, false);
    if (!termsEl.checked) { termsFld.classList.add('invalid'); ok = false; } else termsFld.classList.remove('invalid');

    if (!ok) { const f = form.querySelector('.fld.invalid input'); if (f) f.focus(); return; }

    const auth = { role, email: emailEl.value.trim(), name: nameEl.value.trim().slice(0, 24), loginAt: new Date().toISOString() };
    try { sessionStorage.setItem('stacklyAuth', JSON.stringify(auth)); } catch (e) {}

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Creating account…';
    setTimeout(() => { window.location.href = role === 'attorney' ? 'dashboard-attorney.html' : 'dashboard-client.html'; }, 600);
  });
})();