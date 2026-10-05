const EMAIL = 'pliampalomo@gmail.com';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function showToast(message, icon = 'bi-check-circle') {
  const host = $('#toastHost');
  const el = document.createElement('div');
  el.className = 'toast align-items-center';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');

  const body = document.createElement('div');
  body.className = 'toast-body';
  const i = document.createElement('i');
  i.className = `bi ${icon}`;
  i.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.textContent = message;
  body.append(i, text);
  el.append(body);

  host.append(el);
  el.addEventListener('hidden.bs.toast', () => el.remove());
  new bootstrap.Toast(el, { delay: 3200 }).show();
}

(function initTheme() {
  const root = document.documentElement;
  const toggle = $('#themeToggle');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  apply(root.getAttribute('data-theme') || 'light');

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });
})();

(function initScrollUi() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.append(bar);

  const navbar = $('.navbar');
  const toTop = $('#backToTop');

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 500);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const menu = $('#navbarMenu');
  $$('.nav-link', menu).forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });
})();

(function initNavSpy() {
  const links = $$('.nav-link[data-section]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('active', l.dataset.section === entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));
})();

(function initHero() {
  const items = $$('[data-hero]');
  items.forEach((el, i) => setTimeout(() => el.classList.add('hero-enter'), 150 + i * 120));

  const photo = $('.hero-photo');
  const portrait = $('.hero-portrait');
  if (!photo || reduceMotion || 'ontouchstart' in window) return;
  portrait.addEventListener('mousemove', (e) => {
    const r = portrait.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
    photo.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
  });
  portrait.addEventListener('mouseleave', () => { photo.style.transform = ''; });
})();

(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 70 + 'ms';
    io.observe(el);
  });
})();

(function initCounters() {
  const counters = $$('[data-count-of]');
  const targets = counters.map((el) => $$(el.dataset.countOf).length);
  counters.forEach((el, i) => { el.textContent = reduceMotion ? targets[i] : 0; });
  if (reduceMotion) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const i = counters.indexOf(entry.target);
      const end = targets[i];
      const duration = 1200;
      const start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / duration, 1);
        entry.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => io.observe(el));
})();

(function initCarousel() {
  const track = $('#projectTrack');
  const originals = $$('.project-slide', track);
  const count = originals.length;
  const prev = $('#projectPrev');
  const next = $('#projectNext');
  const dotsWrap = $('#projectDots');
  const current = $('#projectCurrent');
  const pad = (n) => String(n).padStart(2, '0');
  let copies = 0;
  let pressed = false;
  let idleTimer = 0;

  $('#projectTotal').textContent = pad(count);

  const dots = originals.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.tabIndex = -1;
    dot.addEventListener('click', () => {
      const active = activeIndex();
      let delta = i - active;
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;
      move(delta);
    });
    dotsWrap.append(dot);
    return dot;
  });

  function clone() {
    const node = originals.map((slide) => {
      const copy = slide.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      $$('a, button', copy).forEach((el) => el.setAttribute('tabindex', '-1'));
      copy.classList.add('is-clone');
      return copy;
    });
    return node;
  }

  function build() {
    $$('.is-clone', track).forEach((el) => el.remove());
    if (count < 2) return;
    const setWidth = metrics(originals).setWidth;
    copies = Math.max(1, Math.ceil(track.clientWidth / setWidth) + 1);
    for (let c = 0; c < copies; c++) {
      track.prepend(...clone());
      track.append(...clone());
    }
  }

  function metrics() {
    const all = $$('.project-slide', track);
    const base = track.getBoundingClientRect().left - track.scrollLeft;
    const left = (el) => el.getBoundingClientRect().left - base;
    const first = left(all[0]);
    const step = all.length > 1 ? left(all[1]) - first : track.clientWidth;
    return { first, step, setWidth: step * count, start: first + copies * step * count };
  }

  function activeIndex() {
    const { first, step } = metrics();
    const idx = Math.round((track.scrollLeft - first) / step);
    return (((idx - copies * count) % count) + count) % count;
  }

  function jump(left) {
    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    void track.offsetWidth;
    track.style.scrollBehavior = '';
    track.style.scrollSnapType = '';
  }

  function move(delta) {
    const { first, step } = metrics();
    const idx = Math.round((track.scrollLeft - first) / step);
    track.scrollTo({ left: first + (idx + delta) * step, behavior: 'smooth' });
  }

  function recenter() {
    if (count < 2 || pressed) return;
    const { setWidth, start } = metrics();
    let s = track.scrollLeft;
    if (s >= start - 1 && s < start + setWidth - 1) return;
    while (s < start - 1) s += setWidth;
    while (s >= start + setWidth - 1) s -= setWidth;
    jump(s);
  }

  function sync() {
    const active = activeIndex();
    current.textContent = pad(active + 1);
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  track.addEventListener('scroll', () => {
    requestAnimationFrame(sync);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(recenter, 120);
  }, { passive: true });

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  });

  let startX = 0;
  let startLeft = 0;
  let moved = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    recenter();
    pressed = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!pressed) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      track.classList.add('dragging');
    }
    if (moved) track.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!pressed) return;
    pressed = false;
    if (!moved) return;
    track.classList.remove('dragging');
    const { first, step } = metrics();
    track.scrollTo({ left: first + Math.round((track.scrollLeft - first) / step) * step, behavior: 'smooth' });
  });

  function layout() {
    const idx = count > 1 ? activeIndex() : 0;
    build();
    if (count > 1) jump(metrics().first + (copies * count + idx) * metrics().step);
    sync();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });

  if (count < 2) {
    $('#projectControls').classList.add('is-static');
    dotsWrap.hidden = true;
  }
  layout();
})();

