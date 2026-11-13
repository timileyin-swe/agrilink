(() => {
  'use strict';
  const key = 'agrilink-trial-v1';
  const money = n => '₦' + Number(n).toLocaleString('en-NG');
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => new Date().toLocaleDateString('en-CA');
  const dateLabel = d => new Date(d + 'T12:00:00').toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'});
  const stages = ['Reserved','Ready for collection','On the way','Delivered'];
  let state, view, flash = '', selected = '', inputError = '', nextRoute;
  function seed() {
    return {harvests:[{id:'tomato-demo',crop:'Tomatoes',quantity:6,unit:'baskets',price:6500,area:'Abeokuta',date:today(),sample:true,spoiled:0}],orders:[]};
  }
  function read() {
    try { const v=JSON.parse(localStorage.getItem(key)); if(v && Array.isArray(v.harvests) && Array.isArray(v.orders)) return v; } catch {}
    return seed();
  }
  function store() {
    try {localStorage.setItem(key,JSON.stringify(state));return true;}
    catch {state=read(); inputError='This browser could not save your changes. Allow local storage and try again.'; return false;}
  }
  function available(h) {return h.quantity-h.spoiled-state.orders.filter(o=>o.harvest===h.id).reduce((n,o)=>n+o.qty,0);}
  const btn=(label,action,id='',secondary=false)=>`<button type="button" class="af-btn ${secondary?'af-light':''}" data-action="${action}" data-id="${safe(id)}">${label}</button>`;
  const field=(label,html)=>`<label class="af-field"><span>${label}</span>${html}</label>`;
  function heading(eyebrow,title,desc) {return `<header class="af-heading"><span>${eyebrow}</span><h1>${title}</h1><p>${desc}</p></header>`;}
  function record() {
    return heading('FARMER WORKSPACE','Record a harvest','Save the details on this device, even when the network drops.')+
    `<form id="af-record" class="af-panel"><div class="af-form-head"><h2>Harvest details</h2><div class="af-actions">${field('Audio language','<select id="af-language"><option value="en-NG">English</option><option value="yo-NG">Yorùbá</option></select>')}${btn('Listen to instructions','listen','',true)}</div></div><div class="af-grid">
    ${field('Crop','<input name="crop" maxlength="60" placeholder="e.g. Tomatoes" required>')}
    ${field('Harvest date','<input name="date" type="date" value="'+today()+'" max="'+today()+'" required>')}
    ${field('Quantity','<input name="qty" type="number" min="1" max="100000" step="1" placeholder="6" required>')}
    ${field('Unit','<select name="unit"><option>baskets</option><option>crates</option><option>bags</option><option>kg</option></select>')}
    ${field('Price per unit (₦)','<input name="price" type="number" min="1" max="10000000" step="1" placeholder="6500" required>')}
    ${field('Pickup area','<input name="area" maxlength="90" placeholder="Town or market in Ogun" required>')}
    </div><div class="af-foot"><button class="af-btn">Save harvest</button><small>Trial records stay on this device.</small></div></form>`;
  }
  function cards(market) {
    const harvests=market?state.harvests.filter(h=>available(h)>0):state.harvests;
    return heading(market?'TRADER WORKSPACE':'FARMER WORKSPACE',market?'Produce market':'My harvests',market?'Choose a harvest to reserve for pickup or delivery.':'Review your available produce, record losses and check storage options.')+
    '<div class="af-toolbar">'+btn('Record a harvest','record')+'</div><div class="af-cards">'+(harvests.map(h=>{
      const remaining=available(h),age=Math.floor((new Date(today()+'T12:00:00')-new Date(h.date+'T12:00:00'))/86400000);
      return `<article class="af-panel"><div class="af-kicker">${h.sample?'Sample harvest':'Saved on this phone'} · ${safe(h.area)}</div><h2>${safe(h.crop)}</h2><div class="af-price">${money(h.price)} <small>/ ${safe(h.unit==='kg'?'kg':h.unit.slice(0,-1))}</small></div><p>${remaining} of ${h.quantity} ${safe(h.unit)} available<br>Harvested ${safe(dateLabel(h.date))}</p>${age>=2 && remaining?'<p class="af-alert">Harvest reminder · Check the condition of your remaining produce.</p>':''}<div class="af-actions">${market?btn('Reserve produce','reserve',h.id):btn('Find storage','storage',h.id,true)+(remaining?btn('Record loss','loss',h.id,true):'')}</div>${selected===h.id?market?reservation(h):loss(h):''}</article>`;
    }).join('') || '<p class="af-panel">No produce available yet. Record a harvest to try a reservation.</p>')+'</div>';
  }
  function reservation(h) {
    return `<form id="af-reserve" data-id="${safe(h.id)}" class="af-subform">${field('Quantity ('+safe(h.unit)+')','<input name="qty" type="number" value="1" min="1" max="'+available(h)+'" required>')}${field('Collection method','<select name="method"><option>Pickup</option><option>Delivery</option></select>')}<label class="af-field" data-destination hidden><span>Delivery area</span><input name="destination" maxlength="90" placeholder="Market or town"></label><div id="af-quote"></div><button class="af-btn">Confirm trial reservation</button></form>`;
  }
  function quote(form) {
    if(!form)return;
    const h=state.harvests.find(h=>h.id===form.dataset.id), qty=Number(form.elements.qty.value),ship=form.elements.method.value==='Delivery';
    const amount=h.price*qty,fee=Math.round(amount*.02),delivery=ship?1500:0;
    form.querySelector('[data-destination]').hidden=!ship;
    form.elements.destination.required=ship;
    form.querySelector('#af-quote').innerHTML=`<dl class="af-ledger"><dt>Produce</dt><dd>${money(amount)}</dd><dt>Buyer’s delivery fee (demo)</dt><dd>${money(delivery)}</dd><dt>Buyer pays</dt><dd>${money(amount+delivery)}</dd><dt>Farmer’s service fee (trial 2%)</dt><dd>${money(fee)}</dd><dt>Farmer receives</dt><dd>${money(amount-fee)}</dd></dl>`;
  }
  function loss(h){return `<form class="af-subform" id="af-loss" data-id="${safe(h.id)}">${field('Units spoiled','<input name="qty" type="number" min="1" max="'+available(h)+'" required>')}<button class="af-btn">Save loss</button></form>`;}
  function orders() {
    return heading('ORDER BOOK','Orders','Follow collection, delivery and the farmer’s payout.')+'<div class="af-cards">'+(state.orders.map(o=>{
      const h=state.harvests.find(x=>x.id===o.harvest),finished=o.stage===3,next=o.method==='Pickup'&&o.stage===1?3:o.stage+1;
      const status=o.method==='Pickup'&&finished?'Collected':stages[o.stage];
      return `<article class="af-panel"><div class="af-kicker">Trial order · ${safe(o.method)}</div><h2>${safe(h.crop)} · ${o.qty} ${safe(h.unit)}</h2><p>${safe(h.area)}${o.method==='Delivery'?' → '+safe(o.destination):''}</p><strong>${status}</strong><dl class="af-ledger"><dt>${finished?'Recorded sale':'Expected farmer payout'}</dt><dd>${money(o.net)}</dd></dl><p>SMS preview · Your order is ${status.toLowerCase()}. No message sent.</p>${o.method==='Delivery'&&o.stage===2?'<p class="af-alert">GPS preview · Sample truck update near the pickup area. Live location is unavailable in this trial.</p>':''}${finished?'':btn('Demo: '+(next===3&&o.method==='Pickup'?'confirm collection':stages[next].toLowerCase()),'advance',o.id,true)}</article>`;
    }).join('')||'<article class="af-panel"><h2>No orders yet</h2><p>Reserve produce in the market to see an order here.</p>'+btn('Browse produce','market')+'</article>')+'</div>';
  }
  function storage() {
    return heading('STORAGE','Find storage','Look for a facility near the pickup area and contact the operator to confirm availability.')+
    `<form class="af-panel" id="af-storage">${field('Town or market','<input name="area" value="'+safe(state.harvests.find(h=>h.id===selected)?.area||'')+'" placeholder="e.g. Abeokuta" maxlength="90" required>')}<p>Search Google Maps for nearby produce cold rooms. Contact the operator for current capacity and daily prices.</p><button class="af-btn">Search nearby storage ↗</button></form>`;
  }
  const views={record,harvests:()=>cards(false),market:()=>cards(true),orders,storage};
  function paint() {
    const el=document.getElementById('flow');
    const tabs=[['record','Record'],['harvests','My harvests'],['market','Market'],['orders','Orders'],['storage','Storage']];
    el.innerHTML='<div class="af-shell"><nav class="af-tabs" aria-label="Trial workspace">'+tabs.map(([id,label])=>`<button data-action="${id}" ${view===id?'aria-current="page"':''}>${label}</button>`).join('')+'</nav><div role="status" class="af-status">'+safe(inputError||flash)+'</div>'+views[view]()+'</div>';
    quote(el.querySelector('#af-reserve'));
    el.oninput=e=>{if(e.target.form?.id==='af-reserve')quote(e.target.form);};
    el.onclick=click; el.onsubmit=submit;
  }
  function change(v) {view=v; paint();}
  function navigate(v){
    nextRoute={view:v,flash,selected};
    window.showView(v);
  }
  function click(e) {
    const b=e.target.closest('[data-action]');if(!b)return;
    const a=b.dataset.action;inputError='';flash='';
    if(a==='listen'){
      if(!window.speechSynthesis){document.querySelector('.af-status').textContent='Audio instructions are unavailable in this browser.';return;}
      const lang=document.querySelector('#af-language').value;
      const message=lang==='yo-NG'?'Tẹ orúkọ irúgbìn, ọjọ́ ìkórè, iye, iye owó àti ibi tí wọ́n ti lè gbé e sílẹ̀. Lẹ́yìn náà, tẹ Save harvest.':'Enter your crop, harvest date, quantity, unit, price and pickup area. Then select Save harvest.';
      const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2)));
      const status=document.querySelector('.af-status');
      if(lang==='yo-NG'&&!voice){status.textContent='Yorùbá speech is unavailable on this device. '+message;return;}
      const speech=new SpeechSynthesisUtterance(message);
      speech.lang=lang;if(voice)speech.voice=voice;
      speech.onerror=()=>{status.textContent='Audio unavailable. '+message;};
      speechSynthesis.cancel();speechSynthesis.speak(speech);return;
    }
    if(a==='advance'){
      state=read();const o=state.orders.find(o=>o.id===b.dataset.id);if(!o)return;
      o.stage=Math.min(3,o.method==='Pickup'&&o.stage===1?3:o.stage+1);store();paint();return;
    }
    selected=b.dataset.id||'';
    if(a==='reserve'||a==='loss'){paint();document.querySelector('.af-subform input')?.focus();return;}
    if(views[a]){navigate(a);}
  }
  function submit(e){
    e.preventDefault();const form=e.target,d=Object.fromEntries(new FormData(form));inputError='';flash='';
    if(form.id==='af-storage'){window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('produce cold storage near '+d.area+', Ogun, Nigeria'),'_blank','noopener,noreferrer');return;}
    state=read();
    const id=()=>globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2);
    if(form.id==='af-record'){
      if(!d.crop.trim()||!d.area.trim()){document.querySelector('.af-status').textContent='Enter a crop and pickup area.';return;}
      state.harvests.unshift({id:id(),crop:d.crop.trim(),quantity:+d.qty,unit:d.unit,price:+d.price,area:d.area.trim(),date:d.date,spoiled:0});
      if(store()){flash='Harvest saved on this phone.';selected='';view='harvests';}
    }else{
      const h=state.harvests.find(h=>h.id===form.dataset.id);
      if(!h||!Number.isInteger(+d.qty)||+d.qty<1||+d.qty>available(h)){inputError='Available quantity changed. Check the harvest and try again.';paint();return;}
      if(form.id==='af-reserve'){
        const amount=h.price*+d.qty;state.orders.unshift({id:id(),harvest:h.id,qty:+d.qty,method:d.method,destination:d.destination,net:amount-Math.round(amount*.02),stage:0});
        if(store()){view='orders';flash='Trial reservation confirmed.';}
      }else if(form.id==='af-loss'){h.spoiled+=+d.qty;if(store())flash='Loss recorded. Available quantity updated.';}
      selected='';
    }
    if(location.hash!=='#'+view){navigate(view);return;}
    paint();
  }
  window.renderFlow=v=>{const pending=nextRoute?.view===v?nextRoute:null;nextRoute=null;state=read();selected=pending?.selected||'';inputError='';flash=pending?.flash||'';change(views[v]?v:'harvests');};
})();
