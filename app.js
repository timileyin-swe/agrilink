const pages=['home','record','harvests','market','orders','storage'];
function navigate(){
  const name=location.hash.slice(1)||'home';
  const view=pages.includes(name)?name:'home';
  document.querySelector('#hero').hidden=view!=='home';
  document.querySelector('#flow').hidden=view==='home';
  for(const link of document.querySelectorAll('.mast nav a')){
    if(link.hash==='#'+view)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  if (view !== 'home') {
    window.renderFlow(view);
    const screen = document.querySelector('#flow .af-shell');
    if (screen && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      screen.classList.add('section-entering');
      screen.addEventListener('animationend', () => screen.classList.remove('section-entering'), { once: true });
    }
  }
}
window.showView=function(view){if(location.hash==='#'+view)navigate();else location.hash=view};
window.addEventListener('hashchange',()=>{navigate();if(['#intro','#film'].includes(location.hash))document.querySelector(location.hash).scrollIntoView();else window.scrollTo(0,0)});
navigate();
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});