(function initCertificates() {
  const modalEl = $('#certModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const title = $('#certModalTitle');
  const meta = $('#certModalMeta');
  const body = $('#certModalBody');
  const open = $('#certModalOpen');

  function fallback(file, name) {
    const wrap = document.createElement('div');
    wrap.className = 'cert-fallback';

    const tile = document.createElement('span');
    tile.className = 'icon-tile';
    tile.innerHTML = '<i class="bi bi-file-earmark-image" aria-hidden="true"></i>';

    const h = document.createElement('h4');
    h.textContent = 'Preview not available yet';

    const p = document.createElement('p');
    p.append('Add the certificate for ' + name + ' at ');
    const code = document.createElement('code');
    code.textContent = file;
    p.append(code, ' and it will appear here.');

    wrap.append(tile, h, p);
    body.replaceChildren(wrap);
    open.classList.add('d-none');
  }

  function render(file, name) {
    open.classList.remove('d-none');
    open.href = file;

    if (/\.pdf($|\?)/i.test(file)) {
      const frame = document.createElement('iframe');
      frame.className = 'cert-frame';
      frame.title = name + ' certificate';
      frame.src = file;
      body.replaceChildren(frame);
      return;
    }

    const img = document.createElement('img');
    img.className = 'cert-image';
    img.alt = name + ' certificate';
    img.addEventListener('error', () => fallback(file, name));
    img.src = file;
    body.replaceChildren(img);
  }

  $$('.cert-card').forEach((card) => {
    card.addEventListener('click', () => {
      const { certTitle, certIssuer, certYear, certFile } = card.dataset;
      title.textContent = certTitle;
      meta.textContent = `${certIssuer} · ${certYear}`;
      render(certFile, certTitle);
      modal.show();
    });
  });

  modalEl.addEventListener('hidden.bs.modal', () => body.replaceChildren());
})();

(function initHire() {
  const form = $('#hireForm');
  const subjectEl = $('#draftSubject');
  const bodyEl = $('#draftBody');

  function values() {
    const data = new FormData(form);
    return {
      types: data.getAll('type'),
      budget: data.get('budget'),
      timeline: data.get('timeline'),
      name: (data.get('name') || '').trim(),
      email: (data.get('email') || '').trim(),
      message: (data.get('message') || '').trim()
    };
  }

  function compose(v, placeholders) {
    const subject = 'Project inquiry' + (v.types.length ? ' – ' + v.types.join(', ') : '');
    const lines = ['Hi Liam,', '', "I'd like to talk about a project with you.", ''];
    if (v.types.length) lines.push('Looking for: ' + v.types.join(', '));
    if (v.budget) lines.push('Budget: ' + v.budget);
    if (v.timeline) lines.push('Timeline: ' + v.timeline);
    if (v.types.length || v.budget || v.timeline) lines.push('');
    lines.push(v.message || (placeholders ? '[Tell me about your project…]' : ''), '', 'Thanks,');
    lines.push(v.name || (placeholders ? '[Your name]' : ''));
    if (v.email) lines.push(v.email);
    else if (placeholders) lines.push('[your@email.com]');
    return { subject, text: lines.join('\n') };
  }

  function refresh() {
    const draft = compose(values(), true);
    subjectEl.textContent = draft.subject;
    bodyEl.textContent = draft.text;
  }

  function valid() {
    let ok = true;
    $$('.form-control', form).forEach((field) => {
      const good = field.checkValidity() && field.value.trim() !== '';
      field.classList.toggle('is-invalid', !good);
      if (!good && ok) { field.focus(); ok = false; }
    });
    if (!ok) showToast('Please fill in your name, email and message.', 'bi-exclamation-circle');
    return ok;
  }

  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('is-invalid')) e.target.classList.remove('is-invalid');
    refresh();
  });
  form.addEventListener('change', refresh);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valid()) return;
    const draft = compose(values(), false);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.text.replace(/\n/g, '\r\n'))}`;
    showToast('Opening your email app…', 'bi-send-check');
  });

  $('#gmailBrief').addEventListener('click', () => {
    if (!valid()) return;
    const draft = compose(values(), false);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.text)}`;
    window.open(url, '_blank', 'noopener');
  });

  $('#copyEmail').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast('Email address copied');
    } catch (err) {
      showToast('Copy failed. Select the address manually.', 'bi-exclamation-circle');
    }
  });

  const clock = $('#phTime');
  const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
  function tick() { clock.textContent = fmt.format(new Date()); }
  tick();
  setInterval(tick, 30000);

  $('#year').textContent = new Date().getFullYear();
  refresh();
})();
