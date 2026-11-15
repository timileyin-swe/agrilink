// The page's behaviour: his AGRILINK scroll transition (unchanged maths), the header, the theme toggle,
// the "How it works" steps, reveals, and the demo film (shown only if assets/agrilink-demo.mp4 exists).
const DEMO_FILM = './assets/agrilink-demo.mp4';

const home = document.querySelector('#hero');
const landing = home.querySelector('.landing');
const runway = home.querySelector('.hero-runway');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- his scroll-triggered enlarging transition (same maths as before) ---------- */
let pendingFrame = false;
function paintHero() {
  pendingFrame = false;
  if (motionPreference.matches) return;
  const rect = runway.getBoundingClientRect();
  const distance = Math.max(1, rect.height - landing.offsetHeight);
  const introTravel = Math.min(distance, landing.offsetHeight);
  const remaining = Math.max(0, rect.bottom - landing.offsetHeight);
  const fraction = Math.max(0, 1 - remaining / introTravel);
  const fade = fraction * fraction * (3 - 2 * fraction);
  home.style.setProperty('--intro-fade', String(fade));
  home.classList.toggle('intro-visible', fade > 0.5);
  home.style.setProperty('--intro-offset', -Math.min(remaining, introTravel) + 'px');
  const progress = Math.min(1, Math.max(0, -rect.top / (distance * 0.43)));
  landing.style.setProperty('--zoom', String(Math.exp(progress * 3.4)));
  landing.style.setProperty('--veil', String(Math.min(1, (1 - progress) * 5)));
}
function scheduleHero() {
  if (!pendingFrame) { pendingFrame = true; requestAnimationFrame(paintHero); }
}
addEventListener('scroll', scheduleHero, { passive: true });
addEventListener('resize', scheduleHero);
addEventListener('hashchange', scheduleHero);
requestAnimationFrame(paintHero);

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

/* ---------- his dark-mode toggle (now a clean icon), remembered; first visit follows the system ---------- */
const themeButton = document.querySelector('#theme');
const themeColor = { light: '#F6F4EC', dark: '#111512' };
function applyTheme(dark) {
  const root = document.documentElement;
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeButton.title = themeButton.getAttribute('aria-label');
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = themeColor[dark ? 'dark' : 'light']; });
}
applyTheme(document.documentElement.dataset.theme === 'dark');
themeButton.onclick = () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
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
}

/* ---------- reveal sections once ---------- */
function setUpReveals() {
  if (!('IntersectionObserver' in window) || motionPreference.matches) { document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')); return; }
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; reveal.observe(el); });
}

/* ---------- demo film: only when assets/agrilink-demo.mp4 exists ---------- */
const cinema = document.querySelector('#cinema');
const film = cinema.querySelector('video');
function checkDemoFilm() {
  fetch(DEMO_FILM, { method: 'HEAD', cache: 'no-store' }).then((r) => {
    if (!r.ok || !/video/.test(r.headers.get('content-type') || 'video')) return;
    film.src = DEMO_FILM;
    document.querySelectorAll('[data-demo]').forEach((el) => { el.hidden = false; });
  }).catch(() => {});
}
document.querySelectorAll('[data-play]').forEach((b) => {
  b.onclick = () => { cinema.showModal(); film.play().catch(() => {}); };
});
document.querySelector('#closeFilm').onclick = () => cinema.close();
cinema.addEventListener('close', () => film.pause());
cinema.addEventListener('click', (e) => { if (e.target === cinema) cinema.close(); });

// The parts below the fold wait until the page has loaded and the browser is idle.
const later = () => { setUpReveals(); buildFeatureStage(); checkDemoFilm(); };
const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(later, { timeout: 1500 }) : setTimeout(later, 300));
if (document.readyState === 'complete') whenIdle(); else addEventListener('load', whenIdle, { once: true });
