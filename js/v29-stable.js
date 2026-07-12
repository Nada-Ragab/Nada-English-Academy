(function(){
'use strict';
const $=id=>document.getElementById(id);

function showScreen(id){
  document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
  document.querySelectorAll('[data-screen]').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));
  try{window.scrollTo(0,0);}catch(_){ }
}

function topicIndex(card){
  const raw=card?.getAttribute('data-topic-start') ?? card?.getAttribute('data-start');
  const n=Number(raw);
  return Number.isFinite(n)?Math.max(0,n):null;
}

function openTopic(card){
  const n=topicIndex(card);
  if(n===null)return;
  try{
    window.state.i=n;
    if(typeof window.save==='function')window.save();
    if(typeof window.render==='function')window.render();
  }catch(err){console.error('Topic open error:',err);}
  showScreen('learn');
  setTimeout(()=>$('en')?.scrollIntoView({block:'center'}),0);
}

document.addEventListener('click',function(e){
  const topicsNav=e.target.closest('[data-screen="topicscreen"],#sidebarTopicsShortcut');
  if(topicsNav){
    e.preventDefault();
    e.stopImmediatePropagation();
    showScreen('topicscreen');
    try{window.renderTopicsScreen?.();}catch(_){ }
    return;
  }
  if(e.target.closest('[data-topic-action],.topicsScreenCardActions,.premiumTopicActions,.topicActions'))return;
  const card=e.target.closest('.topicsScreenCard[data-topic-start],.premiumTopicCard[data-topic-start],.topicCard[data-start],.topicMain[data-start]');
  if(card){
    e.preventDefault();
    e.stopImmediatePropagation();
    openTopic(card);
  }
},true);

/* One audio engine only. No cancel between sentences. */
let active=false;
let waitingTimer=0;
let watchdogTimer=0;
let currentUtterance=null;
let currentList=[];
let currentIndex=0;
let currentRepeat=0;
let repeatCount=1;
let gapMs=0;

function clearTimers(){
  if(waitingTimer){clearTimeout(waitingTimer);waitingTimer=0;}
  if(watchdogTimer){clearTimeout(watchdogTimer);watchdogTimer=0;}
}

function status(text){
  let el=$('playlistStatus');
  if(!el&&$('playlistOut')){
    el=document.createElement('div');
    el.id='playlistStatus';
    el.className='noteBox';
    $('playlistOut').before(el);
  }
  if(el)el.textContent=text;
}

function stopAll(message){
  active=false;
  clearTimers();
  currentUtterance=null;
  try{window.speechSynthesis.cancel();}catch(_){ }
  document.querySelectorAll('#playlistOut .playItem').forEach(x=>x.classList.remove('playing'));
  if(message)status(message);
}

function listFor(mode){
  const store=window.NadaAcademyData||{};
  const data=Array.isArray(store.sentences)?store.sentences:[];
  const st=store.state||{};
  if(mode==='topic'){
    const selectedId=$('playlistTopicSelect')?.value;
    if(selectedId)return data.filter(x=>String(x.topic_id)===String(selectedId));
    const cur=data[Math.max(0,Number(st.i)||0)];
    return cur?data.filter(x=>String(x.topic_id)===String(cur.topic_id)):[];
  }
  const source=mode==='review'?(st.review||{}):(st.fav||{});
  return Object.keys(source).map(n=>data.find(x=>String(x.number)===String(n))).filter(Boolean);
}

