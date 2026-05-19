# V Repairs (Pty) Ltd — Website Deployment Guide

## Files Overview

```
index.html     ← Main one-page website (HTML)
style.css      ← All styles
main.js        ← Navigation, form validation, scroll animations
contact.php    ← Contact form backend (email handler)
README.md      ← This file
```

---

## 🖥️ Option 1: Shared Hosting (Recommended — e.g. Afrihost, Xneelo, Hetzner)

This is the simplest route and works with most South African hosting providers.

### Steps:

1. **Log into your hosting control panel** (cPanel or similar).
2. **Upload all 4 files** (`index.html`, `style.css`, `main.js`, `contact.php`) into the `public_html` folder using File Manager or FTP (FileZilla is free).
3. **Open your website** in a browser — it should display immediately.
4. **Test the contact form** — fill in the form and submit. You should receive an email at veclet@outlook.com.

### If emails aren't arriving:
- Check your **spam/junk folder** first.
- Your host's PHP `mail()` function may be restricted. In that case, use **PHPMailer via SMTP** (see the comment block in `contact.php`) — it's more reliable.
- For PHPMailer: Download it from https://github.com/PHPMailer/PHPMailer, upload the `/src/` folder next to `contact.php`, then uncomment the PHPMailer block in `contact.php`.

---

## 🌐 Option 2: Local Testing (XAMPP / MAMP / Laragon)

Use this to preview the site on your computer before going live.

### Steps (XAMPP):
1. Download XAMPP: https://www.apachefriends.org
2. Install and start **Apache** from the XAMPP Control Panel.
3. Copy all website files into `C:\xampp\htdocs\vrepairs\` (Windows) or `/Applications/XAMPP/htdocs/vrepairs/` (Mac).
4. Open your browser and visit: `http://localhost/vrepairs/`

> **Note:** The contact form won't send real emails locally unless you configure an SMTP mailer. For local testing, just check the browser console — a network error on form submit is normal without a PHP server.

---

## 🔒 Security Notes

- The contact form includes:
  - **Server-side validation** (PHP)
  - **Honeypot field** (catches most bots)
  - **Session-based rate limiting** (max 5 submissions/hour)
  - **Input sanitisation** (strips HTML tags, encodes special characters)
- HTTPS is strongly recommended — most South African hosts offer free SSL via Let's Encrypt.

---

## ✏️ Easy Customisations

| What to change | Where |
|---|---|
| Phone number | Search & replace `+27785478424` in `index.html` |
| Email address | Search & replace `veclet@outlook.com` in `index.html` + `contact.php` |
| Address | Search for `103 Alexandra Street` in `index.html` |
| Brand colors | Edit CSS variables at top of `style.css` (`:root` block) |
| Working hours | Footer section in `index.html` |
| Instagram link | Search for `instagram.com` in `index.html` and update the `href` |

---

## 📦 Optional Enhancements (Future)

- **Google Analytics** — add the GA4 snippet before `</head>` in `index.html`
- **Google Maps embed** — replace the address in the contact section with an iframe
- **WhatsApp Business** — update the WhatsApp links to use your Business number
- **Custom domain** — point your domain's DNS A-record to your hosting IP
- **Formspree fallback** — if PHP mail fails, replace `contact.php` with a Formspree endpoint (free tier: 50 submissions/month): change `action="contact.php"` to `action="https://formspree.io/f/YOUR_ID"`

---

## 📞 Support

For help deploying, contact your hosting provider's support team — Afrihost, Xneelo, and Hetzner all offer excellent South African support.

---

*V Repairs — Safe Power. Smart Solar. Real Professionals. ⚡*
