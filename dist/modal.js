const callbackModal = document.querySelector('[data-callback-modal]');
const callbackOpen = document.querySelector('[data-open-callback]');
const callbackClose = document.querySelector('[data-close-callback]');
const callbackForm = document.querySelector('[data-callback-form]');
const callbackEndpoint = '/api/contact-request';

if (callbackModal && callbackOpen && callbackClose && callbackForm) {
  const closeButton = callbackModal.querySelector('[data-close-callback]');
  const submitButton = callbackForm.querySelector('.callback-submit');
  const status = callbackForm.querySelector('[data-callback-status]');

  const setStatus = (message, type = '') => {
    status.hidden = !message;
    status.textContent = message;
    status.className = `callback-status${type ? ` is-${type}` : ''}`;
  };

  callbackOpen.addEventListener('click', () => {
    callbackModal.classList.remove('is-success');
    callbackForm.reset();
    callbackForm.elements.sourcePage.value = window.location.pathname;
    submitButton.disabled = false;
    setStatus('');
    callbackModal.showModal();
    callbackModal.querySelector('input[name="name"]').focus();
  });

  callbackClose.addEventListener('click', () => callbackModal.close());
  callbackModal.addEventListener('click', (event) => {
    if (event.target === callbackModal) callbackModal.close();
  });

  callbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!callbackForm.reportValidity()) return;

    const formData = new FormData(callbackForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      sourcePage: String(formData.get('sourcePage') || window.location.pathname),
      website: String(formData.get('website') || '')
    };

    submitButton.disabled = true;
    setStatus('Отправляем…');

    try {
      const response = await fetch(callbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message);
      }
      callbackModal.classList.add('is-success');
      setStatus('');
      closeButton.focus();
    } catch (error) {
      setStatus(error.message || 'Не удалось отправить заявку. Попробуйте позже.', 'error');
      submitButton.disabled = false;
    }
  });
}
