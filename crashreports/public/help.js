// Copy buttons on the help page: <button data-copy="<id of the code element>">.
'use strict';

document.addEventListener('click', async (ev) => {
  const btn = ev.target instanceof Element ? ev.target.closest('button[data-copy]') : null;
  if (!btn) return;
  const code = document.getElementById(btn.getAttribute('data-copy'));
  if (!code) return;
  const toast = document.getElementById('toast');
  const say = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'show';
    setTimeout(() => (toast.className = ''), 3000);
  };
  try {
    await navigator.clipboard.writeText(code.textContent);
    say('Copied');
  } catch {
    getSelection().selectAllChildren(code);
    say('Press Ctrl+C to copy the selection');
  }
});
