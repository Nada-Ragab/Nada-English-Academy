(function(){
'use strict';
const $=id=>document.getElementById(id);
const KEY='nada_my_day_v255';
const HISTORY='nada_my_day_history_v255';
const today=()=>new Date().toISOString().slice(0,10);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const read=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}};
const write=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('nada:data-changed'));};
const openScreen=id=>document.querySelector(`[data-screen="${id}"]`)?.click();
const uid=()=>`${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
function appSnapshot(){
  const s=window.state||{};
  const review=Object.keys(s.review||{}).length;
  const known=Object.keys(s.known||{}).length;
  const mistakes=read('nada_ai_mistakes_v1',[]).length;
  const odoo=read('nada_odoo_academy_v1',{done:{},words:{}});
  const odooDone=Object.values(odoo.done||{}).filter(Boolean).length;
  const pron=read('nada_pron_attempts_v1',[]);
  const pronToday=pron.some(x=>new Date(x.time||0).toISOString().slice(0,10)===today());
  return {review,known,mistakes,odooDone,pronToday};
}
function smartDefaults(){
  const a=appSnapshot();
  const tasks=[];
  tasks.push({id:'smart-learn',icon:'📚',title:'تعلّم 5 جمل جديدة',detail:'خطوة قصيرة لبناء الاستمرارية.',minutes:10,screen:'learn',xp:20,smart:true});
  if(a.review>0)tasks.push({id:'smart-review',icon:'🔁',title:`راجعي ${Math.min(10,a.review)} جمل`,detail:'ابدئي بالجمل التي تحتاج تثبيتًا.',minutes:10,screen:'review',xp:20,smart:true});
  else tasks.push({id:'smart-daily',icon:'📅',title:'أكملي درس اليوم',detail:'مراجعة خفيفة ومحتوى جديد.',minutes:10,screen:'daily',xp:20,smart:true});
  tasks.push({id:'smart-speak',icon:'🎙️',title:a.pronToday?'محاولة نطق إضافية':'تدريب نطق وShadowing',detail:'ركزي على الوضوح قبل السرعة.',minutes:8,screen:'smartcoach',xp:25,smart:true});
  if(a.odooDone<35)tasks.push({id:'smart-odoo',icon:'💼',title:'درس واحد في Odoo Academy',detail:'اشرحي مفهومًا للعميل بالإنجليزية.',minutes:15,screen:'odooacademy',xp:30,smart:true});
  if(a.mistakes>0)tasks.push({id:'smart-errors',icon:'🧠',title:'راجعي خطأين مع AI Teacher',detail:'صححي الخطأ ثم استخدميه في مثال جديد.',minutes:7,screen:'aiteacher',xp:20,smart:true});
  else tasks.push({id:'smart-ai',icon:'🤖',title:'محادثة من 5 رسائل',detail:'اطلبي تصحيح كل إجابة.',minutes:10,screen:'aiteacher',xp:25,smart:true});
  return tasks;
}
function load(){
  const all=read(KEY,{}),d=today();
  if(!all[d]) all[d]={tasks:smartDefaults(),createdAt:Date.now()};
  return {all,day:all[d]};
}
function save(all){write(KEY,all);}
function recordHistory(day){
  const h=read(HISTORY,{}),tasks=day.tasks||[],done=tasks.filter(x=>x.done).length;
  h[today()]={done,total:tasks.length,minutes:tasks.filter(x=>x.done).reduce((n,x)=>n+Number(x.minutes||0),0)};
  write(HISTORY,h);
}
function motivation(p){return p===100?'ممتاز! أنهيتِ خطة اليوم كاملة 🎉':p>=75?'خطوة أخيرة وتكملي هدف اليوم.':p>=40?'تقدم جيد، حافظي على الإيقاع.':'ابدئي بمهمة صغيرة لمدة 5–10 دقائق.';}
function render(){
  const {all,day}=load(),tasks=day.tasks||[],done=tasks.filter(x=>x.done).length,total=tasks.length,pct=total?Math.round(done/total*100):0;
  if($('myDayDateText'))$('myDayDateText').textContent=new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  if($('myDayStreak'))$('myDayStreak').textContent=`🔥 ${Number((window.state||{}).streak||1)} يوم`;
  if($('myDayPct'))$('myDayPct').textContent=pct+'%';
  if($('myDayRing'))$('myDayRing').style.setProperty('--pct',pct);
  if($('myDaySummary'))$('myDaySummary').textContent=`${done} من ${total} مهام`;
  if($('myDayMotivation'))$('myDayMotivation').textContent=motivation(pct);
  if($('myDayMinutes'))$('myDayMinutes').textContent=tasks.reduce((n,x)=>n+Number(x.minutes||0),0);
  if($('myDayDone'))$('myDayDone').textContent=done;
  if($('myDayEarnedXp'))$('myDayEarnedXp').textContent=tasks.filter(x=>x.done).reduce((n,x)=>n+Number(x.xp||10),0);
  const box=$('myDayTaskList');
  if(box)box.innerHTML=tasks.length?tasks.map((t,i)=>`<article class="myDayTask ${t.done?'done':''}"><button class="myDayCheck" data-action="toggle" data-id="${t.id}" aria-label="تغيير حالة المهمة">${t.done?'✓':'○'}</button><span class="myDayTaskIcon">${t.icon||'📌'}</span><div class="myDayTaskText"><b>${esc(t.title)}</b><small>${esc(t.detail||'مهمة مخصصة')}</small><div><em>${Number(t.minutes||0)} دقائق</em><em>+${Number(t.xp||10)} XP</em></div></div><button class="myDayStart" data-action="start" data-id="${t.id}">${t.done?'مراجعة':'ابدئي'}</button>${t.smart?'':`<button class="myDayDelete" data-action="delete" data-id="${t.id}" aria-label="حذف">×</button>`}</article>`).join(''):'<div class="dashEmptyState"><span>✅</span><b>لا توجد مهام</b><p>أضيفي مهمة جديدة أو جددي الخطة.</p></div>';
  box?.querySelectorAll('button').forEach(b=>b.onclick=()=>act(b.dataset.action,b.dataset.id));
  const next=tasks.find(x=>!x.done)||tasks[0];
  const nb=$('myDayNextBtn');if(nb){nb.disabled=!next;nb.textContent=next?`▶ ${next.title}`:'✓ اكتملت خطة اليوم';nb.onclick=()=>next&&openScreen(next.screen||'learn');}
  renderWeek();recordHistory(day);save(all);
}
function act(action,id){
  const {all,day}=load(),t=(day.tasks||[]).find(x=>x.id===id);if(!t)return;
  if(action==='toggle'){t.done=!t.done;if(t.done)t.completedAt=Date.now();else delete t.completedAt;}
  if(action==='delete')day.tasks=day.tasks.filter(x=>x.id!==id);
  if(action==='start')openScreen(t.screen||'learn');
  all[today()]=day;save(all);render();
}
function addTask(){
  const title=$('myDayTaskTitle')?.value.trim();if(!title){$('myDayTaskTitle')?.focus();return;}
  const {all,day}=load();day.tasks.push({id:uid(),icon:'📌',title,detail:'مهمة مخصصة',minutes:Number($('myDayTaskMinutes')?.value||10),screen:$('myDayTaskScreen')?.value||'learn',xp:15,smart:false});all[today()]=day;save(all);$('myDayTaskTitle').value='';render();
}
function refresh(){
  const all=read(KEY,{}),old=all[today()]?.tasks||[],custom=old.filter(x=>!x.smart),doneMap=Object.fromEntries(old.filter(x=>x.done).map(x=>[x.id,true]));
  const smart=smartDefaults().map(x=>({...x,done:!!doneMap[x.id]}));all[today()]={tasks:[...smart,...custom],createdAt:Date.now()};save(all);render();
}
function renderWeek(){
  const h=read(HISTORY,{}),box=$('myDayWeek');if(!box)return;const d=new Date(),days=[];
  for(let i=6;i>=0;i--){const x=new Date(d);x.setDate(d.getDate()-i);const k=x.toISOString().slice(0,10),v=h[k]||{done:0,total:0,minutes:0},pct=v.total?Math.round(v.done/v.total*100):0;days.push({label:new Intl.DateTimeFormat('ar-EG',{weekday:'short'}).format(x),pct,minutes:v.minutes,today:i===0});}
  box.innerHTML=days.map(x=>`<div class="${x.today?'today':''}"><b>${x.pct}%</b><i><span style="height:${Math.max(6,x.pct)}%"></span></i><small>${x.label}</small><em>${x.minutes}د</em></div>`).join('');
}
function init(){
  $('myDayAddTask')?.addEventListener('click',addTask);$('myDayTaskTitle')?.addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});$('myDayRefresh')?.addEventListener('click',refresh);
  document.querySelectorAll('[data-screen="myday"]').forEach(b=>b.addEventListener('click',()=>setTimeout(render,30)));
  window.addEventListener('storage',render);window.addEventListener('nada:data-changed',()=>setTimeout(render,30));render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
