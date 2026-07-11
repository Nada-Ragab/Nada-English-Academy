(function(){
'use strict';
const $=id=>document.getElementById(id);
function showScreen(id){
 document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
 document.querySelectorAll('[data-screen]').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));
 try{window.scrollTo(0,0);}catch(e){}
}
function topicIndex(card){
 const raw=card?.getAttribute('data-topic-start') ?? card?.getAttribute('data-start');
 const n=Number(raw); return Number.isFinite(n)?Math.max(0,n):null;
}
function openTopic(card){
 const n=topicIndex(card); if(n===null)return;
 try{ window.state.i=n; if(typeof window.save==='function')window.save(); if(typeof window.render==='function')window.render(); }catch(e){console.error(e);}
 showScreen('learn'); setTimeout(()=>$('en')?.scrollIntoView({block:'center'}),0);
}
document.addEventListener('click',function(e){
 const topicsNav=e.target.closest('[data-screen="topicscreen"],#sidebarTopicsShortcut');
 if(topicsNav){e.preventDefault();e.stopImmediatePropagation();showScreen('topicscreen');try{window.renderTopicsScreen?.();}catch(_){}return;}
 if(e.target.closest('[data-topic-action],.topicsScreenCardActions,.premiumTopicActions,.topicActions'))return;
 const card=e.target.closest('.topicsScreenCard[data-topic-start],.premiumTopicCard[data-topic-start],.topicCard[data-start],.topicMain[data-start]');
 if(card){e.preventDefault();e.stopImmediatePropagation();openTopic(card);}
},true);

let runId=0, timer=0, current=null, paused=false, modeNow='';
function clearTimer(){if(timer){clearTimeout(timer);timer=0;}}
function stopAll(message){runId++;paused=false;clearTimer();current=null;try{speechSynthesis.cancel();}catch(_){};document.querySelectorAll('#playlistOut .playItem').forEach(x=>x.classList.remove('playing'));if(message)status(message);}
function status(text){let el=$('playlistStatus');if(!el&&$('playlistOut')){el=document.createElement('div');el.id='playlistStatus';el.className='noteBox';$('playlistOut').before(el);}if(el)el.textContent=text;}
function listFor(mode){
 const data=Array.isArray(window.S)?window.S:[]; const st=window.state||{}; const cur=data[Number(st.i)||0];
 if(mode==='topic'&&cur)return data.filter(x=>x.topic_id===cur.topic_id);
 if(mode==='review')return Object.keys(st.review||{}).map(n=>data[Number(n)-1]).filter(Boolean);
 if(mode==='fav')return Object.keys(st.fav||{}).map(n=>data[Number(n)-1]).filter(Boolean);
 return [];
}
function renderList(list){const out=$('playlistOut');if(!out)return;out.innerHTML=list.map((x,i)=>`<div class="playItem" data-play-index="${i}"><b>${x.number}. ${x.english}</b><small>${x.arabic||''}</small></div>`).join('')||'<p>لا توجد جمل في هذه القائمة.</p>';}
function estimatedMs(text,rate){const words=String(text||'').trim().split(/\s+/).filter(Boolean).length;return Math.max(1800,Math.min(15000,(words*520/Math.max(.5,rate))+1300));}
function start(mode){
 stopAll(); modeNow=mode; const list=listFor(mode);renderList(list);if(!list.length){status('لا توجد جمل في هذه القائمة');return;}
 const my=runId;const reps=Math.max(1,Number($('repeatCount')?.value)||1);const gap=Math.max(0,Number($('gapSeconds')?.value)||0)*1000;let i=0,r=0;
 function next(){
  if(my!==runId||paused)return;
  if(i>=list.length){status('تم تشغيل القائمة كاملة ✅');stopAll();return;}
  const item=list[i];document.querySelectorAll('#playlistOut .playItem').forEach((x,k)=>x.classList.toggle('playing',k===i));
  status(`تشغيل ${i+1} من ${list.length} — تكرار ${r+1} من ${reps}`);
  try{speechSynthesis.cancel();}catch(_){}
  const rate=Number($('rate')?.value)||0.85;const u=new SpeechSynthesisUtterance(String(item.english||''));current=u;u.lang='en-US';u.rate=rate;
  try{const vs=typeof voices!=='undefined'?voices:speechSynthesis.getVoices().filter(v=>/en/i.test(v.lang));const v=vs?.[Number($('voice')?.value)];if(v)u.voice=v;}catch(_){}
  let finished=false;
  const done=()=>{if(finished||my!==runId)return;finished=true;clearTimer();r++;if(r>=reps){r=0;i++;}timer=setTimeout(next,gap);};
  u.onend=done;u.onerror=done;
  timer=setTimeout(done,estimatedMs(item.english,rate));
  setTimeout(()=>{if(my===runId&&!paused){try{speechSynthesis.speak(u);}catch(e){done();}}},120);
 }
 next();
}
function bind(id,fn){const el=$(id);if(el)el.onclick=function(e){e.preventDefault();e.stopImmediatePropagation();fn();};}
function init(){
 bind('playTopic',()=>start('topic'));bind('playReview',()=>start('review'));bind('playFav',()=>start('fav'));bind('stopPlay',()=>stopAll('تم إيقاف القائمة'));
 // keep synthesis awake in Edge during long playlists
 setInterval(()=>{try{if(speechSynthesis.speaking&&!speechSynthesis.paused)speechSynthesis.resume();}catch(_){}},5000);
 document.documentElement.dataset.version='29.0';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.NadaV29={showScreen,start,stop:stopAll};
})();
