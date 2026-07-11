(function(){
'use strict';
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
const clamp=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
const openScreen=name=>document.querySelector(`[data-screen="${name}"]`)?.click();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function appData(){
  const s=window.state||{};
  const known=Object.keys(s.known||{}).length;
  const review=Object.keys(s.review||{}).length;
  const fav=Object.keys(s.fav||{}).length;
  const total=(window.S||[]).length||1;
  return {known,review,fav,xp:Number(s.xp||0),streak:Number(s.streak||1),progress:clamp(known/total*100)};
}
function smartData(){
  const path=read('nada_smart_path_v1',[]);
  const pron=read('nada_pron_attempts_v1',[]);
  const mistakes=read('nada_ai_mistakes_v1',[]);
  const report=read('nada_ai_last_report_v1',{});
  const done=path.filter(x=>x.done).length;
  const planPct=path.length?clamp(done/path.length*100):0;
  const best=pron.length?Math.max(...pron.map(x=>Number(x.score)||0)):0;
  return {path,pron,mistakes,report,done,planPct,best,roleplays:Number(localStorage.getItem('nada_roleplays_v1')||0)};
}
function odooData(){
  const s=read('nada_odoo_academy_v1',{done:{},words:{},practices:0,days:[],scores:{}});
  const modules=['payroll','accounting','inventory','sales','purchase','hr','realestate'];
  const totalLessons=35;
  const done=Object.values(s.done||{}).filter(Boolean).length;
  const words=Object.values(s.words||{}).filter(Boolean).length;
  const scores=Object.values(s.scores||{}).map(Number).filter(Number.isFinite);
  const moduleScores=modules.map(m=>({key:m,score:Number((s.scores||{})[m]||0)}));
  return {state:s,done,words,practices:Number(s.practices||0),best:scores.length?Math.max(...scores):0,pct:clamp(done/totalLessons*100),moduleScores};
}
function skillData(a,sm,o){
  const r=sm.report||{};
  return {
    grammar:clamp(r.grammarScore||Math.max(45,82-sm.mistakes.length*2)),
    vocabulary:clamp(r.vocabularyScore||Math.min(95,50+a.known/8+o.words)),
    fluency:clamp(r.fluencyScore||sm.best||55),
    listening:clamp(Math.round((sm.best+sm.planPct+60)/3)),
    speaking:clamp(Math.round(((sm.best||50)+(r.fluencyScore||55))/2))
  };
}
function recommendation(a,sm,o){
  if(sm.path.length && sm.planPct<100){const next=sm.path.find(x=>!x.done);return {icon:'🧭',title:next?.title||'كمّلي خطة الأسبوع',text:`خصصي ${next?.mins||10} دقائق للخطوة التالية.`,screen:'smartcoach'};}
  if(o.pct<50)return {icon:'💼',title:'كمّلي Odoo Academy',text:'أنهي درسًا واحدًا وتدربي على شرحه للعميل بالإنجليزية.',screen:'odooacademy'};
  if(!sm.best||sm.best<75)return {icon:'🎙️',title:'تدريب Shadowing',text:'محاولتان ببطء ثم بسرعة طبيعية لتحسين النطق.',screen:'smartcoach'};
  if(sm.mistakes.length)return {icon:'🧠',title:'راجعي أخطاءك',text:`لديك ${sm.mistakes.length} أخطاء محفوظة تحتاج مراجعة.`,screen:'aiteacher'};
  return {icon:'🤖',title:'محادثة قصيرة مع AI Teacher',text:'أجيبي عن خمسة أسئلة واطلبي تصحيح كل إجابة.',screen:'aiteacher'};
}
function renderActivity(){
  const wrap=$('dashWeekActivity');if(!wrap)return;
  const logs=read('nada_week_activity_v1',{}),today=new Date(),values=[];
  const labels=['س','ح','ن','ث','ر','خ','ج'];
  for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);values.push(Number(logs[d.toISOString().slice(0,10)]||0));}
  const arr=values.some(Boolean)?values:[18,42,30,65,48,82,55],max=Math.max(...arr,1);
  wrap.innerHTML=arr.map((v,i)=>`<div class="dashDay ${i===6?'today':''}"><b>${Math.round(v)}</b><i><span style="height:${Math.max(8,Math.round(v/max*100))}%"></span></i><small>${labels[(today.getDay()-6+i+7)%7]}</small></div>`).join('');
}
function renderMission(a,sm,o){
  const tasks=[
    {label:'تعلمي 15 دقيقة',done:Number(read('nada_week_activity_v1',{})[new Date().toISOString().slice(0,10)]||0)>=15,screen:'learn'},
    {label:'أكملي مهمة من الخطة',done:sm.done>0,screen:'smartcoach'},
    {label:'تدربي على النطق',done:sm.pron.some(x=>new Date(x.time||0).toDateString()===new Date().toDateString()),screen:'smartcoach'},
    {label:'راجعي درس Odoo',done:o.done>0,screen:'odooacademy'}
  ];
  const done=tasks.filter(x=>x.done).length,pct=clamp(done/tasks.length*100);
  if($('dashMissionPct'))$('dashMissionPct').textContent=pct+'%';
  if($('dashMissionSummary'))$('dashMissionSummary').textContent=`${done} من ${tasks.length} مهام`;
  if($('dashMissionBar'))$('dashMissionBar').style.width=pct+'%';
  const box=$('dashMissionList');if(box)box.innerHTML=tasks.map(t=>`<button class="${t.done?'done':''}" data-target="${t.screen}"><span>${t.done?'✓':'○'}</span><b>${t.label}</b><small>${t.done?'مكتملة':'ابدئي الآن'}</small></button>`).join('');
  box?.querySelectorAll('button').forEach(b=>b.onclick=()=>openScreen(b.dataset.target));
}
function renderRecommendations(a,sm,o){
  const list=[];
  if(sm.mistakes.length)list.push(`راجعي ${Math.min(3,sm.mistakes.length)} أخطاء من دفتر الأخطاء.`);
  if(sm.best<75)list.push('اعملي محاولتين Shadowing لجملة عمل قصيرة.');
  if(o.pct<70)list.push('أكملي درسًا واحدًا في Odoo Academy.');
  if(sm.planPct<60)list.push('أنهي مهمة واحدة من خطة هذا الأسبوع.');
  if(!list.length)list.push('أداؤك ممتاز؛ انتقلي إلى Role Play أصعب.');
  const rec=recommendation(a,sm,o),box=$('dashAiRecList');
  if(box)box.innerHTML=list.slice(0,4).map((x,i)=>`<div><span>${i+1}</span><p>${esc(x)}</p></div>`).join('');
  const btn=$('dashAiRecAction');if(btn){btn.onclick=()=>openScreen(rec.screen);btn.textContent=`${rec.icon} ${rec.title}`;}
}
function renderSkills(skills){
  const box=$('dashSkillTrend');if(!box)return;
  const rows=[['Speaking',skills.speaking],['Grammar',skills.grammar],['Vocabulary',skills.vocabulary],['Listening',skills.listening]];
  box.innerHTML=rows.map(([n,v])=>`<div class="dashSkillRow"><div><span>${n}</span><b>${v}%</b></div><i><span style="width:${v}%"></span></i><small>${v>=80?'ممتاز':v>=65?'جيد':'يحتاج تدريب'}</small></div>`).join('');
}
function renderLastSession(sm){
  const box=$('dashLastSessionBody');if(!box)return;
  const r=sm.report||{},has=Object.keys(r).length>0;
  if(!has){box.innerHTML='<div class="dashEmptyState"><span>🎙️</span><b>لا يوجد تقرير جلسة بعد</b><p>ابدئي محادثة قصيرة ثم اضغطي إنهاء وتقييم الجلسة.</p></div>';return;}
  const vals=[['Grammar',r.grammarScore||0],['Vocabulary',r.vocabularyScore||0],['Fluency',r.fluencyScore||0]];
  box.innerHTML=`<div class="dashSessionScores">${vals.map(([n,v])=>`<div><b>${clamp(v)}%</b><small>${n}</small></div>`).join('')}</div><p><strong>التوصية:</strong> ${esc(r.improvementArabic||'استمري في المحادثة اليومية.')}</p>`;
}
function renderNeedsReview(a,sm,o){
  const items=[];
  sm.mistakes.slice(0,3).forEach(m=>items.push({icon:'✍️',title:m.original||'خطأ في الجملة',text:m.correction||'',screen:'aiteacher'}));
  if(a.review)items.push({icon:'🔁',title:`${a.review} جملة للمراجعة`,text:'راجعيها قبل إضافة محتوى جديد.',screen:'review'});
  if(o.pct<60)items.push({icon:'💼',title:'Odoo Vocabulary',text:'راجعي مصطلحات الموديول الأقل تقدمًا.',screen:'odooacademy'});
  const box=$('dashNeedsReview');if(box)box.innerHTML=(items.length?items.slice(0,4):[{icon:'✅',title:'لا توجد مراجعات عاجلة',text:'استمري في التعلم المنتظم.',screen:'learn'}]).map(x=>`<button data-target="${x.screen}"><span>${x.icon}</span><div><b>${esc(x.title)}</b><small>${esc(x.text)}</small></div></button>`).join('');
  box?.querySelectorAll('button').forEach(b=>b.onclick=()=>openScreen(b.dataset.target));
}
function renderAchievements(a,sm,o){
  const achievements=[
    {icon:'🔥',title:`${a.streak} Day Streak`,unlocked:a.streak>=3},
    {icon:'⭐',title:'500 XP',unlocked:a.xp>=500},
    {icon:'💼',title:'Odoo Starter',unlocked:o.done>=5},
    {icon:'🎤',title:'Speaking Level Up',unlocked:sm.best>=80},
    {icon:'📚',title:'100 Sentences',unlocked:a.known>=100}
  ];
  const box=$('dashAchievements');if(box)box.innerHTML=achievements.map(x=>`<div class="${x.unlocked?'unlocked':'locked'}"><span>${x.icon}</span><b>${x.title}</b><small>${x.unlocked?'تم الإنجاز':'قيد التقدم'}</small></div>`).join('');
}
function render(){
  const a=appData(),sm=smartData(),o=odooData(),skills=skillData(a,sm,o),set=(id,v)=>{if($(id))$(id).textContent=v};
  set('dashTodayDate',new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long'}).format(new Date()));
  set('dashMainStreak',a.streak+' يوم');set('dashStudyScore',clamp((a.progress+sm.planPct+o.pct+skills.speaking)/4)+'%');
  set('dashOdooPct',o.pct+'%');set('dashOdooLessons',`${o.done}/35`);set('dashOdooWords',o.words);set('dashOdooPractice',o.practices);set('dashOdooBest',o.best?o.best+'%':'—');
  if($('dashOdooBar'))$('dashOdooBar').style.width=o.pct+'%';
  const rec=recommendation(a,sm,o);set('dashNextIcon',rec.icon);set('dashNextTitle',rec.title);set('dashNextText',rec.text);
  const next=$('dashNextAction');if(next){next.onclick=()=>openScreen(rec.screen);next.dataset.target=rec.screen;}
  const score=clamp((a.progress+sm.planPct+o.pct)/3);if($('dashMasterRing'))$('dashMasterRing').style.setProperty('--score',score);set('dashMasterPct',score+'%');
  const milestones=[['📚','التعلّم العام',a.progress],['🧠','الخطة الذكية',sm.planPct],['💼','Odoo Academy',o.pct],['🎙️','النطق',sm.best||0]];
  if($('dashMilestones'))$('dashMilestones').innerHTML=milestones.map(([ic,n,v])=>`<div class="dashMilestone"><span>${ic}</span><div><b>${n}</b><i><span style="width:${clamp(v)}%"></span></i></div><strong>${clamp(v)}%</strong></div>`).join('');
  renderActivity();renderMission(a,sm,o);renderRecommendations(a,sm,o);renderSkills(skills);renderLastSession(sm);renderNeedsReview(a,sm,o);renderAchievements(a,sm,o);
}
function logVisit(){const key='nada_week_activity_v1',logs=read(key,{}),today=new Date().toISOString().slice(0,10);if(!logs[today]){logs[today]=5;localStorage.setItem(key,JSON.stringify(logs));}}
window.addEventListener('load',()=>{logVisit();render();setTimeout(render,500)});
window.addEventListener('storage',render);
window.addEventListener('nada:data-changed',()=>setTimeout(render,50));
document.querySelectorAll('[data-screen="dashboard"]').forEach(b=>b.addEventListener('click',()=>setTimeout(render,50)));
})();
