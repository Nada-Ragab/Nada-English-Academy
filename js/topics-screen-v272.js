(()=>{
'use strict';
const $=id=>document.getElementById(id);
let filter='all';
let limit=12;
const icons=['👋','🙋','🪪','👨‍👩‍👧','⏰','🏠','🍽️','☕','🛍️','💰','🕒','📅','🌤️','🧭','🚗','✈️','🏨','🏫','📝','💼','🤝','🎯','✉️','📱','🌐','🆘','💡','🙏','🗣️','⚖️','😊','🩺','🚨','🛠️','🎨','🏃','👗','🧹','🏙️','🏦','💊','🧳','🤗','📚'];
const accents=['#dbeafe','#ede9fe','#dcfce7','#ffedd5','#fce7f3','#cffafe'];
const esc=value=>typeof escapeHtml==='function'?escapeHtml(String(value??'')):String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
function knownCount(topic){
 const start=Number(topic.start_index||0), count=Number(topic.count||0);
 return (typeof S!=='undefined'?S:[]).slice(start,start+count).filter(x=>state?.known?.[x.number]).length;
}
function rows(){
 const q=($('topicsScreenSearch')?.value||'').trim().toLowerCase();
 let list=(typeof T!=='undefined'?T:[]).map((topic,index)=>({...topic,_index:index,_known:knownCount(topic)}));
 if(filter==='custom')list=list.filter(x=>x.custom);
 if(filter==='progress')list=list.filter(x=>x._known>0&&x._known<Number(x.count||0));
 if(filter==='recent')list=list.sort((a,b)=>Math.abs(Number(state?.i||0)-Number(a.start_index||0))-Math.abs(Number(state?.i||0)-Number(b.start_index||0)));
 if(q)list=list.filter(x=>String(x.title_en||'').toLowerCase().includes(q)||String(x.title_ar||'').toLowerCase().includes(q));
 return list;
}
function renderTopicsScreen(){
 const grid=$('topicsScreenGrid'); if(!grid)return;
 const all=rows(), visible=all.slice(0,limit);
 const totalKnown=(typeof T!=='undefined'?T:[]).reduce((sum,t)=>sum+knownCount(t),0);
 if($('topicsScreenCount'))$('topicsScreenCount').textContent=String((typeof T!=='undefined'?T:[]).length);
 if($('topicsScreenKnown'))$('topicsScreenKnown').textContent=String(totalKnown);
 grid.innerHTML=visible.length?visible.map((t,i)=>{
   const count=Number(t.count||0), pct=count?Math.round((t._known/count)*100):0;
   const icon=t.custom?'⭐':icons[(Number(t.id)||t._index||i)%icons.length];
   const accent=accents[(Number(t.id)||t._index||i)%accents.length];
   return `<article class="topicsScreenCard ${t.pinned?'pinned':''}" data-topic-start="${Number(t.start_index||0)}" data-topic-id="${esc(t.id)}" style="--topic-accent:${accent}">
     <div class="topicsScreenCardTop"><span class="topicsScreenIcon">${icon}</span><span>${t.custom?'CUSTOM':'TOPIC '+esc(t.number||t.id||i+1)}</span></div>
     <h3>${t.pinned?'📌 ':''}${esc(t.title_en||'Topic')}</h3><p>${esc(t.title_ar||'')}</p>
     <div class="topicsScreenMeta"><span>${t._known}/${count} جملة</span><span>${pct}%</span></div>
     <div class="topicsScreenProgress"><i style="width:${pct}%"></i></div>
     <button class="topicsScreenStart" type="button">ابدئي التعلّم ←</button>
     <div class="topicsScreenCardActions"><button data-topic-action="manage" title="إدارة الموضوع">✏️</button><button data-topic-action="delete" title="حذف">🗑️</button><button data-topic-action="duplicate" title="نسخ">📋</button><button data-topic-action="pin" title="تثبيت">${t.pinned?'📍':'📌'}</button></div>
   </article>`;
 }).join(''):'<div class="topicsScreenEmpty">لا توجد موضوعات مطابقة للبحث.</div>';
 grid.querySelectorAll('[data-topic-start]').forEach(card=>card.addEventListener('click',event=>{
   if(event.target.closest('[data-topic-action]'))return;
   state.i=Number(card.dataset.topicStart)||0;
   if(typeof save==='function')save();
   if(typeof render==='function')render();
   if(typeof openScreen==='function')openScreen('learn');
 }));
 grid.querySelectorAll('[data-topic-action]').forEach(button=>button.addEventListener('click',event=>{
   event.stopPropagation();
   const card=button.closest('[data-topic-id]');
   const topic=(typeof T!=='undefined'?T:[]).find(x=>String(x.id)===String(card?.dataset.topicId));
   const action=button.dataset.topicAction;
   if(action==='manage'&&typeof manageAnyTopic==='function')manageAnyTopic(topic);
   if(action==='delete'&&typeof deleteAnyTopic==='function')deleteAnyTopic(topic);
   if(action==='duplicate'&&typeof duplicateAnyTopic==='function')duplicateAnyTopic(topic);
   if(action==='pin'&&typeof togglePinAnyTopic==='function')togglePinAnyTopic(topic);
   setTimeout(renderTopicsScreen,100);
 }));
 const more=$('topicsScreenMore');
 if(more){more.style.display=all.length>limit?'block':'none';more.textContent=limit>=all.length?'تم عرض كل الموضوعات':'عرض المزيد من الموضوعات';}
}
function init(){
 $('topicsScreenSearch')?.addEventListener('input',()=>{limit=12;renderTopicsScreen();});
 $('topicsScreenClear')?.addEventListener('click',()=>{if($('topicsScreenSearch'))$('topicsScreenSearch').value='';limit=12;renderTopicsScreen();$('topicsScreenSearch')?.focus();});
 document.querySelectorAll('[data-topics-screen-filter]').forEach(button=>button.addEventListener('click',()=>{
   document.querySelectorAll('[data-topics-screen-filter]').forEach(x=>x.classList.remove('active'));
   button.classList.add('active');filter=button.dataset.topicsScreenFilter||'all';limit=12;renderTopicsScreen();
 }));
 $('topicsScreenMore')?.addEventListener('click',()=>{limit+=12;renderTopicsScreen();});
 $('topicsScreenAdd')?.addEventListener('click',()=>typeof openTopicModal==='function'&&openTopicModal());
 $('topicsScreenImport')?.addEventListener('click',()=>$('topicFileInput')?.click());
 $('topicsScreenExport')?.addEventListener('click',()=>$('exportTopicsBtn')?.click());
 document.querySelectorAll('[data-screen="topicscreen"]').forEach(button=>button.addEventListener('click',()=>setTimeout(renderTopicsScreen,0)));
 window.addEventListener('nada:data-changed',renderTopicsScreen);
 window.addEventListener('storage',renderTopicsScreen);
 renderTopicsScreen();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.renderTopicsScreen=renderTopicsScreen;
})();
