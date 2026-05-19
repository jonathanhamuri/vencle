const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const yearEl = document.getElementById('year');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessages();

    if (!validateContactForm()) {
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        contactForm.reset();
        formSuccess.classList.add('show');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        formError.textContent = result.message || 'Something went wrong. Please try again.';
        formError.classList.add('show');
      }
    } catch (error) {
      formError.classList.add('show');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

function validateContactForm() {
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  let valid = true;

  clearFieldError(name, 'nameError');
  clearFieldError(phone, 'phoneError');
  clearFieldError(email, 'emailError');
  clearFieldError(message, 'messageError');

  if (!name.value.trim() || name.value.trim().length < 2) {
    setFieldError(name, 'nameError', 'Please enter your name.');
    valid = false;
  }

  const phoneValue = phone.value.trim().replace(/[\s\-()]/g, '');
  if (!phoneValue || phoneValue.length < 9) {
    setFieldError(phone, 'phoneError', 'Please enter a valid phone number.');
    valid = false;
  }

  if (email.value.trim() && !isValidEmail(email.value.trim())) {
    setFieldError(email, 'emailError', 'Please enter a valid email address.');
    valid = false;
  }

  if (!message.value.trim() || message.value.trim().length < 10) {
    setFieldError(message, 'messageError', 'Please enter a message.');
    valid = false;
  }

  return valid;
}

function setFieldError(input, errorId, message) {
  const error = document.getElementById(errorId);
  if (error) error.textContent = message;
  input?.classList.add('invalid');
}

function clearFieldError(input, errorId) {
  const error = document.getElementById(errorId);
  if (error) error.textContent = '';
  input?.classList.remove('invalid');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hideMessages() {
  formSuccess?.classList.remove('show');
  formError?.classList.remove('show');
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
