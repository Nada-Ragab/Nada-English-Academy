(function(){
'use strict';
const $=id=>document.getElementById(id);
const PATH_KEY='nada_smart_path_v1', PRON_KEY='nada_pron_attempts_v1', ROLE_KEY='nada_roleplays_v1';
let path=[], pronAttempts=[], roleplays=0, shadowIndex=0, selectedOdoo='Payroll', currentTemplate='';
const shadowPhrases={
 daily:['Could you please repeat that more slowly?','I am learning English to communicate more confidently.','What do you usually do after work?','I would like a cup of coffee, please.'],
 business:['Let me confirm the requirements before we proceed.','I will share the updated report by the end of the day.','Could we schedule a follow-up meeting for tomorrow?','The implementation is currently in the testing phase.'],
 odoo:['The payroll rule is calculated based on the employee contract.','We need your confirmation before moving the changes to production.','The inventory valuation entry is created automatically.','Could you explain your current approval workflow?']
};
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('nada:data-changed'))}
function go(screen){document.querySelector(`[data-screen="${screen}"]`)?.click()}
function normalize(t){return String(t||'').toLowerCase().replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim()}
function similarity(a,b){const aa=normalize(a).split(' ').filter(Boolean),bb=normalize(b).split(' ').filter(Boolean);if(!aa.length||!bb.length)return 0;const matches=aa.filter(w=>bb.includes(w)).length;const order=aa.filter((w,i)=>bb[i]===w).length;return Math.round(Math.min(100,(matches/Math.max(aa.length,bb.length))*75+(order/aa.length)*25))}
function level(){return read('nada_ai_settings_v2',{level:'A2'}).level||'A2'}
function buildPath(){
 const goal=$('pathGoal').value, minutes=Number($('pathMinutes').value); const labels={general:'المحادثة اليومية',work:'العمل والاجتماعات',odoo:'Odoo وERP',interview:'مقابلات العمل'};
 const tasks=[
  {day:'اليوم 1',title:`مفردات ${labels[goal]}`,type:'words',mins:Math.max(5,Math.round(minutes*.25))},
  {day:'اليوم 2',title:'Shadowing ونطق',type:'shadow',mins:Math.max(5,Math.round(minutes*.25))},
  {day:'اليوم 3',title:`Role Play: ${labels[goal]}`,type:'roleplay',mins:Math.max(7,Math.round(minutes*.35))},
  {day:'اليوم 4',title:'Grammar من أخطائك',type:'mistakes',mins:Math.max(5,Math.round(minutes*.25))},
  {day:'اليوم 5',title:goal==='odoo'?'Odoo Client Meeting':'AI Conversation',type:goal==='odoo'?'odoo':'ai',mins:Math.max(8,Math.round(minutes*.4))}
 ].map((x,i)=>({...x,id:Date.now()+i,done:false,goal,level:level()}));
 path=tasks;write(PATH_KEY,path);renderPath();updateDashboard();
}
function renderPath(){
 const box=$('learningPathList');if(!box)return;
 if(!path.length){box.innerHTML='<div class="smartEmpty">لم يتم إنشاء خطة بعد.</div>';return}
 box.innerHTML=path.map((t,i)=>`<div class="pathTask ${t.done?'done':''}"><button class="pathCheck" data-i="${i}">${t.done?'✓':''}</button><div><small>${t.day} • ${t.mins} دقائق • ${t.level}</small><b>${t.title}</b></div><button class="pathStart" data-start="${i}">ابدئي</button></div>`).join('');
 box.querySelectorAll('.pathCheck').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;path[i].done=!path[i].done;write(PATH_KEY,path);renderPath();updateDashboard()});
 box.querySelectorAll('.pathStart').forEach(b=>b.onclick=()=>startTask(path[+b.dataset.start]));
 const next=path.find(x=>!x.done)||path[0];$('dailyRecommendation').innerHTML=`<b>${next.title}</b><p>${next.mins} دقائق مناسبة لمستواك ${next.level}.</p>`;
}
function startTask(t){if(!t)return; if(t.type==='shadow'){activateTab('shadow')}else if(t.type==='roleplay'){activateTab('roleplay')}else if(t.type==='odoo'){activateTab('odoo')}else if(t.type==='mistakes'){go('aiteacher');setTimeout(()=>$('practiceAiMistakes')?.click(),250)}else if(t.type==='words'){go('words')}else{go('aiteacher')}}
function activateTab(name){document.querySelectorAll('[data-smart-tab]').forEach(b=>b.classList.toggle('active',b.dataset.smartTab===name));document.querySelectorAll('[data-smart-pane]').forEach(p=>p.classList.toggle('active',p.dataset.smartPane===name))}
function updateShadow(){const cat=$('shadowCategory')?.value||'daily';const arr=shadowPhrases[cat];shadowIndex%=arr.length;$('shadowTarget').textContent=arr[shadowIndex];$('shadowLive').textContent='اضغطي سجّلي ثم كرري الجملة.';$('pronFeedback').textContent='لم تسجلي محاولة بعد.';$('pronScore').textContent='—'}
function speak(text){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.82;speechSynthesis.speak(u)}
function recordShadow(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$('shadowLive').textContent='استخدمي Chrome أو Edge لتسجيل النطق.';return}const r=new SR();r.lang='en-US';r.interimResults=true;let final='';r.onstart=()=>{$('shadowRecord').textContent='⏹️ أسمعك...';$('shadowLive').textContent='تكلمي الآن...'};r.onresult=e=>{let all='';for(let i=e.resultIndex;i<e.results.length;i++){all+=e.results[i][0].transcript;if(e.results[i].isFinal)final+=e.results[i][0].transcript}$('shadowLive').textContent=all};r.onend=()=>{$('shadowRecord').textContent='🎙️ سجّلي';const heard=final||$('shadowLive').textContent;const target=$('shadowTarget').textContent;const score=similarity(target,heard);$('pronScore').textContent=score+'%';$('pronFeedback').innerHTML=score>=90?'ممتاز جدًا! تطابق الكلمات قوي.':score>=75?'جيد جدًا. كرري الجملة مرة لتحسين ترتيب الكلمات.':score>=55?'محاولة جيدة. اسمعي الجملة وركزي على الكلمات الناقصة.':'ابدئي ببطء وكرري الجملة جزءًا جزءًا.';pronAttempts.unshift({target,heard,score,time:Date.now()});pronAttempts=pronAttempts.slice(0,30);write(PRON_KEY,pronAttempts);updateDashboard()};r.onerror=e=>{$('shadowLive').textContent='تعذر التسجيل: '+e.error};r.start()}
function launchAI(mode,prompt,title){const modeEl=$('aiMode');if(modeEl){modeEl.value=mode;modeEl.dispatchEvent(new Event('change'))}go('aiteacher');setTimeout(()=>{const input=$('aiInput');if(input){input.value=prompt;$('aiSendBtn')?.click()}},350);roleplays++;localStorage.setItem(ROLE_KEY,String(roleplays));$('roleplayStatus')&&($('roleplayStatus').textContent=`بدأت جلسة: ${title}`);updateDashboard()}
function odooPrompt(){const type=$('odooTrainingType').value;const prompts={explain:`Ask me to explain the ${selectedOdoo} module to a client in simple professional English. Correct me after each answer.`,meeting:`Role-play a client requirements meeting about ${selectedOdoo}. Ask one functional question at a time.`,support:`Role-play an urgent support issue related to ${selectedOdoo}. I am the functional consultant.`,interview:`Ask me an interview question about my functional experience with ${selectedOdoo}.`};launchAI('odoo',prompts[type],`${selectedOdoo} training`)}
function dashboardData(){const mistakes=read('nada_ai_mistakes_v1',[]);const report=read('nada_ai_last_report_v1',{});const done=path.filter(x=>x.done).length;const planPct=path.length?Math.round(done/path.length*100):0;const best=pronAttempts.length?Math.max(...pronAttempts.map(x=>x.score)):0;const grammar=Number(report.grammarScore||Math.max(50,85-mistakes.length*2));const vocab=Number(report.vocabularyScore||65);const fluency=Number(report.fluencyScore||best||60);const overall=Math.round((grammar+vocab+fluency+planPct)/4);return{mistakes,report,done,planPct,best,grammar,vocab,fluency,overall}}
function updateDashboard(){const d=dashboardData();
 const set=(id,v)=>{if($(id))$(id).textContent=v};set('scOverallScore',d.overall+'%');set('scLevelLabel',level());set('wdPlan',d.planPct+'%');set('wdPron',d.best?d.best+'%':'—');set('wdRole',roleplays);set('wdMistakes',d.mistakes.length);set('wdOverall',d.overall+'%');set('dashPlanDone',`${d.done}/${path.length||5}`);set('dashPronScore',d.best?d.best+'%':'—');set('dashRoleplays',roleplays);set('dashWeeklyScore',d.overall+'%');
 const bars=$('skillBars');if(bars)bars.innerHTML=[['Grammar',d.grammar],['Vocabulary',d.vocab],['Fluency',d.fluency],['Pronunciation',d.best||0],['Weekly Plan',d.planPct]].map(([n,v])=>`<div class="skillBar"><div><span>${n}</span><b>${v}%</b></div><i><span style="width:${Math.min(100,v)}%"></span></i></div>`).join('');
 const rec=[];if(d.planPct<60)rec.push('أكملي مهمة واحدة على الأقل من خطة الأسبوع اليوم.');if(!d.best||d.best<75)rec.push('اعملي محاولتين Shadowing ببطء ثم بسرعة طبيعية.');if(d.mistakes.length>3)rec.push('راجعي 3 أخطاء من دفتر الأخطاء قبل المحادثة التالية.');if(roleplays<2)rec.push('ابدئي Role Play للعمل أو مقابلة وظيفية.');if(!rec.length)rec.push('أداء ممتاز. انتقلي إلى Role Play أصعب أو مستوى أعلى.');const box=$('weeklyRecommendations');if(box)box.innerHTML=rec.map(x=>`<div>✓ ${x}</div>`).join('');
}
function bind(){
 path=read(PATH_KEY,[]);pronAttempts=read(PRON_KEY,[]);roleplays=Number(localStorage.getItem(ROLE_KEY)||0);renderPath();updateDashboard();
 document.querySelectorAll('[data-smart-tab]').forEach(b=>b.onclick=()=>activateTab(b.dataset.smartTab));
 $('buildLearningPath')&&($('buildLearningPath').onclick=buildPath);$('startRecommendedTask')&&($('startRecommendedTask').onclick=()=>startTask(path.find(x=>!x.done)||path[0]));
 $('shadowCategory')&&($('shadowCategory').onchange=()=>{shadowIndex=0;updateShadow()});$('shadowListen')&&($('shadowListen').onclick=()=>speak($('shadowTarget').textContent));$('shadowRecord')&&($('shadowRecord').onclick=recordShadow);$('shadowNext')&&($('shadowNext').onclick=()=>{shadowIndex++;updateShadow()});
 document.querySelectorAll('#roleplayGrid button').forEach(b=>b.onclick=()=>launchAI(b.dataset.mode,b.dataset.prompt,b.dataset.title));
 document.querySelectorAll('#odooModuleGrid button').forEach(b=>b.onclick=()=>{selectedOdoo=b.dataset.module;document.querySelectorAll('#odooModuleGrid button').forEach(x=>x.classList.toggle('active',x===b))});
 $('startOdooTraining')&&($('startOdooTraining').onclick=odooPrompt);document.querySelectorAll('.consultantTemplates button').forEach(b=>b.onclick=()=>{currentTemplate=b.dataset.template;$('templatePreview').textContent=currentTemplate});$('speakTemplate')&&($('speakTemplate').onclick=()=>currentTemplate?speak(currentTemplate):null);$('refreshWeeklyDashboard')&&($('refreshWeeklyDashboard').onclick=updateDashboard);updateShadow();
}
window.addEventListener('load',bind);
})();
