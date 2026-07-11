(()=>{
'use strict';
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
function toggleGroup(group){group.classList.toggle('open');const i=group.querySelector('.sideGroupToggle i');if(i)i.textContent=group.classList.contains('open')?'⌃':'⌄';}
function toggleUtility(card){card.classList.toggle('open');const i=card.querySelector('.sidebarUtilityToggle i');if(i)i.textContent=card.classList.contains('open')?'⌃':'⌄';}
function getActivity(){return read('nada_v2001_daily_activity',read('nada_v199_daily_activity',{}));}
function dayKey(){return new Date().toISOString().slice(0,10)}
function refreshSidebarStats(){
 const state=window.state||read('nada_v12_state',{}); const total=(window.sentences||window.DATA?.sentences||[]).length||1000;
 const known=Object.keys(state.known||{}).length, review=Object.keys(state.review||{}).length;
 const pct=Math.min(100,Math.round((known/Math.max(1,total))*100));
 const streak=Number(state.streak||1); const today=getActivity()[dayKey()]||{}; const mins=Math.round(Number(today.minutes||0));
 const report=read('nada_ai_last_report_v1',{}); const rating=report.overallScore||report.overall||report.grammarScore||0;
 const goal=Math.min(15,Number(today.known||0)); const goalPct=Math.round(goal/15*100);
 if($('sidebarOverallPct'))$('sidebarOverallPct').textContent=pct+'%';
 if($('sidebarProgressRing'))$('sidebarProgressRing').style.setProperty('--side-pct',pct+'%');
 if($('sidebarStreakStat'))$('sidebarStreakStat').textContent=streak;
 if($('sidebarStudyStat'))$('sidebarStudyStat').textContent=mins+' د';
 if($('sidebarKnownStat'))$('sidebarKnownStat').textContent=known;
 if($('sidebarRatingStat'))$('sidebarRatingStat').textContent=rating?Math.round(Number(rating))+'%':'—';
 if($('sidebarChallengeCount'))$('sidebarChallengeCount').textContent=goal+'/15';
 if($('sidebarChallengeBar'))$('sidebarChallengeBar').style.width=goalPct+'%';
 if($('sidebarChallengeText'))$('sidebarChallengeText').textContent=goal>=15?'رائع! أنجزتِ تحدي اليوم بالكامل.':'أتقني '+(15-goal)+' جملة إضافية لإكمال تحدي اليوم.';
}
function ensureActiveGroup(){const active=document.querySelector('.sidebarV260 .navItem.active');if(active){const group=active.closest('.sideGroup');if(group&&!group.classList.contains('open'))toggleGroup(group);}}
function init(){
 document.querySelectorAll('.sideGroupToggle').forEach(btn=>btn.addEventListener('click',()=>toggleGroup(btn.closest('.sideGroup'))));
 document.querySelectorAll('.sidebarUtilityToggle').forEach(btn=>btn.addEventListener('click',()=>toggleUtility(btn.closest('.sideUtilityCard'))));
 const fold=$('sidebarFoldBtn');if(fold)fold.addEventListener('click',()=>{$('sidebarCollapse')?.click()});
 document.querySelectorAll('.sidebarV260 .tab.navItem').forEach(btn=>btn.addEventListener('click',()=>{setTimeout(ensureActiveGroup,0)}));
 refreshSidebarStats();ensureActiveGroup();
 window.addEventListener('nada:data-changed',refreshSidebarStats);window.addEventListener('storage',refreshSidebarStats);
 setInterval(refreshSidebarStats,15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
