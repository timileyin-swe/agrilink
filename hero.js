// The harvest film inside the AGRILINK letters. Skipped on save-data, 2G or reduced motion (the photo stays).
(() => {
  const host = document.getElementById('hero');
  const video = host.querySelector('.ag-word video'), control = host.querySelector('.motion');
  const slow = navigator.connection?.saveData || ['slow-2g', '2g'].includes(navigator.connection?.effectiveType);
  if (slow || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const icon = (id) => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  // Start the film once the page has loaded and the browser is idle, so it never slows the first view.
  const start = () => { video.src = './assets/harvest.mp4'; video.play().catch(() => {}); };
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 600));
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  video.addEventListener('playing', () => { video.classList.add('playing'); control.hidden = false; control.innerHTML = `${icon('pause')}Pause film`; });
  video.addEventListener('pause', () => { control.innerHTML = `${icon('play')}Play film`; });
  control.onclick = () => { if (video.paused) video.play().catch(() => {}); else video.pause(); };
})();
