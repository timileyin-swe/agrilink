const landing = document.querySelector('.landing');
landing.querySelector('.launch').remove();
landing.insertAdjacentHTML('beforeend','<a class="scroll" href="#intro">Scroll down ↓</a>');
const home = document.querySelector('#hero');
home.insertAdjacentHTML('beforeend', `
<section id="intro" class="intro"><div class="intro-copy"><h2>From harvest to market</h2><div class="story"><p>The tomatoes are ready. The buyer is still a phone call away. What happens to the baskets that stay on the farm?</p><p>AgriLink brings harvest records, buyers and storage into one place. Start with what you picked today, even when the signal drops.</p><a class="intro-action" href="#record">Record your harvest <span aria-hidden="true">↗</span></a></div></div><figure class="intro-farmers"><img src="./assets/farmer-portrait.jpg" width="736" height="414" alt="A smiling farmer standing among rows of tomato plants"></figure></section>
<section class="services" aria-label="How AgriLink works">
<article><img loading="lazy" src="./assets/tomatoes.jpg" alt="Fresh ripe tomatoes"><div><small>For farmers</small><h2>Sell while<br>it’s fresh.</h2><p>Record the crop, quantity and harvest date. See which baskets need attention first.</p><a href="#record">Record a harvest ↗</a></div></article>
<article><img loading="lazy" src="./assets/market.jpg" alt="Produce displayed for sale"><div><small>For traders</small><h2>Find your<br>next supply.</h2><p>Browse a harvest, reserve the quantity you need and choose pickup or delivery.</p><a href="#market">Explore the market ↗</a></div></article>
<article><img loading="lazy" src="./assets/field.jpg" alt="Cultivated fields in the countryside"><div><small>After harvest</small><h2>Keep more<br>of the crop.</h2><p>Explore storage options for produce that needs more time before collection.</p><a href="#storage">Find storage ↗</a></div></article></section>
<section id="film" class="film"><button id="play" aria-label="Play harvest film"><span>▶</span></button></section>
<dialog id="cinema"><button id="closeFilm" autofocus>Close ×</button><video controls playsinline preload="none" src="./assets/pitch-film.mp4"></video></dialog>
<section class="harvest-voices" aria-labelledby="voices-heading">
<h2 id="voices-heading">After the harvest</h2>
<div class="voices-grid">
<figure><div class="voice-photo"><img loading="lazy" src="./assets/adesina-london.jpg" alt="Akinwumi Adesina"><a href="https://commons.wikimedia.org/wiki/File:His_Excellency_President_Dr_Akinwumi_Adesina,_Africa_Development_Bank,_speaking_at_the_UK-Africa_Investment_Summit,_London,_20_January_2020_picture_DFID_Graham_Carlow_20200120122921_GMCB7244_(49415031692).jpg">Photo: Graham Carlow / DFID · CC BY 2.0</a></div><div class="voice-quote"><blockquote>“Agriculture is a business. And we must take a full value chain approach, from the farm to the table.”</blockquote><figcaption><strong>Akinwumi Adesina</strong><span>Former Nigerian Minister of Agriculture</span><a href="https://www.afdb.org/en/news-and-events/opening-speech-delivered-by-african-development-bank-president-akinwumi-adesina-at-the-high-level-conference-on-feeding-africa-an-action-plan-for-african-agricultural-transformation-14843">Feeding Africa speech, 2015 ↗</a></figcaption></div></figure>
<figure><div class="voice-photo"><img loading="lazy" src="./assets/alvaro-lario.jpg" alt="Alvaro Lario"><a href="https://commons.wikimedia.org/wiki/File:Alvaro_Lario_at_the_WEF.jpg">Photo: Conorlocky · CC BY-SA 4.0</a></div><div class="voice-quote"><blockquote>“Productive and profitable small farms also work with small and medium-sized businesses that process, store and market food.”</blockquote><figcaption><strong>Alvaro Lario</strong><span>IFAD President</span><a href="https://webapps.ifad.org/members/gc/46/docs/GC-46-INF-4.pdf">IFAD opening statement, 2023 (PDF) ↗</a></figcaption></div></figure>
</div></section>
<section id="agriculture-news" class="ag-news"><h2>Latest</h2><div class="news-grid"></div></section>
<section class="tools"><h2>Explore AgriLink</h2><div><a href="#record"><img loading="lazy" src="./assets/tomatoes.jpg" alt="">Record a harvest ↗</a><a href="#market"><img loading="lazy" src="./assets/market.jpg" alt="">Reserve produce ↗</a><a href="#orders"><img loading="lazy" src="./assets/harvest.jpg" alt="">Follow an order ↗</a></div></section>`);
const menu = document.querySelector('#menu'), burger = document.querySelector('.burger');
const previewImages = {home:'harvest', film:'harvest', intro:'field', record:'tomatoes', market:'market', storage:'field', harvests:'tomatoes', orders:'market'};
function previewLink(link) {
  if (!link) return;
  menu.querySelector('img').src = './assets/' + previewImages[link.hash.slice(1)] + '.jpg';
  menu.querySelector('figcaption').textContent = link.textContent;
}
function toggleMenu(open) {
  menu.hidden = !open;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) previewLink(menu.querySelector('[aria-current], a'));
}
burger.onclick = () => toggleMenu(menu.hidden);
menu.onpointerover = menu.onfocusin = event => previewLink(event.target.closest('a'));
menu.onclick = event => {
  if (event.target.closest('a')) { toggleMenu(false); burger.focus(); }
};
document.addEventListener('pointerdown', event => {
  if (!menu.hidden && !event.target.closest('.mast')) toggleMenu(false);
});
document.querySelector('.mast').addEventListener('focusout', event => {
  if (!menu.hidden && !event.currentTarget.contains(event.relatedTarget)) toggleMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { toggleMenu(false); burger.focus(); }
});
const cinema=document.querySelector('#cinema');
document.querySelector('#play').onclick=()=>{cinema.showModal();cinema.querySelector('video').play().catch(()=>{})};
document.querySelector('#closeFilm').onclick=()=>cinema.close();
cinema.onclose=()=>cinema.querySelector('video').pause();

