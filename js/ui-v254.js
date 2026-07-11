(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const screenLabel={dashboard:'الرئيسية',learn:'التعلّم',daily:'درس اليوم',myday:'خطة يومي',review:'المراجعة',flashcards:'Flashcards',quiz:'الاختبارات',dictation:'الاستماع والكتابة',speak:'تدريب النطق',words:'Word Coach',grammar:'Grammar',conversation:'محادثة موجّهة',freechat:'محادثة حرة',aiteacher:'AI Teacher',smartcoach:'Smart Coach',odooacademy:'Odoo Academy',erp:'Odoo / ERP',stats:'الإحصائيات',achievements:'الإنجازات',planner:'خطة الدراسة',mistakes:'أخطائي',lab:'Practice Lab',playlist:'Audio Playlist',notes:'ملاحظاتي',favorites:'المفضلة',backup:'النسخ الاحتياطي',account:'الحساب والمزامنة'};

function openScreen(id){
  const btn=document.querySelector(`[data-screen="${id}"]`);
  if(btn){btn.click(); closePalette(); window.scrollTo({top:0,behavior:'smooth'});}
}
function makePalette(){
  if($('#commandPalette'))return;
  const el=document.createElement('div');
  el.id='commandPalette';el.className='commandPalette';el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="commandBackdrop" data-close></div><section class="commandCard" role="dialog" aria-modal="true" aria-label="البحث السريع"><div class="commandInputWrap"><span>⌕</span><input id="commandInput" placeholder="ابحثي عن صفحة، موضوع، أو جملة..." autocomplete="off"><kbd>Esc</kbd></div><div class="commandHint"><span>↑↓ للتنقل</span><span>Enter للفتح</span></div><div id="commandResults" class="commandResults"></div></section>`;
  document.body.appendChild(el);
  el.querySelector('[data-close]').onclick=closePalette;
  $('#commandInput').addEventListener('input',e=>renderResults(e.target.value));
  $('#commandInput').addEventListener('keydown',handleKeys);
}
function dataset(){
  const pages=Object.entries(screenLabel).map(([id,label])=>({type:'page',id,label,sub:'صفحة في التطبيق',icon:document.querySelector(`[data-screen="${id}"] .navIcon`)?.textContent||'📄'}));
  const topics=[];
  $$('#topics button, .topicList button').forEach(b=>{const label=b.textContent.trim();if(label&&!topics.some(x=>x.label===label))topics.push({type:'topic',id:b.dataset.topic||'',label,sub:'موضوع تعلّم',icon:'📚',node:b});});
  const sentences=(window.S||[]).slice(0,250).map((x,i)=>({type:'sentence',id:String(i),label:x.en||x.english||'',sub:x.ar||x.arabic||'جملة',icon:'💬',index:i})).filter(x=>x.label);
  return [...pages,...topics,...sentences];
}
let activeIndex=0,current=[];
function renderResults(q=''){
  const term=q.trim().toLowerCase();
  current=dataset().filter(x=>!term||`${x.label} ${x.sub}`.toLowerCase().includes(term)).slice(0,12);activeIndex=0;
  const box=$('#commandResults');
  box.innerHTML=current.length?current.map((x,i)=>`<button class="commandResult ${i===0?'active':''}" data-i="${i}"><span class="commandIcon">${x.icon}</span><span><b>${esc(x.label)}</b><small>${esc(x.sub)}</small></span><em>${x.type==='page'?'فتح':x.type==='topic'?'موضوع':'جملة'}</em></button>`).join(''):`<div class="commandEmpty">لا توجد نتائج مطابقة.</div>`;
  $$('.commandResult').forEach(b=>b.onclick=()=>activate(Number(b.dataset.i)));
}
function activate(i){const x=current[i];if(!x)return;if(x.type==='page')openScreen(x.id);else if(x.type==='topic'&&x.node){x.node.click();closePalette();}else if(x.type==='sentence'){try{window.idx=x.index;openScreen('learn');setTimeout(()=>window.render?.(),50);}catch{openScreen('learn');}}}
function handleKeys(e){if(e.key==='Escape'){closePalette();return;}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();activeIndex=(activeIndex+(e.key==='ArrowDown'?1:-1)+current.length)%Math.max(current.length,1);$$('.commandResult').forEach((b,i)=>b.classList.toggle('active',i===activeIndex));$$('.commandResult')[activeIndex]?.scrollIntoView({block:'nearest'});}if(e.key==='Enter'){e.preventDefault();activate(activeIndex);}}
function openPalette(q=''){makePalette();const el=$('#commandPalette');el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.classList.add('paletteOpen');const input=$('#commandInput');input.value=q;renderResults(q);setTimeout(()=>input.focus(),20);}
function closePalette(){const el=$('#commandPalette');if(!el)return;el.classList.remove('open');el.setAttribute('aria-hidden','true');document.body.classList.remove('paletteOpen');}

function bindSearch(){
  const gs=$('#globalSearch');if(!gs)return;
  gs.setAttribute('readonly','readonly');
  gs.addEventListener('click',()=>openPalette());
  gs.addEventListener('focus',()=>openPalette());
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette();}else if(e.key==='Escape')closePalette();});
}
function syncNavigation(){
  const update=id=>{$$('.mobileBottomNav [data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===id));$$('.navItem').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));};
  $$('.navItem').forEach(b=>b.addEventListener('click',()=>update(b.dataset.screen)));
  $$('.mobileBottomNav [data-go]').forEach(b=>b.addEventListener('click',()=>update(b.dataset.go)));
  update(document.querySelector('.screen.active')?.id||'dashboard');
}
function addScrollTop(){
  const b=document.createElement('button');b.className='scrollTopBtn';b.innerHTML='↑';b.title='العودة للأعلى';b.setAttribute('aria-label','العودة للأعلى');document.body.appendChild(b);
  b.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  const toggle=()=>{b.classList.toggle('show',scrollY>450);document.body.classList.toggle('scrolled',scrollY>18);};
  addEventListener('scroll',toggle,{passive:true});toggle();
}
function improveCards(){
  $$('.panelCard,.dashCard,.activityCard').forEach((c,i)=>{c.style.setProperty('--delay',`${Math.min(i,12)*30}ms`);c.classList.add('uiReveal');});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){requestAnimationFrame(()=>document.body.classList.add('uiReady'));}
}
function installStatus(){
  if($('#networkStatus'))return;const s=document.createElement('div');s.id='networkStatus';s.className='networkStatus';document.body.appendChild(s);
  const update=()=>{s.textContent=navigator.onLine?'✓ متصلة بالإنترنت':'⚠ تعملين دون اتصال';s.className='networkStatus '+(navigator.onLine?'online':'offline');s.classList.add('show');clearTimeout(update.t);update.t=setTimeout(()=>s.classList.remove('show'),2200);};
  addEventListener('online',update);addEventListener('offline',update);if(!navigator.onLine)update();
}
function init(){makePalette();bindSearch();syncNavigation();addScrollTop();improveCards();installStatus();document.documentElement.dataset.uiVersion='25.5';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
