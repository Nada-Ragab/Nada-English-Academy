(function(){
'use strict';
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
const openScreen=name=>document.querySelector(`[data-screen="${name}"]`)?.click();
const clamp=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const moduleMeta={
  payroll:['Payroll','💰'],accounting:['Accounting','📊'],inventory:['Inventory','📦'],sales:['Sales','🛒'],purchase:['Purchase','🧾'],hr:['HR','👥'],realestate:['Real Estate','🏢']
};
function activityMinutes(){
  const logs=read('nada_week_activity_v1',{});return Number(logs[new Date().toISOString().slice(0,10)]||0);
}
function odooState(){return read('nada_odoo_academy_v1',{done:{},scores:{},lastModule:'payroll'});}
function modulePct(state,key){
  const done=Object.keys(state.done||{}).filter(k=>k.startsWith(key+':') && state.done[k]).length;
  const score=Number((state.scores||{})[key]||0);
  return clamp(Math.max(done/5*100,score));
}
function renderTop(){
  const state=window.state||{};
  const review=Object.keys(state.review||{}).length;
  const aiReport=read('nada_ai_last_report_v1',{});
  const odoo=odooState();
  const next=review>0?{icon:'🔁',title:`راجعي ${review} جملة`,text:'ابدئي بمراجعة الجمل الصعبة قبل درس جديد.',screen:'review'}:
    Object.keys(aiReport).length?{icon:'🤖',title:'كمّلي تدريب AI Teacher',text:'ابدئي محادثة قصيرة وطبّقي ملاحظات آخر جلسة.',screen:'aiteacher'}:
    {icon:'▶️',title:'متابعة آخر درس',text:'كمّلي من آخر نقطة وصلتِ إليها.',screen:'learn'};
  if($('homeNextIcon'))$('homeNextIcon').textContent=next.icon;
  if($('homeNextTitle'))$('homeNextTitle').textContent=next.title;
  if($('homeNextText'))$('homeNextText').textContent=next.text;
  if($('homeStreak'))$('homeStreak').textContent=`${Number(state.streak||1)} يوم`;
  if($('homeXp'))$('homeXp').textContent=`${Number(state.xp||0)} XP`;
  if($('homeMinutes'))$('homeMinutes').textContent=`${activityMinutes()} دقيقة`;
  if($('homeContinueLearning'))$('homeContinueLearning').onclick=()=>openScreen(next.screen);
  if($('homeContinueOdoo'))$('homeContinueOdoo').onclick=()=>openScreen('odooacademy');
  if($('homeContinueAi'))$('homeContinueAi').onclick=()=>openScreen('aiteacher');
}
function renderOdooModules(){
  const box=$('homeOdooModules');if(!box)return;
  const state=odooState();
  const items=Object.entries(moduleMeta).map(([key,[name,icon]])=>({key,name,icon,pct:modulePct(state,key)}));
  box.innerHTML=items.map(x=>`<button data-module="${x.key}"><span>${x.icon}</span><div><b>${esc(x.name)}</b><i><em style="width:${x.pct}%"></em></i></div><strong>${x.pct}%</strong></button>`).join('');
  box.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{localStorage.setItem('nada_odoo_last_module_v1',btn.dataset.module);openScreen('odooacademy');});
}
function renderLastAiAction(){
  const card=document.querySelector('.dashLastSession');if(!card||card.querySelector('.homeAiContinue'))return;
  const btn=document.createElement('button');btn.className='btn purple wide homeAiContinue';btn.textContent='متابعة المحادثة';btn.onclick=()=>openScreen('aiteacher');card.appendChild(btn);
}
function render(){renderTop();renderOdooModules();renderLastAiAction();}
window.addEventListener('load',()=>setTimeout(render,650));
window.addEventListener('storage',render);
window.addEventListener('nada:data-changed',()=>setTimeout(render,80));
document.querySelectorAll('[data-screen="dashboard"]').forEach(b=>b.addEventListener('click',()=>setTimeout(render,80)));
})();
