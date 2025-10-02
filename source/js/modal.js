const modal = document.getElementById('myModal');
const openBtn = document.querySelector('.js-questions');
const closeBtn = modal?.querySelector('.close');

if (modal && openBtn && closeBtn) {
  const openedClass = 'is-open';
  let lastFocused = null;

  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };

  const open = () => {
    lastFocused = document.activeElement;
    modal.classList.add(openedClass);
    modal.style.display = 'block';
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  };

  const close = () => {
    modal.classList.remove(openedClass);
    modal.style.display = 'none';
    document.removeEventListener('keydown', onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (!e.target.closest('.modal-content')) close();
  });
}