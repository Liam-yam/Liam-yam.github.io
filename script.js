const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}, { passive: true });

function runHeroEntrance() {
  const greeting  = document.querySelector('.hero-greeting');
  const heroName  = document.querySelector('.hero-name');
  const subtitle  = document.querySelector('.hero-subtitle');
  const ctaBtn    = document.querySelector('.btn-contact-me');
  const infoItems = document.querySelectorAll('#home .d-flex.flex-wrap > div');
  const photo     = document.querySelector('.hero-photo');
  const orbs      = document.querySelectorAll('.hero-orb');

  [greeting, heroName, subtitle, ctaBtn, photo].forEach(el => { if (el) el.classList.add('hero-hidden'); });
  infoItems.forEach(el => { if (el) el.classList.add('hero-hidden'); });
  orbs.forEach(el => { el.style.opacity = '0'; });

  [greeting, heroName, subtitle, ctaBtn].forEach((el, i) => {
    if (!el) return;
    setTimeout(() => el.classList.add('hero-enter'), [200, 400, 580, 750][i]);
  });

  infoItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('hero-enter'), 900 + i * 120);
  });

  setTimeout(() => { if (photo) photo.classList.add('hero-enter'); }, 500);

  setTimeout(() => {
    orbs.forEach((orb, i) => {
      setTimeout(() => {
        orb.style.transition = 'opacity 1.4s ease';
        orb.style.opacity = '1';
      }, i * 200);
    });
  }, 300);
}

window.addEventListener('DOMContentLoaded', () => { setTimeout(runHeroEntrance, 80); });

(function () {
  const section = document.getElementById('home');
  const photo   = document.querySelector('.hero-photo');
  if (!section || !photo) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = null;

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    targetX = ((e.clientX - rect.left - rect.width  / 2) / rect.width)  * 14;
    targetY = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * 10;
    if (!rafId) rafId = requestAnimationFrame(lerp);
  });

  section.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(lerp);
  });

  function lerp() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    photo.style.transform = `translate(${currentX}px, ${currentY}px)`;
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      rafId = requestAnimationFrame(lerp);
    } else {
      photo.style.transform = `translate(${targetX}px, ${targetY}px)`;
      rafId = null;
    }
  }
})();

function applyMagnet(selector) {
  document.querySelectorAll(selector).forEach(btn => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.30;
      const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.30;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.45s cubic-bezier(0.23,1,0.32,1), opacity 0.2s, box-shadow 0.2s';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.12s ease, opacity 0.2s, box-shadow 0.2s';
    });
  });
}

applyMagnet('.btn-contact-me');
applyMagnet('.btn-download-cv');
applyMagnet('.btn-send');

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return;
  const TILT = 8;
  function attachTilt(selector) {
    document.querySelectorAll(selector).forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transition = 'transform 0.08s ease';
        card.style.transform = `perspective(800px) rotateX(${-y * TILT}deg) rotateY(${x * TILT}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease, border-color 0.3s ease';
        card.style.transform = '';
      });
    });
  }
  attachTilt('.skill-card');
  attachTilt('.project-card');
  attachTilt('.cert-card');
})();

(function () {
  const detailRows = document.querySelectorAll('#about .row.mb-4 .col-6');
  if (!detailRows.length) return;
  detailRows.forEach(el => el.classList.add('about-detail-hidden'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      detailRows.forEach((el, i) => {
        setTimeout(() => el.classList.add('about-detail-show'), i * 90);
      });
      obs.disconnect();
    });
  }, { threshold: 0.3 });
  const aboutSection = document.getElementById('about');
  if (aboutSection) obs.observe(aboutSection);
})();

(function () {
  const aboutImg = document.querySelector('#about .col-lg-5 img');
  if (!aboutImg) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => aboutImg.classList.add('shimmer-once'), 300);
      obs.disconnect();
    });
  }, { threshold: 0.4 });
  obs.observe(aboutImg);
})();

(function () {
  const skillCards = document.querySelectorAll('.skill-card');
  if (!skillCards.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      skillCards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('card-stagger-in');
          const icon = card.querySelector('.skill-icon');
          if (icon) {
            setTimeout(() => icon.classList.add('icon-pulse-once'), 200);
          }
        }, i * 100);
      });
      obs.disconnect();
    });
  }, { threshold: 0.1 });
  const skillsSection = document.getElementById('skills');
  if (skillsSection) obs.observe(skillsSection);
})();

(function () {
  const tags = document.querySelectorAll('.tag');
  if (!tags.length) return;
  const seenCards = new Set();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seenCards.has(entry.target)) return;
      seenCards.add(entry.target);
      const cardTags = entry.target.querySelectorAll('.tag');
      cardTags.forEach((tag, i) => {
        setTimeout(() => tag.classList.add('tag-pop'), i * 80);
      });
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.project-card').forEach(card => obs.observe(card));
})();

(function () {
  const certCards = document.querySelectorAll('.cert-card');
  if (!certCards.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      certCards.forEach((card, i) => {
        setTimeout(() => {
          const badge = card.querySelector('.cert-icon-badge');
          if (badge) badge.classList.add('badge-flip');
          const yearEl = card.querySelector('.cert-year');
          if (yearEl) animateYear(yearEl, 2020, 2026, 600);
        }, i * 120);
      });
      obs.disconnect();
    });
  }, { threshold: 0.2 });
  const certSection = document.getElementById('certifications');
  if (certSection) obs.observe(certSection);

  function animateYear(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(from + (to - from) * easeOut(p));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
})();

(function () {
  const inputs = document.querySelectorAll('.contact-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.classList.add('input-ripple');
      setTimeout(() => input.classList.remove('input-ripple'), 600);
    });
  });
})();

function spawnParticles(btn) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('span');
    dot.className = 'send-particle';
    const angle = (i / 8) * Math.PI * 2;
    const dist  = 40 + Math.random() * 30;
    dot.style.cssText = `
      position:fixed; left:${cx}px; top:${cy}px;
      width:6px; height:6px; border-radius:50%;
      background:#00c885; pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%);
      box-shadow: 0 0 6px rgba(0,200,133,0.8);
    `;
    document.body.appendChild(dot);
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    dot.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], { duration: 600, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' })
      .onfinish = () => dot.remove();
  }
}

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
        method: 'POST', body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        spawnParticles(submitBtn);
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

const typedEl = document.getElementById('typed-name');
const words = ['Liam Palomo', 'AI Engineer', 'Network Architect'];
let wordIndex = 0, charIndex = 0, isDeleting = false;

function typeLoop() {
  const current = words[wordIndex];
  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) { setTimeout(() => { isDeleting = true; typeLoop(); }, 4000); return; }
    setTimeout(typeLoop, 80);
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeLoop, 400); return;
    }
    setTimeout(typeLoop, 45);
  }
}
setTimeout(typeLoop, 1200);

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
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
}, { passive: true });
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
    background:#00c885; color:#0d0d0d; font-weight:600;
    padding:14px 28px; border-radius:10px;
    box-shadow:0 8px 30px rgba(0,200,133,0.4);
    z-index:9999; font-size:15px;
    animation:fadeInUp 0.4s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}