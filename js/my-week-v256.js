(function(){
'use strict';
const $=id=>document.getElementById(id);
const GOAL_KEY='nada_week_goals_v256';
const DAY_KEY='nada_my_day_v255';
const HISTORY_KEY='nada_my_day_history_v255';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const read=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const write=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('nada:data-changed'));};
const openScreen=id=>document.querySelector(`[data-screen="${id}"]`)?.click();
const iso=d=>d.toISOString().slice(0,10);
function last7(){const out=[],now=new Date();for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);out.push({date:d,key:iso(d)});}return out;}
function snapshot(){
  const history=read(HISTORY_KEY,{}),days=last7();
  let tasksDone=0,totalTasks=0,minutes=0;
  const activity=days.map(({date,key})=>{const h=history[key]||{done:0,total:0,minutes:0};tasksDone+=Number(h.done||0);totalTasks+=Number(h.total||0);minutes+=Number(h.minutes||0);return{key,label:new Intl.DateTimeFormat('ar-EG',{weekday:'short'}).format(date),done:Number(h.done||0),total:Number(h.total||0),minutes:Number(h.minutes||0),pct:h.total?Math.round(h.done/h.total*100):0};});
  const pron=read('nada_pron_attempts_v1',[]).filter(x=>Date.now()-Number(x.time||0)<7*86400000);const bestPron=pron.length?Math.max(...pron.map(x=>Number(x.score||0))):0;
  const mistakes=read('nada_ai_mistakes_v1',[]);
  const odoo=read('nada_odoo_academy_v1',{done:{},words:{},practiceCount:0});
  const odooDone=Object.values(odoo.done||{}).filter(Boolean).length;const odooPct=Math.round(Math.min(100,odooDone/35*100));
  const aiReports=read('nada_ai_session_reports_v1',[]);const recentReport=aiReports.find?.(x=>Date.now()-Number(x.time||x.createdAt||0)<7*86400000)||aiReports[0]||{};
  const state=window.state||{};const known=Object.keys(state.known||{}).length;const review=Object.keys(state.review||{}).length;
  const completion=totalTasks?Math.round(tasksDone/totalTasks*100):0;
  const grammar=Number(recentReport.grammar||Math.max(45,100-Math.min(50,mistakes.length*3)));
  const vocabulary=Math.min(100,Math.round(known/(known+review+10)*100)+35);
  const speaking=bestPron||Number(recentReport.fluency||0)||45;
  const professional=Math.max(35,odooPct);
  const overall=Math.round(completion*.35+speaking*.2+grammar*.15+vocabulary*.15+professional*.15);
  return{history,activity,tasksDone,totalTasks,minutes,bestPron,mistakes,odooPct,odooDone,grammar,vocabulary,speaking,professional,overall,known,review};
}
function defaultGoals(){return[
  {id:'days',title:'إكمال خطة يومي',target:5,current:0,screen:'myday',icon:'🧭',auto:'days'},
  {id:'speak',title:'تدريب النطق وShadowing',target:3,current:0,screen:'smartcoach',icon:'🎙️',auto:'speak'},
  {id:'odoo',title:'إكمال دروس Odoo',target:3,current:0,screen:'odooacademy',icon:'💼',auto:'odoo'},
  {id:'review',title:'جلسات مراجعة ذكية',target:3,current:0,screen:'review',icon:'🧠',auto:'review'}
];}
function loadGoals(s){let goals=read(GOAL_KEY,defaultGoals());if(!Array.isArray(goals)||!goals.length)goals=defaultGoals();const activeDays=s.activity.filter(x=>x.done>0).length;goals=goals.map(g=>{if(g.auto==='days')g.current=activeDays;if(g.auto==='speak')g.current=Math.min(g.target,s.bestPron?1:0);if(g.auto==='odoo')g.current=Math.min(g.target,s.odooDone);if(g.auto==='review')g.current=Math.min(g.target,Math.max(0,Math.round((s.tasksDone-activeDays)/2)));return g;});write(GOAL_KEY,goals);return goals;}
function recommendations(s){const r=[];
  if(s.mistakes.length>0)r.push({icon:'🧠',title:`راجعي ${Math.min(5,s.mistakes.length)} أخطاء محفوظة`,text:'اكتبي مثالًا جديدًا لكل تصحيح.',screen:'aiteacher'});
  if(s.speaking<75)r.push({icon:'🎙️',title:'اعملي جلستين Shadowing',text:'ركزي على الوضوح والكلمات التي لم يتعرف عليها المتصفح.',screen:'smartcoach'});
  if(s.odooPct<70)r.push({icon:'💼',title:'كمّلي درس Odoo واحد',text:'اختاري الموديول الأقرب لشغلك الحالي.',screen:'odooacademy'});
  if(s.vocabulary<70)r.push({icon:'🃏',title:'راجعي Flashcards لمدة 10 دقائق',text:'ابدئي بالجمل التي عليها علامة مراجعة.',screen:'flashcards'});
  if(s.totalTasks===0||s.tasksDone/s.totalTasks<.6)r.push({icon:'🧭',title:'ثبتي عادة خطة يومي',text:'اختاري 3 مهام قصيرة بدل خطة طويلة.',screen:'myday'});
  if(!r.length)r.push({icon:'🏆',title:'ارفعي مستوى التحدي',text:'أضيفي Role Play واجتماع Odoo هذا الأسبوع.',screen:'smartcoach'});
  return r.slice(0,4);
}
function render(){const s=snapshot(),goals=loadGoals(s),recs=recommendations(s);
  $('weekOverallScore').textContent=s.overall+'%';$('weekCoachLevel').textContent=s.overall>=85?'Excellent Week':s.overall>=70?'Strong Progress':s.overall>=50?'Good Start':'Getting Started';
  $('weekTasksDone').textContent=s.tasksDone;$('weekMinutes').textContent=s.minutes;$('weekPronScore').textContent=s.bestPron?s.bestPron+'%':'—';$('weekOdooProgress').textContent=s.odooPct+'%';$('weekMistakes').textContent=s.mistakes.length;
  const chart=$('weekActivityChart');if(chart)chart.innerHTML=s.activity.map(x=>`<div class="${x.key===iso(new Date())?'today':''}"><b>${x.pct}%</b><i><span style="height:${Math.max(5,x.pct)}%"></span></i><small>${x.label}</small><em>${x.minutes}د</em></div>`).join('');
  const bars=[['Grammar',s.grammar,'📘'],['Vocabulary',s.vocabulary,'🧠'],['Speaking',s.speaking,'🎙️'],['Odoo English',s.professional,'💼']];const sb=$('weekSkillBars');if(sb)sb.innerHTML=bars.map(([n,v,i])=>`<div><div><span>${i} ${n}</span><b>${Math.round(v)}%</b></div><i><span style="width:${Math.max(3,Math.min(100,v))}%"></span></i></div>`).join('');
  const rb=$('weekRecommendations');if(rb)rb.innerHTML=recs.map((x,i)=>`<article data-screen="${x.screen}" class="${i===0?'priority':''}"><span>${x.icon}</span><div><b>${esc(x.title)}</b><small>${esc(x.text)}</small></div><button>ابدئي</button></article>`).join('');rb?.querySelectorAll('article').forEach(a=>a.onclick=()=>openScreen(a.dataset.screen));const start=$('weekStartRecommendation');if(start)start.onclick=()=>openScreen(recs[0].screen);
  const gb=$('weekGoalList');if(gb)gb.innerHTML=goals.map(g=>{const p=Math.min(100,Math.round(Number(g.current||0)/Number(g.target||1)*100));return`<article class="weekGoal ${p>=100?'done':''}"><span>${g.icon||'🎯'}</span><div><b>${esc(g.title)}</b><small>${g.current} من ${g.target}</small><i><span style="width:${p}%"></span></i></div><button data-id="${g.id}" data-action="plus">＋</button>${g.auto?'':`<button data-id="${g.id}" data-action="delete">×</button>`}</article>`;}).join('');gb?.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();changeGoal(b.dataset.id,b.dataset.action);});gb?.querySelectorAll('article').forEach((a,i)=>a.onclick=()=>openScreen(goals[i].screen||'myday'));
  const summary=`أنجزتِ ${s.tasksDone} مهمة خلال ${s.minutes} دقيقة في آخر 7 أيام. نتيجتك الأسبوعية ${s.overall}%. ${s.bestPron?`أفضل نتيجة نطق ${s.bestPron}%. `:'لم تسجلي نتيجة نطق هذا الأسبوع. '}${s.odooPct?`تقدم Odoo Academy وصل إلى ${s.odooPct}%. `:'ابدئي أول درس في Odoo Academy. '}${s.mistakes.length?`لديكِ ${s.mistakes.length} أخطاء محفوظة للمراجعة.`:'دفتر الأخطاء خالٍ حاليًا.'}`;$('weekSummaryText').textContent=summary;
  $('weekExportReport').onclick=()=>exportReport(summary,s,recs,goals);
}
function changeGoal(id,action){let goals=read(GOAL_KEY,defaultGoals()),g=goals.find(x=>x.id===id);if(!g)return;if(action==='plus')g.current=Math.min(Number(g.target||1),Number(g.current||0)+1);if(action==='delete')goals=goals.filter(x=>x.id!==id);write(GOAL_KEY,goals);render();}
function addGoal(){const input=$('weekGoalTitle'),title=input?.value.trim();if(!title){input?.focus();return;}const goals=read(GOAL_KEY,defaultGoals());goals.push({id:'custom-'+Date.now(),title,target:Number($('weekGoalTarget')?.value||5),current:0,screen:'myday',icon:'🎯'});write(GOAL_KEY,goals);input.value='';render();}
function exportReport(summary,s,recs,goals){const text=[`Nada English Academy - Weekly Report`,`Date: ${new Date().toLocaleDateString('en-GB')}`,'',summary,'','Skills:',`Grammar: ${Math.round(s.grammar)}%`,`Vocabulary: ${Math.round(s.vocabulary)}%`,`Speaking: ${Math.round(s.speaking)}%`,`Odoo English: ${Math.round(s.professional)}%`,'','Recommendations:',...recs.map((x,i)=>`${i+1}. ${x.title} - ${x.text}`),'','Next Week Goals:',...goals.map(g=>`- ${g.title}: ${g.current}/${g.target}`)].join('\n');const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Nada-Weekly-Report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
function init(){$('weekAddGoal')?.addEventListener('click',addGoal);$('weekGoalTitle')?.addEventListener('keydown',e=>{if(e.key==='Enter')addGoal();});$('weekResetGoals')?.addEventListener('click',()=>{write(GOAL_KEY,defaultGoals());render();});document.querySelectorAll('[data-screen="myweek"]').forEach(b=>b.addEventListener('click',()=>setTimeout(render,40)));window.addEventListener('nada:data-changed',()=>setTimeout(render,50));window.addEventListener('storage',render);render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