const runway = document.createElement('div');
runway.className='hero-runway';
landing.before(runway);
runway.append(landing);
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let pendingFrame=false;
function paintHero(){
  pendingFrame=false;
  if(home.hidden||motionPreference.matches)return;
  const rect=runway.getBoundingClientRect();
  const distance=Math.max(1,rect.height-landing.offsetHeight);
  const introTravel = Math.min(distance, landing.offsetHeight);
  const remaining = Math.max(0, rect.bottom - landing.offsetHeight);
  const fraction = Math.max(0, 1 - remaining / introTravel);
  const fade = fraction * fraction * (3 - 2 * fraction);
  home.style.setProperty('--intro-fade', String(fade));
  home.classList.toggle('intro-visible', fade > 0.5);

  home.style.setProperty('--intro-offset', -Math.min(remaining, introTravel) + 'px');
  const progress=Math.min(1,Math.max(0,-rect.top/(distance*.43)));
  landing.style.setProperty('--zoom',String(Math.exp(progress*3.4)));
  landing.style.setProperty('--veil',String(Math.min(1,(1-progress)*5)));
}
function scheduleHero(){
  if(!pendingFrame){pendingFrame=true;requestAnimationFrame(paintHero)}
}
window.addEventListener('scroll',scheduleHero,{passive:true});
window.addEventListener('resize',scheduleHero);
window.addEventListener('hashchange',scheduleHero);
paintHero();
const themeButton = document.querySelector('#theme');
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.textContent = dark ? '☀' : '☾';
  themeButton.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#000000' : '#ffffff';
}
applyTheme(document.documentElement.dataset.theme === 'dark');
let themeFadeTimer;
themeButton.onclick = () => {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  clearTimeout(themeFadeTimer);
  themeFadeTimer = setTimeout(() => root.classList.remove('theme-switching'), 260);
  applyTheme(document.documentElement.dataset.theme !== 'dark');
  try { localStorage.setItem('agrilink-theme', document.documentElement.dataset.theme); } catch {}
};









