const callbackModal = document.querySelector('[data-callback-modal]');
const callbackOpen = document.querySelectorAll('[data-open-callback]');
const callbackClose = document.querySelector('[data-close-callback]');
const callbackForm = document.querySelector('[data-callback-form]');
const callbackEndpoint = 'https://platform.alcan.by/api/landing/contact-request';
const turnstileSiteKey = '0x4AAAAAAC9RksUVqy60KNZ3';

if (callbackModal && callbackOpen.length && callbackClose && callbackForm) {
  const closeButton = callbackModal.querySelector('[data-close-callback]');
  const submitButton = callbackForm.querySelector('.callback-submit');
  const status = callbackForm.querySelector('[data-callback-status]');
  const turnstileBox = callbackForm.querySelector('[data-turnstile]');
  let turnstileWidgetId = null;
  let turnstileToken = '';

  const setStatus = (message, type = '') => {
    status.hidden = !message;
    status.textContent = message;
    status.className = `callback-status${type ? ` is-${type}` : ''}`;
  };

  const ensureTurnstile = (attempt = 0) => {
    if (!turnstileBox) return;
    if (turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
      turnstileToken = '';
      return;
    }
    if (!window.turnstile) {
      if (attempt < 50) setTimeout(() => ensureTurnstile(attempt + 1), 200);
      else setStatus('Не удалось загрузить проверку безопасности. Обновите страницу.', 'error');
      return;
    }
    turnstileWidgetId = window.turnstile.render(turnstileBox, {
      sitekey: turnstileSiteKey,
      language: 'ru',
      callback: (token) => { turnstileToken = token; },
      'expired-callback': () => { turnstileToken = ''; },
      'error-callback': () => { turnstileToken = ''; }
    });
  };

  const resetTurnstile = () => {
    turnstileToken = '';
    if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
  };

  const phoneInput = callbackForm.elements.phone;
  const formatPhone = () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('375')) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    phoneInput.value = `+375${digits}`;
    phoneInput.setCustomValidity(digits.length === 9 ? '' : 'Введите номер в формате +375XXXXXXXXX');
  };
  phoneInput.addEventListener('focus', formatPhone);
  phoneInput.addEventListener('input', formatPhone);
  phoneInput.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && phoneInput.selectionStart <= 4 && phoneInput.selectionEnd <= 4) event.preventDefault();
  });

  callbackOpen.forEach((openButton) => openButton.addEventListener('click', () => {
    callbackModal.classList.remove('is-success');
    callbackForm.reset();
    callbackForm.elements.sourcePage.value = window.location.pathname;
    submitButton.disabled = false;
    setStatus('');
    callbackModal.showModal();
    ensureTurnstile();
    callbackModal.querySelector('input[name="name"]').focus();
  }));

  callbackClose.addEventListener('click', () => callbackModal.close());
  callbackModal.addEventListener('click', (event) => {
    if (event.target === callbackModal) callbackModal.close();
  });

  callbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!callbackForm.reportValidity()) return;
    if (!turnstileToken) {
      setStatus('Подтвердите, что вы не робот.', 'error');
      return;
    }

    const formData = new FormData(callbackForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      sourcePage: String(formData.get('sourcePage') || window.location.pathname),
      website: String(formData.get('website') || ''),
      captchaToken: turnstileToken
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
        let message = Array.isArray(result.message) ? result.message.join(', ') : result.message;
        if (response.status === 403) message = message || 'Проверка безопасности не пройдена. Попробуйте ещё раз.';
        if (response.status === 429) message = 'Слишком много заявок. Попробуйте через минуту.';
        throw new Error(message);
      }
      callbackModal.classList.add('is-success');
      setStatus('');
      closeButton.focus();
    } catch (error) {
      setStatus(error.message || 'Не удалось отправить заявку. Попробуйте позже.', 'error');
      submitButton.disabled = false;
      resetTurnstile();
    }
  });
}
