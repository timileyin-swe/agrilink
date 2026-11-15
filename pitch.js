// The page's behaviour: his AGRILINK scroll transition (unchanged maths), the story lines that appear as you
// scroll, gentle parallax, the header, the theme toggle, the "How it works" steps, reveals, Back to top,
// and the demo film.

// The demo film: set this to true after adding assets/agrilink-demo.mp4 (MP4, H.264, under 25 MB).
// While it is false, the page never asks for the file, and the demo button, menu item and section stay hidden.
const DEMO_VIDEO_AVAILABLE = false;
const DEMO_FILM = './assets/agrilink-demo.mp4';

const root = document.documentElement;
const home = document.querySelector('#hero');
const landing = home.querySelector('.landing');
const runway = home.querySelector('.hero-runway');
const storyLines = [...document.querySelectorAll('#intro .story .line')];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const moving = () => !motionPreference.matches;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Classes that switch the motion on. Without this script (or with reduced motion) nothing waits to appear.
function setMotionClasses() {
  home.classList.toggle('hero-live', moving());
  root.classList.toggle('story-live', moving());
  root.classList.toggle('parallax-on', moving());
}
setMotionClasses();

/* ---------- his scroll-triggered enlarging transition (same maths as before) ---------- */
// Read phase only; returns the writes. One shared frame does every read first, then every write.
let introFraction = 0;
function readHero() {
  const rect = runway.getBoundingClientRect();
  const stageHeight = landing.offsetHeight;
  const distance = Math.max(1, rect.height - stageHeight);
  const introTravel = Math.min(distance, stageHeight);
  const remaining = Math.max(0, rect.bottom - stageHeight);
  const fraction = Math.max(0, 1 - remaining / introTravel);
  introFraction = fraction;
  const fade = fraction * fraction * (3 - 2 * fraction);
  const progress = Math.min(1, Math.max(0, -rect.top / (distance * 0.43)));
  return () => {
    home.style.setProperty('--intro-fade', String(fade));
    home.classList.toggle('intro-visible', fade > 0.5);
    home.style.setProperty('--intro-offset', -Math.min(remaining, introTravel) + 'px');
    landing.style.setProperty('--zoom', String(Math.exp(progress * 3.4)));
    landing.style.setProperty('--veil', String(Math.min(1, (1 - progress) * 5)));
  };
}

/* ---------- Our story: each line fades and rises in as you scroll ---------- */
// While the story panel settles over the film, the lines follow that same scroll, one after another.
// After that, a line that is still low on the screen finishes by the time it reaches about two thirds
// of the way up, so nothing stays hidden while the section is on screen.
function readStory() {
  if (!storyLines.length) return null;
  const vh = innerHeight;
  const introTop = storyLines[0].offsetParent ? storyLines[0].offsetParent.getBoundingClientRect().top : 0;
  const values = storyLines.map((line, i) => {
    const staggered = clamp01((introFraction - (0.15 + i * 0.13)) / 0.3);
    const top = introTop + line.offsetTop; // offsetTop ignores the line's own movement, so no feedback
    const placed = clamp01((vh * 0.95 - top) / (vh * 0.27));
    return Math.min(staggered, placed).toFixed(3);
  });
  return () => storyLines.forEach((line, i) => line.style.setProperty('--p', values[i]));
}

/* ---------- parallax: things move at slightly different speeds (transform only, off with reduced motion) ---------- */
// data-speed > 0 moves slower than the page (further away), < 0 a little faster (closer). data-max caps the
// movement in pixels; phones get half. Uses the CSS `translate` property, so it never fights the reveals
// or hover effects, which use `transform`.
const layers = [];
const active = new Set();
function setUpParallax() {
  if (!('IntersectionObserver' in window)) return;
  document.querySelectorAll('[data-speed]').forEach((el) => {
    if (el.closest('.feature-stage')) return;
    layers.push({ el, speed: Number(el.dataset.speed) || 0, max: Number(el.dataset.max) || 24, y: 0 });
  });
  const watch = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const layer = layers.find((l) => l.el === entry.target);
      if (entry.isIntersecting) { active.add(layer); layer.el.style.willChange = 'translate'; }
      else { active.delete(layer); layer.el.style.willChange = ''; }
    }
    schedule();
  }, { rootMargin: '20% 0px' });
  layers.forEach((l) => watch.observe(l.el));
}
function readParallax() {
  if (!active.size) return null;
  const vh = innerHeight;
  const phone = innerWidth < 700 ? 0.5 : 1;
  const next = [];
  for (const layer of active) {
    const r = layer.el.getBoundingClientRect();
    const centre = r.top + r.height / 2 - layer.y; // where it would be without our shift
    const cap = layer.max * phone;
    const y = Math.max(-cap, Math.min(cap, -(centre - vh / 2) * layer.speed * phone));
    next.push([layer, Math.round(y * 10) / 10]);
  }
  return () => next.forEach(([layer, y]) => { layer.y = y; layer.el.style.translate = `0 ${y}px`; });
}
function clearMotion() {
  layers.forEach((l) => { l.y = 0; l.el.style.translate = ''; l.el.style.willChange = ''; });
  storyLines.forEach((line) => line.style.removeProperty('--p'));
}