/* Reveal each section once, keeping content readable before JavaScript runs. */
const sectionMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  const sectionEntrance = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!sectionMotion.matches) entry.target.classList.add('section-entering');
      sectionEntrance.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.film, .journey, .details, .tools').forEach(section => {
    sectionEntrance.observe(section);
    section.addEventListener('animationend', () => section.classList.remove('section-entering'));
  });
}

const features = home.querySelector('.services');
if ('IntersectionObserver' in window) {
  const steps = [...features.querySelectorAll('article')];
  const stage = document.createElement('div');
  stage.className = 'feature-stage';
  stage.setAttribute('aria-hidden', 'true');
  const slides = steps.map(step => {
    const slide = document.createElement('div');
    slide.className = 'feature-slide';
    slide.append(step.querySelector('h2').cloneNode(true), step.querySelector('img').cloneNode());
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
  }
  selectFeature(0);
  const focusLine = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) selectFeature(steps.indexOf(entry.target));
    }
  }, { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach(step => focusLine.observe(step));
}

const newsGrid = document.querySelector('.news-grid');
const newsDay = () => new Date(Date.now()+3600000).toISOString().slice(0,10);
const plain = html => new DOMParser().parseFromString(html,'text/html').body.textContent.trim();
function showNews(stories) {
  newsGrid.replaceChildren(...stories.map(story => {
    const article = document.createElement('article');
    article.innerHTML = '<a><img loading="lazy" alt=""><div class="news-copy"><small>AgroNigeria</small><h3></h3><p></p><time></time><span>Read more</span></div></a>';
    article.querySelector('a').href = story.link;
    const img = article.querySelector('img');
    img.onerror = () => {img.onerror=null;img.src='./assets/field.jpg';};
    img.src = story.photo;
    article.querySelector('time').textContent = story.date;
    article.querySelector('h3').textContent = story.title;
    article.querySelector('p').textContent = story.summary;
    return article;
  }));
}

function chooseNews(pool, previous) {
  const unseen = pool.filter(story => !previous.includes(story.link));
  const seen = pool.filter(story => previous.includes(story.link));
  for (let i = unseen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
  }
  return [...unseen, ...seen].slice(0, 3);
}
async function refreshNews() {
  let previous = [], pool = [];
  try {
    previous = JSON.parse(sessionStorage.getItem('agrilink-headlines')) || [];
    pool = JSON.parse(localStorage.getItem('agrilink-story-pool')) || [];
  } catch {}
  if (pool.length < 3) {
    try { pool = await (await fetch('./news-snapshot.json')).json(); } catch {}
  }
  const fallback = chooseNews(pool, previous);
  if (fallback.length) showNews(fallback);
  let edition = fallback;
  try {
    const response = await fetch('https://agronigeria.ng/wp-json/wp/v2/posts?_embed&per_page=15', {cache:'no-store'});
    if (!response.ok) throw Error('Feed unavailable');
    const posts = await response.json();
    const stories = posts.map(p => {
      const media = p._embedded?.['wp:featuredmedia']?.[0];
      const words = plain(p.excerpt.rendered).split(/\s+/);
      return {title:plain(p.title.rendered), date:p.date.slice(0,10), link:p.link,
        photo:media?.media_details?.sizes?.medium_large?.source_url || media?.source_url || './assets/field.jpg',
        summary:words.slice(0,25).join(' ') + (words.length>25?'…':'')};
    });
    if (stories.length >= 3) {
      edition = chooseNews(stories, previous);
      showNews(edition);
      localStorage.setItem('agrilink-story-pool', JSON.stringify(stories));
    }
  } catch {}
  try { sessionStorage.setItem('agrilink-headlines', JSON.stringify(edition.map(story => story.link))); } catch {}
}
refreshNews();
