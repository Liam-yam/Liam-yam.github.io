const typedEl = document.getElementById('typed-name');
const words = ['Liam Palomo', 'AI Engineer', 'Network Architect'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const current = words[wordIndex];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      setTimeout(() => { isDeleting = true; typeLoop(); }, 4000);
      return;
    }
    setTimeout(typeLoop, 80);
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeLoop, 400);
      return;
    }
    setTimeout(typeLoop, 45);
  }
}
setTimeout(typeLoop, 600);

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => revealObserver.observe(el));

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[data-section="${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTopBtn.classList.toggle('show', window.scrollY > 400);
});
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const contactForm = document.querySelector('#contact form');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.btn-send');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const data = new FormData(contactForm);
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        showToast('✅ Message sent! I\'ll get back to you soon.');
        contactForm.reset();
      } else {
        showToast('❌ Something went wrong. Try again.');
      }
    } catch (err) {
      showToast('❌ Network error. Check your connection.');
    }

    submitBtn.textContent = 'Send Message';
    submitBtn.disabled = false;
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #00c885; color: #0d0d0d; font-weight: 600;
    padding: 14px 28px; border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0,200,133,0.4);
    z-index: 9999; font-size: 15px;
    animation: fadeInUp 0.4s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}