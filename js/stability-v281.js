(()=>{
'use strict';
const $=id=>document.getElementById(id);
let queueToken=0, queueTimer=0;

function stopQueue(message=false){
  queueToken++;
  clearTimeout(queueTimer);
  queueTimer=0;
  try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch(_){ }
  document.querySelectorAll('#playlistOut .playItem').forEach(el=>el.classList.remove('playing'));
  if(message && typeof toast==='function') toast('تم إيقاف القائمة');
}
function selectedVoice(){
  if(!('speechSynthesis' in window)) return null;
  const all=window.speechSynthesis.getVoices();
  const english=all.filter(v=>/en|English/i.test((v.lang||'')+' '+(v.name||'')));
  const idx=Number($('voice')?.value);
  return english[idx]||english[0]||all.find(v=>/^en/i.test(v.lang||''))||null;
}
function getList(mode){
  if(typeof S==='undefined'||typeof state==='undefined'||!S.length) return [];
  const current=S[Math.max(0,Math.min(S.length-1,Number(state.i)||0))];
  if(!current) return [];
  if(mode==='topic') return S.filter(x=>String(x.topic_id)===String(current.topic_id));
  const source=mode==='review'?(state.review||{}):(state.fav||{});
  return Object.keys(source).map(n=>S.find(x=>String(x.number)===String(n))).filter(Boolean);
}
function drawList(list){
  const out=$('playlistOut'); if(!out) return;
  const esc=typeof escapeHtml==='function'?escapeHtml:(v=>String(v??''));
  out.innerHTML=list.map((x,i)=>`<div class="playItem" data-play-index="${i}"><b>${esc(x.number)}. ${esc(x.english)}</b><small>${esc(x.arabic)}</small></div>`).join('')||'<p>لا توجد جمل في هذه القائمة.</p>';
}
function startQueue(mode){
  stopQueue(false);
  const list=getList(mode);
  drawList(list);
  if(!list.length){ if(typeof toast==='function') toast('لا توجد جمل في هذه القائمة'); return; }
  if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){
    if(typeof toast==='function') toast('المتصفح لا يدعم تشغيل الصوت'); return;
  }
  const token=++queueToken;
  const repeats=Math.max(1,Math.min(5,Number($('repeatCount')?.value)||1));
  const gap=Math.max(0,Math.min(10,Number($('gapSeconds')?.value)||2))*1000;
  let index=0, repeated=0;
  const play=()=>{
    if(token!==queueToken) return;
    if(index>=list.length){
      document.querySelectorAll('#playlistOut .playItem').forEach(el=>el.classList.remove('playing'));
      if(typeof toast==='function') toast('تم تشغيل القائمة كاملة ✅');
      return;
    }
    const item=list[index];
    document.querySelectorAll('#playlistOut .playItem').forEach((el,i)=>el.classList.toggle('playing',i===index));
    document.querySelector(`#playlistOut .playItem[data-play-index="${index}"]`)?.scrollIntoView({block:'nearest'});
    const utter=new SpeechSynthesisUtterance(String(item.english||''));
    utter.lang='en-US';
    utter.rate=Math.max(.5,Math.min(2,Number($('rate')?.value)||.85));
    const voice=selectedVoice(); if(voice) utter.voice=voice;
    let ended=false;
    const finish=(error=false)=>{
      if(ended||token!==queueToken) return;
      ended=true; clearTimeout(queueTimer);
      if(error){ repeated=0; index++; }
      else { repeated++; if(repeated>=repeats){ repeated=0; index++; } }
      queueTimer=setTimeout(play,error?200:gap);
    };
    utter.onend=()=>finish(false);
    utter.onerror=()=>finish(true);
    const words=String(item.english||'').trim().split(/\s+/).filter(Boolean).length;
    queueTimer=setTimeout(()=>finish(false),Math.max(5000,(words*850/utter.rate)+3000));
    try{ window.speechSynthesis.resume(); window.speechSynthesis.speak(utter); }
    catch(_){ finish(true); }
  };
  play();
}
function bind(id,mode){ const el=$(id); if(el) el.onclick=e=>{e.preventDefault();startQueue(mode);}; }
bind('playTopic','topic'); bind('playReview','review'); bind('playFav','fav');
if($('stopPlay')) $('stopPlay').onclick=e=>{e.preventDefault();stopQueue(true);};

// Make topic cards open through one direct route only.
document.addEventListener('click',e=>{
  const card=e.target.closest('.topicsScreenCard[data-topic-start]');
  if(!card||e.target.closest('[data-topic-action]')) return;
  e.preventDefault();
  if(typeof state!=='undefined') state.i=Math.max(0,Number(card.dataset.topicStart)||0);
  if(typeof save==='function') save();
  if(typeof render==='function') render();
  const learn=$('learn');
  if(learn){
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    learn.classList.add('active');
    document.querySelectorAll('[data-screen]').forEach(x=>x.classList.toggle('active',x.dataset.screen==='learn'));
    window.scrollTo(0,0);
  }
},false);

window.addEventListener('beforeunload',()=>stopQueue(false));

// Remove old cached app versions when the fixed page loads.
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(regs.map(r=>r.update().catch(()=>{})))).catch(()=>{});
}
if('caches' in window){ caches.keys().then(keys=>Promise.all(keys.filter(k=>k!=='nada-academy-v281-final').map(k=>caches.delete(k)))).catch(()=>{}); }
})();
