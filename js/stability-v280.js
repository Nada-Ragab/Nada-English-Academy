(()=>{
'use strict';
const $=id=>document.getElementById(id);
const safe=(fn)=>{try{return fn()}catch(err){console.error('[V28 stability]',err);return null}};

// One reliable navigation path for every sidebar/header/mobile button.
function navigate(screen){
 if(!screen)return;
 document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id===screen));
 document.querySelectorAll('.tab[data-screen],.navItem[data-screen]').forEach(el=>el.classList.toggle('active',el.dataset.screen===screen));
 try{localStorage.setItem('nea_last_screen',screen)}catch{}
 if(screen==='topicscreen') safe(()=>window.renderTopicsScreen?.());
 if(screen==='odoomodules') safe(()=>window.renderOdooModulesScreen?.());
 if(screen==='favorites') safe(()=>window.renderFavoritesScreen?.());
 if(screen==='dashboard') safe(()=>window.refreshDashboard?.());
 window.scrollTo({top:0,behavior:'auto'});
}
window.openScreen=navigate;
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-screen],[data-go],[data-quick-go]');
 if(!nav)return;
 const screen=nav.dataset.screen||nav.dataset.go||nav.dataset.quickGo;
 if(!screen||!$(screen))return;
 e.preventDefault();
 navigate(screen);
},true);

// Topics: use event delegation so rerendering never loses click handlers.
document.addEventListener('click',e=>{
 const card=e.target.closest('.topicsScreenCard[data-topic-start]');
 if(!card||e.target.closest('[data-topic-action]'))return;
 e.preventDefault();e.stopPropagation();
 safe(()=>{
   if(typeof state!=='undefined')state.i=Math.max(0,Number(card.dataset.topicStart)||0);
   if(typeof save==='function')save();
   if(typeof render==='function')render();
   navigate('learn');
 });
},true);

// Stable speech queue with completion watchdog for browsers that sometimes omit onend.
let session=0, timer=0, currentUtterance=null;
function stopAudio(showMessage=false){
 session++; clearTimeout(timer); timer=0; currentUtterance=null;
 safe(()=>speechSynthesis.cancel());
 document.querySelectorAll('#playlistOut .playItem').forEach(x=>x.classList.remove('playing'));
 if(showMessage&&typeof toast==='function')toast('تم إيقاف القائمة');
}
function getVoice(){
 const list=safe(()=>speechSynthesis.getVoices())||[];
 const idx=Number($('voice')?.value);
 return list[idx]||list.find(v=>/^en/i.test(v.lang))||null;
}
function playlist(mode){
 const cur=(typeof S!=='undefined'&&typeof state!=='undefined')?S[state.i]:null;
 if(!cur)return [];
 if(mode==='topic')return S.filter(x=>String(x.topic_id)===String(cur.topic_id));
 if(mode==='review')return Object.keys(state.review||{}).map(n=>S.find(x=>String(x.number)===String(n))).filter(Boolean);
 if(mode==='fav')return Object.keys(state.fav||{}).map(n=>S.find(x=>String(x.number)===String(n))).filter(Boolean);
 return [];
}
function renderList(list){
 const out=$('playlistOut');if(!out)return;
 out.innerHTML=list.map(x=>`<div class="playItem" data-number="${Number(x.number)||0}"><b>${Number(x.number)||''}. ${typeof escapeHtml==='function'?escapeHtml(x.english):x.english}</b><small>${typeof escapeHtml==='function'?escapeHtml(x.arabic):x.arabic}</small></div>`).join('')||'<p>لا توجد جمل في هذه القائمة.</p>';
}
function playQueue(mode){
 stopAudio(false);
 const my=++session,list=playlist(mode);renderList(list);
 if(!list.length){if(typeof toast==='function')toast('لا توجد جمل في هذه القائمة');return;}
 const reps=Math.min(5,Math.max(1,Number($('repeatCount')?.value)||1));
 const gap=Math.min(10,Math.max(0,Number($('gapSeconds')?.value)||2))*1000;
 let index=0,repeat=0;
 const next=()=>{
   if(my!==session)return;
   if(index>=list.length){document.querySelectorAll('#playlistOut .playItem').forEach(x=>x.classList.remove('playing'));if(typeof toast==='function')toast('تم تشغيل القائمة كاملة ✅');return;}
   const item=list[index],u=new SpeechSynthesisUtterance(String(item.english||''));currentUtterance=u;
   u.lang='en-US';u.rate=Math.min(2,Math.max(.5,Number($('rate')?.value)||.85));
   const voice=getVoice();if(voice)u.voice=voice;
   document.querySelectorAll('#playlistOut .playItem').forEach((x,i)=>x.classList.toggle('playing',i===index));
   document.querySelector('#playlistOut .playItem.playing')?.scrollIntoView({block:'nearest'});
   let finished=false;
   const done=(failed=false)=>{if(finished||my!==session)return;finished=true;clearTimeout(timer);if(failed){repeat=0;index++;}else{repeat++;if(repeat>=reps){repeat=0;index++;}}timer=setTimeout(next,failed?250:gap);};
   u.onend=()=>done(false);u.onerror=()=>done(true);
   // Fallback: estimated duration, prevents a frozen queue when the browser misses onend.
   const words=String(item.english||'').trim().split(/\s+/).filter(Boolean).length;
   timer=setTimeout(()=>done(false),Math.max(3500,words*900/u.rate+2500));
   safe(()=>{speechSynthesis.resume();speechSynthesis.speak(u)});
 };
 next();
}
const bindings={playTopic:'topic',playReview:'review',playFav:'fav'};
Object.entries(bindings).forEach(([id,mode])=>{const el=$(id);if(el)el.onclick=e=>{e.preventDefault();playQueue(mode)}});
if($('stopPlay'))$('stopPlay').onclick=e=>{e.preventDefault();stopAudio(true)};
window.addEventListener('beforeunload',()=>stopAudio(false));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&currentUtterance)safe(()=>speechSynthesis.pause());else if(currentUtterance)safe(()=>speechSynthesis.resume())});

// Prevent keyboard shortcuts from calling removed legacy IDs.
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;
 if(e.key==='ArrowRight')$('nextBtn')?.click();
 if(e.key==='ArrowLeft')$('prevBtn')?.click();
 if(e.key.toLowerCase()==='k')$('knowBtn')?.click();
 if(e.key.toLowerCase()==='r')$('againBtn')?.click();
},true);

// Restore the last valid screen only after all scripts initialize.
setTimeout(()=>{const last=safe(()=>localStorage.getItem('nea_last_screen'));if(last&&$(last))navigate(last)},250);
window.addEventListener('error',e=>console.error('[App error]',e.error||e.message));
window.addEventListener('unhandledrejection',e=>console.error('[Promise error]',e.reason));
})();
