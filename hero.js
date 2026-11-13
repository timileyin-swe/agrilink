(() => {
  const host=document.getElementById('hero');
  host.innerHTML=`<section class="landing"><div class="word-stage"><h1 class="ag-word" aria-label="AgriLink"><span aria-hidden="true">AGRILINK</span><video muted playsinline loop preload="none" aria-hidden="true"></video></h1></div><div class="launch"><div><h2>Sell your harvest<br><em>while it’s fresh.</em></h2><p>Find nearby buyers, arrange delivery or find storage for the produce you have left.</p></div><div class="launch-actions"><a href="#record">Record a harvest <span>↗</span></a><a href="#market">Buy produce <span>→</span></a></div></div><button class="motion" hidden></button></section>`;
  const video=host.querySelector('video'),control=host.querySelector('.motion');
  const slow=navigator.connection?.saveData||['slow-2g','2g'].includes(navigator.connection?.effectiveType);
  if(slow||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  video.src='./assets/harvest.mp4';
  video.addEventListener('playing',()=>{video.classList.add('playing');control.hidden=false;control.textContent='Ⅱ  Pause film'});
  video.addEventListener('pause',()=>{control.textContent='▷  Play film'});
  control.onclick=()=>{if(video.paused)video.play().catch(()=>{});else video.pause()};
  video.play().catch(()=>{});
})();