function esc(value){
  if(typeof window.escapeHtml==='function')return window.escapeHtml(value);
  return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function renderList(list){
  const out=$('playlistOut');
  if(!out)return;
  out.innerHTML=list.map((x,i)=>`<div class="playItem" data-play-index="${i}"><button type="button" class="sentenceAudioBtn" data-sentence-index="${i}" aria-label="تشغيل الجملة ${esc(x.number)}" title="تشغيل الجملة">🔊</button><div class="sentenceText"><b>${esc(x.number)}. ${esc(x.english)}</b><small>${esc(x.arabic||'')}</small></div></div>`).join('')||'<p>لا توجد جمل في هذه القائمة.</p>';
  const count=$('playlistSentenceCount');
  if(count)count.textContent=list.length?`${list.length} جملة`:'';
}

function selectedVoice(){
  try{
    const all=window.speechSynthesis.getVoices()||[];
    const english=all.filter(v=>/^en/i.test(v.lang||'')||/English/i.test(v.name||''));
    const idx=Math.max(0,Number($('voice')?.value)||0);
    return english[idx]||english[0]||all.find(v=>/^en/i.test(v.lang||''))||null;
  }catch(_){return null;}
}

function highlight(index){
  document.querySelectorAll('#playlistOut .playItem').forEach((el,i)=>el.classList.toggle('playing',i===index));
  document.querySelector(`#playlistOut .playItem[data-play-index="${index}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'});
}

function estimatedMs(text,rate){
  const words=String(text||'').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4000,Math.min(20000,(words*800/Math.max(.5,rate))+3000));
}

function advance(){
  if(!active)return;
  clearTimers();
  currentRepeat++;
  if(currentRepeat>=repeatCount){
    currentRepeat=0;
    currentIndex++;
  }
  if(currentIndex>=currentList.length){
    active=false;
    currentUtterance=null;
    document.querySelectorAll('#playlistOut .playItem').forEach(x=>x.classList.remove('playing'));
    status('تم تشغيل القائمة كاملة ✅');
    return;
  }
  status(`انتظار ${Math.round(gapMs/1000)} ثانية — التالي ${currentIndex+1} من ${currentList.length}`);
  waitingTimer=setTimeout(speakCurrent,gapMs);
}

function speakCurrent(){
  if(!active)return;
  clearTimers();
  const item=currentList[currentIndex];
  if(!item){advance();return;}

  const rate=Math.max(.5,Math.min(2,Number($('rate')?.value)||.85));
  const utterance=new SpeechSynthesisUtterance(String(item.english||''));
  currentUtterance=utterance;
  utterance.lang='en-US';
  utterance.rate=rate;
  const voice=selectedVoice();
  if(voice)utterance.voice=voice;

  let completed=false;
  const finish=()=>{
    if(completed||!active||currentUtterance!==utterance)return;
    completed=true;
    currentUtterance=null;
    advance();
  };

  utterance.onstart=()=>{
    if(!active||currentUtterance!==utterance)return;
    highlight(currentIndex);
    status(`تشغيل ${currentIndex+1} من ${currentList.length} — تكرار ${currentRepeat+1} من ${repeatCount}`);
  };
  utterance.onend=finish;
  utterance.onerror=(event)=>{
    console.warn('Speech error:',event?.error||event);
    finish();
  };

  // Fallback only if the browser omits onend. It does not compete with normal onend.
  watchdogTimer=setTimeout(finish,estimatedMs(item.english,rate));

  try{
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }catch(err){
    console.error('Speech start error:',err);
    finish();
  }
}

function start(mode){
  stopAll();
  currentList=listFor(mode);
  renderList(currentList);
  if(!currentList.length){status('لا توجد جمل في هذه القائمة');return;}
  if(!('speechSynthesis' in window)||typeof window.SpeechSynthesisUtterance==='undefined'){
    status('المتصفح لا يدعم تشغيل الصوت');
    return;
  }
  repeatCount=Math.max(1,Math.min(10,Number($('repeatCount')?.value)||1));
  gapMs=Math.max(0,Math.min(30,Number($('gapSeconds')?.value)||0))*1000;
  currentIndex=0;
  currentRepeat=0;
  active=true;
  // First sentence starts inside the user click event.
  speakCurrent();
}

function bind(id,fn){
  const el=$(id);
  if(!el)return;
  el.onclick=function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    fn();
    return false;
  };
}

function playOneSentence(index){
  const list=listFor('topic');
  const item=list[index];
  if(!item)return;
  stopAll();
  renderList(list);
  const rate=Math.max(.5,Math.min(2,Number($('rate')?.value)||.85));
  const utterance=new SpeechSynthesisUtterance(String(item.english||''));
  utterance.lang='en-US';
  utterance.rate=rate;
  const voice=selectedVoice();
  if(voice)utterance.voice=voice;
  currentUtterance=utterance;
  highlight(index);
  status(`تشغيل الجملة ${index+1} من ${list.length}`);
  utterance.onend=()=>{currentUtterance=null;};
  utterance.onerror=()=>{currentUtterance=null;status('تعذر تشغيل الجملة');};
  try{window.speechSynthesis.resume();window.speechSynthesis.speak(utterance);}catch(_){status('تعذر تشغيل الجملة');}
}

function populateTopicSelect(){
  const hidden=$('playlistTopicSelect');
  const input=$('playlistTopicSearch');
  const listBox=$('playlistTopicList');
  if(!hidden||!input||!listBox)return;
  const store=window.NadaAcademyData||{};
  const topics=Array.isArray(store.topics)?store.topics:[];
  const title=$('playlistSelectedTitle');
  const labelOf=t=>`${String(t.number||t.id).padStart(2,'0')} - ${t.title_en||''} | ${t.title_ar||''}`;

  const choose=id=>{
    const topic=topics.find(t=>String(t.id)===String(id));
    if(!topic)return;
    hidden.value=String(topic.id);
    listBox.querySelectorAll('.playlistTopicRow').forEach(btn=>btn.classList.toggle('active',String(btn.dataset.topicId)===String(topic.id)));
    if(title)title.textContent=labelOf(topic);
    stopAll();
    const list=listFor('topic');
    renderList(list);
    status(list.length?`تم اختيار التوبك — ${list.length} جملة`:'التوبك لا يحتوي على جمل');
  };

  const renderTopics=(query='')=>{
    const q=String(query||'').trim().toLowerCase();
    const filtered=topics.filter(t=>!q||labelOf(t).toLowerCase().includes(q));
    listBox.innerHTML=filtered.map(t=>`<button type="button" class="playlistTopicRow" data-topic-id="${esc(t.id)}" role="option">${esc(labelOf(t))}</button>`).join('')||'<div class="topicPickerEmpty">لا توجد نتائج</div>';
    if(hidden.value)listBox.querySelector(`[data-topic-id="${CSS.escape(hidden.value)}"]`)?.classList.add('active');
  };

  input.addEventListener('input',()=>renderTopics(input.value));
  listBox.addEventListener('click',e=>{
    const btn=e.target.closest('.playlistTopicRow');
    if(btn)choose(btn.dataset.topicId);
  });
  $('playlistOut')?.addEventListener('click',e=>{
    const btn=e.target.closest('.sentenceAudioBtn');
    if(btn)playOneSentence(Number(btn.dataset.sentenceIndex));
  });

  renderTopics();
  const data=Array.isArray(store.sentences)?store.sentences:[];
  const st=store.state||{};
  const cur=data[Math.max(0,Number(st.i)||0)];
  const initial=cur?String(cur.topic_id):String(topics[0]?.id||'');
  if(initial)choose(initial);
}
function init(){
  populateTopicSelect();
  bind('playTopic',()=>start('topic'));
  bind('playReview',()=>start('review'));
  bind('playFav',()=>start('fav'));
  bind('stopPlay',()=>stopAll('تم إيقاف القائمة'));
  document.documentElement.dataset.version='29.11';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();

window.NadaV29={showScreen,start,stop:stopAll};
})();
