const callbackModal = document.querySelector('[data-callback-modal]');
const callbackOpen = document.querySelector('[data-open-callback]');
const callbackClose = document.querySelector('[data-close-callback]');
const callbackForm = document.querySelector('[data-callback-form]');

if (callbackModal && callbackOpen && callbackClose && callbackForm) {
  callbackOpen.addEventListener('click', () => {
    callbackModal.classList.remove('is-success');
    callbackForm.reset();
    callbackModal.showModal();
    callbackModal.querySelector('input[name="name"]').focus();
  });

  callbackClose.addEventListener('click', () => callbackModal.close());

  callbackModal.addEventListener('click', (event) => {
    if (event.target === callbackModal) callbackModal.close();
  });

  callbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!callbackForm.reportValidity()) return;
    callbackModal.classList.add('is-success');
    callbackModal.querySelector('[data-close-callback]').focus();
  });
}
