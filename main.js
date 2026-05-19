/* ============================================================
   V REPAIRS (PTY) LTD — MAIN.JS
   Handles: nav, form validation, scroll animations, year
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── DOM Ready ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollAnimations();
    initContactForm();
    initYear();
  });

  /* ── 1. Navigation ───────────────────────────────────────── */
  function initNav() {
    const hamburger = $('#hamburger');
    const mobileMenu = $('#mobileMenu');
    const mobileLinks = $$('.mobile-link');
    const navWrap = $('.nav-wrap');

    // Toggle mobile menu
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
      });

      // Close on link click
      mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (!navWrap.contains(e.target)) closeMenu();
      });
    }

    function closeMenu() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }

    // Highlight active nav link on scroll
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links a');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));
  }

  /* ── 2. Scroll-triggered Fade Animations ─────────────────── */
  function initScrollAnimations() {
    const els = $$('.fade-in-scroll, .fade-in-scroll-delay');
    if (!els.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target); // run once
        }
      });
    }, { threshold: 0.15 });

    els.forEach(el => io.observe(el));
  }

  /* ── 3. Contact Form ──────────────────────────────────────── */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const submitBtn = $('#submitBtn');
    const formSuccess = $('#formSuccess');
    const formErrorMsg = $('#formErrorMsg');

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Clear previous messages
      formSuccess.classList.remove('show');
      formErrorMsg.classList.remove('show');

      // Validate
      if (!validateForm(form)) return;

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        /* 
          PRODUCTION: Sends to contact.php on the server.
          The fetch uses FormData, which contact.php reads via $_POST.
          
          For local testing without PHP:
          - The catch block will handle the network error gracefully.
          - Or use a service like Formspree.io (free tier available).
        */
        const formData = new FormData(form);

        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success!
          form.reset();
          formSuccess.classList.add('show');
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error(result.message || 'Server error');
        }

      } catch (err) {
        console.error('Form submission error:', err);
        formErrorMsg.classList.add('show');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    // Live validation on blur
    const requiredFields = $$('[required]', form);
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });
  }

  /* ── Form Validation ──────────────────────────────────────── */
  function validateForm(form) {
    let valid = true;

    // Name
    const name = $('#name');
    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'nameError', 'Please enter your full name (at least 2 characters).');
      valid = false;
    } else {
      clearError(name, 'nameError');
    }

    // Phone
    const phone = $('#phone');
    const phoneVal = phone.value.trim().replace(/[\s\-\(\)]/g, '');
    if (!phoneVal || phoneVal.length < 9) {
      showError(phone, 'phoneError', 'Please enter a valid phone number.');
      valid = false;
    } else {
      clearError(phone, 'phoneError');
    }

    // Email (optional, but validate format if given)
    const email = $('#email');
    if (email.value.trim() && !isValidEmail(email.value.trim())) {
      showError(email, 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(email, 'emailError');
    }

    // Message
    const message = $('#message');
    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'messageError', 'Please enter a message (at least 10 characters).');
      valid = false;
    } else {
      clearError(message, 'messageError');
    }

    // Honeypot check (anti-spam)
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value) {
      console.log('Spam detected.');
      return false;
    }

    return valid;
  }

  function validateField(field) {
    const errorId = field.id + 'Error';
    if (field.id === 'name') {
      if (!field.value.trim() || field.value.trim().length < 2) {
        showError(field, errorId, 'Please enter your full name.');
      } else clearError(field, errorId);
    }
    if (field.id === 'phone') {
      const val = field.value.trim().replace(/[\s\-\(\)]/g, '');
      if (!val || val.length < 9) showError(field, errorId, 'Please enter a valid phone number.');
      else clearError(field, errorId);
    }
    if (field.id === 'message') {
      if (!field.value.trim() || field.value.trim().length < 10) {
        showError(field, errorId, 'Please enter a message.');
      } else clearError(field, errorId);
    }
  }

  function showError(field, errorId, msg) {
    field.classList.add('invalid');
    const el = document.getElementById(errorId);
    if (el) el.textContent = msg;
  }

  function clearError(field, errorId) {
    field.classList.remove('invalid');
    const el = document.getElementById(errorId);
    if (el) el.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ── 4. Footer Year ───────────────────────────────────────── */
  function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

})();
