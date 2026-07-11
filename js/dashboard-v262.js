(()=>{
'use strict';
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
const openScreen=name=>document.querySelector(`[data-screen="${name}"]`)?.click();
function getState(){return window.state||read('nada_v12_state',{});}
function odooState(){return read('nada_odoo_academy_v1',{done:{},scores:{},lastModule:'payroll'});}
function chooseNext(){
 const state=getState();
 const review=Object.keys(state.review||{}).length;
 const ai=read('nada_ai_last_report_v1',{});
 const odoo=odooState();
 const done=Object.values(odoo.done||{}).filter(Boolean).length;
 if(review>0)return{icon:'🧠',title:`راجعي ${review} عنصرًا`,text:'ابدئي بالمراجعة لتثبيت الجمل والكلمات الصعبة.',screen:'review'};
 if(done<5)return{icon:'💼',title:'كمّلي Odoo Academy',text:'تابعي درسًا مهنيًا قصيرًا وطوّري English for Work.',screen:'odooacademy'};
 if(Object.keys(ai).length)return{icon:'🤖',title:'تابعي AI Teacher',text:'طبّقي ملاحظات آخر جلسة في محادثة قصيرة.',screen:'aiteacher'};
 return{icon:'▶️',title:'متابعة التعلّم',text:'كمّلي من آخر نقطة وصلتِ إليها اليوم.',screen:'learn'};
}
function updateSync(){
 const pill=$('sidebarSyncPill');if(!pill)return;
 const online=navigator.onLine;
 pill.textContent=online?'☁️ متصل':'☁️ أوفلاين';
 pill.classList.toggle('offline',!online);
}
function render(){
 const next=chooseNext();
 if($('sideNextIcon'))$('sideNextIcon').textContent=next.icon;
 if($('sideNextTitle'))$('sideNextTitle').textContent=next.title;
 if($('sideNextText'))$('sideNextText').textContent=next.text;
 if($('sideNextBtn'))$('sideNextBtn').onclick=()=>openScreen(next.screen);
 const state=getState();
 const review=Object.keys(state.review||{}).length;
 const odoo=odooState();
 const done=Object.values(odoo.done||{}).filter(Boolean).length;
 const scores=Object.values(odoo.scores||{}).map(Number).filter(n=>Number.isFinite(n));
 const best=scores.length?Math.max(...scores):0;
 const week=read('nada_week_activity_v1',{});
 const today=new Date();let weekMinutes=0;
 for(let i=0;i<7;i++){const d=new Date(today);d.setDate(d.getDate()-i);weekMinutes+=Number(week[d.toISOString().slice(0,10)]||0);}
 if($('focusWeekText'))$('focusWeekText').textContent=weekMinutes?`${Math.round(weekMinutes)} دقيقة تعلّم`:'ابدئي أول نشاط';
 if($('focusOdooText'))$('focusOdooText').textContent=done?`${done} دروس • أفضل اختبار ${best||'—'}%`:'ابدئي أول موديول';
 if($('focusReviewText'))$('focusReviewText').textContent=review?`${review} عنصرًا بانتظارك`:'كل شيء مراجع ✅';
 updateSync();
}
window.addEventListener('online',updateSync);window.addEventListener('offline',updateSync);
window.addEventListener('storage',render);window.addEventListener('nada:data-changed',()=>setTimeout(render,50));
window.addEventListener('load',()=>setTimeout(render,500));
if(document.readyState!=='loading')setTimeout(render,50);
})();