/* ---------- one shared animation frame for all of the above ---------- */
let queued = false;
function frame() {
  queued = false;
  if (!moving()) return;
  const writes = [readHero(), readStory(), readParallax()]; // every read first ...
  writes.forEach((write) => write && write()); // ... then every write, so the layout is worked out once
}
function schedule() {
  if (!queued) { queued = true; requestAnimationFrame(frame); }
}
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);
addEventListener('hashchange', schedule);
motionPreference.addEventListener?.('change', () => { setMotionClasses(); if (!moving()) clearMotion(); schedule(); });
schedule();

/* ---------- header: blur once scrolled; phone menu ---------- */
const mast = document.querySelector('.mast');
const burger = mast.querySelector('.burger');
const onScroll = () => mast.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
function toggleMenu(open) {
  mast.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) mast.querySelector('#menu a')?.focus();
}
burger.onclick = () => toggleMenu(!mast.classList.contains('open'));
mast.querySelector('#menu').addEventListener('click', (e) => { if (e.target.closest('a') && mast.classList.contains('open')) toggleMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mast.classList.contains('open')) { toggleMenu(false); burger.focus(); } });
document.addEventListener('pointerdown', (e) => { if (mast.classList.contains('open') && !e.target.closest('.mast')) toggleMenu(false); });

/* ---------- Back to top (and the logo): the header is sticky, so "#top" alone never moves the page ---------- */
document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (mast.classList.contains('open')) toggleMenu(false);
    scrollTo({ top: 0, behavior: moving() ? 'smooth' : 'auto' });
    // keyboard users continue from the top of the page
    mast.setAttribute('tabindex', '-1');
    mast.focus({ preventScroll: true });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  });
});
mast.addEventListener('blur', () => mast.removeAttribute('tabindex'));

/* ---------- his dark-mode toggle (now a clean icon), remembered; first visit follows the system ---------- */
const themeButton = document.querySelector('#theme');
const themeColor = { light: '#F6F4EC', dark: '#111512' };
function applyTheme(dark) {
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeButton.title = themeButton.getAttribute('aria-label');
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = themeColor[dark ? 'dark' : 'light']; });
}
applyTheme(root.dataset.theme === 'dark');
themeButton.onclick = () => {
  const dark = root.dataset.theme !== 'dark';
  applyTheme(dark);
  try { localStorage.setItem('agrilink-theme', dark ? 'dark' : 'light'); } catch {}
};

/* ---------- "How it works": his sticky feature stage on wide screens (picture changes as the steps scroll) ---------- */
// Built after load, when the browser is idle, so it never delays the first view.
function buildFeatureStage() {
  const features = document.querySelector('.services');
  if (!('IntersectionObserver' in window) || !features) return;
  const steps = [...features.querySelectorAll('article')];
  const stage = document.createElement('div');
  stage.className = 'feature-stage';
  stage.setAttribute('aria-hidden', 'true');
  const slides = steps.map((step) => {
    const slide = document.createElement('div');
    slide.className = 'feature-slide';
    const shot = step.querySelector('.shot').cloneNode(true);
    shot.removeAttribute('data-speed'); // the stage itself already holds the phone still while the text moves
    shot.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    slide.append(shot);
    stage.append(slide);
    return slide;
  });
  const copy = document.createElement('div');
  copy.className = 'feature-steps';
  copy.append(...steps);
  features.append(stage, copy);
  function selectFeature(index) {
    features.dataset.step = String(index);
    slides.forEach((slide, position) => slide.classList.toggle('active', position === index));
    steps.forEach((step, position) => step.classList.toggle('active', position === index));
  }
  selectFeature(0);
  const focusLine = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) selectFeature(steps.indexOf(entry.target));
  }, { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach((step) => focusLine.observe(step));
  // above the first step (for example after jumping here from the menu) the stage shows step 1
  const head = document.querySelector('.how-head');
  if (head) new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) selectFeature(0); }, { rootMargin: '-48% 0px -48% 0px' }).observe(head);
}

/* ---------- reveal sections once ---------- */
function setUpReveals() {
  if (!('IntersectionObserver' in window) || !moving()) { document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')); return; }
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; reveal.observe(el); });
}

/* ---------- demo film ---------- */
const cinema = document.querySelector('#cinema');
const film = cinema.querySelector('video');
function setUpDemoFilm() {
  if (!DEMO_VIDEO_AVAILABLE) return;
  film.src = DEMO_FILM;
  document.querySelectorAll('[data-demo]').forEach((el) => { el.hidden = false; });
}
setUpDemoFilm();
document.querySelectorAll('[data-play]').forEach((b) => {
  b.onclick = () => { cinema.showModal(); film.play().catch(() => {}); };
});
document.querySelector('#closeFilm').onclick = () => cinema.close();
cinema.addEventListener('close', () => film.pause());
cinema.addEventListener('click', (e) => { if (e.target === cinema) cinema.close(); });

// The parts below the fold wait until the page has loaded and the browser is idle.
const later = () => { setUpReveals(); buildFeatureStage(); setUpParallax(); schedule(); };
const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(later, { timeout: 1500 }) : setTimeout(later, 300));
if (document.readyState === 'complete') whenIdle(); else addEventListener('load', whenIdle, { once: true });
