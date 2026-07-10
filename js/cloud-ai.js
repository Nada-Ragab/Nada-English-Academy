(function(){
'use strict';
const el=id=>document.getElementById(id);
const AI_SETTINGS_KEY='nada_ai_settings_v2';
const AI_HISTORY_KEY='nada_ai_history_v2';
const FIREBASE_CONFIG_KEY='nada_firebase_config_v1';
const BUILTIN_FIREBASE_CONFIG={
  apiKey:'AIzaSyBbljF4Vw1Zy5cA2VVG3zrK_UPZ0xxftYg',
  authDomain:'nada-english-academy.firebaseapp.com',
  projectId:'nada-english-academy',
  storageBucket:'nada-english-academy.firebasestorage.app',
  messagingSenderId:'924578443227',
  appId:'1:924578443227:web:68fa7c009392d10fe401fe',
  measurementId:'G-MQ7YMLPBXD'
};
const AUTO_SYNC_KEY='nada_auto_sync_v1';
const FIREBASE_SDK_VERSION='12.16.0';
const GEMINI_MODEL='gemini-3.5-flash';
const AI_REPLY_FIELDS=['englishReply','arabicTranslation','correction','explanationArabic','nextQuestion'];
let aiHistory=[];
let voiceRecognition=null;
let voiceMode=false;
let firebaseApp=null, auth=null, db=null, currentUser=null, firebaseModules=null;
let aiModel=null;
let syncTimer=null;
let aiBusy=false;
function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}}
function setNote(id,text){const n=el(id);if(n)n.textContent=text}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function getAiSettings(){return readJson(AI_SETTINGS_KEY,{mode:'general',level:'A2'})}
function saveAiSettings(){
  localStorage.setItem(AI_SETTINGS_KEY,JSON.stringify({mode:el('aiMode').value,level:el('aiLevel').value}));
  aiModel=null;
  setNote('aiStatus','تم حفظ وضع التدريب. المدرّس جاهز.');
}
function renderAi(){const box=el('aiMessages');if(!box)return;box.innerHTML=aiHistory.map(m=>`<div class="aiMsg ${m.role}">${escapeHtml(m.text)}</div>`).join('');box.scrollTop=box.scrollHeight}
function addAi(role,text){aiHistory.push({role,text,time:Date.now()});aiHistory=aiHistory.slice(-60);localStorage.setItem(AI_HISTORY_KEY,JSON.stringify(aiHistory));renderAi()}
function teacherPrompt(s){
  const labels={
    general:'daily English conversation',
    work:'work meetings and professional communication',
    business:'business English and workplace communication',
    odoo:'Odoo and ERP functional consulting',
    hr:'HR, payroll, leave, loans, and end-of-service discussions',
    accounting:'accounting and finance conversations',
    interview:'job interviews',
    travel:'travel, airport, hotel, and restaurant situations'
  };
  return [
    `You are Nada's friendly private English teacher. Her CEFR level is ${s.level}.`,
    `Practice ${labels[s.mode]||labels.general}.`,
    'Use short, natural English suitable for her level.',
    'Correct only real mistakes. If her sentence is correct, say that it is correct.',
    'Explain the correction in very simple Arabic.',
    'Continue with exactly one natural question in English.',
    'Return ONLY valid JSON. Do not use markdown, code fences, asterisks, or instruction labels.',
    'Use exactly these JSON keys:',
    '{"englishReply":"natural English reply","arabicTranslation":"Arabic translation of the reply","correction":"correct sentence or الجملة صحيحة","explanationArabic":"very short Arabic explanation","nextQuestion":"one simple English question"}',
    'Never output phrases such as A1 friendly response, explanation, placeholder, or template.'
  ].join(' ');
}
function conversationPrompt(text){
  const s=getAiSettings();
  const recent=aiHistory.slice(-20).map(m=>`${m.role==='teacher'?'Teacher':m.role==='user'?'Student':'System'}: ${m.text}`).join('\n');
  return `${teacherPrompt(s)}\n\nConversation so far:\n${recent||'(new conversation)'}\nStudent: ${text}`;
}
function cleanJsonText(raw){
  let text=String(raw||'').trim();
  text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  text=text.replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
  const start=text.indexOf('{');
  const end=text.lastIndexOf('}');
  if(start!==-1&&end>start)text=text.slice(start,end+1);
  return text.trim();
}
function extractJsonFields(raw){
  const text=String(raw||'').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const out={};
  for(const key of AI_REPLY_FIELDS){
    const rx=new RegExp(`['\"]?${key}['\"]?\\s*:\s*['\"]([\\s\\S]*?)['\"](?=\\s*,\\s*['\"]?[A-Za-z]|\\s*}\\s*$)`,'i');
    const m=text.match(rx);
    if(m)out[key]=m[1].replace(/\\n/g,'\n').replace(/\\"/g,'"').trim();
  }
  return out;
}
function parseTeacherReply(raw){
  let obj=null;
  const cleaned=cleanJsonText(raw);
  try{obj=JSON.parse(cleaned)}catch{}
  if(!obj||typeof obj!=='object')obj=extractJsonFields(raw);
  if(!obj||typeof obj!=='object'||!AI_REPLY_FIELDS.some(k=>obj[k])){
    const plain=String(raw||'').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').replace(/\*+/g,'').trim();
    return {display:plain,spoken:plain.replace(/[*#`]/g,'').trim()};
  }
  const v=k=>String(obj[k]||'').trim();
  const english=v('englishReply');
  const arabic=v('arabicTranslation');
  const correction=v('correction');
  const explanation=v('explanationArabic');
  const next=v('nextQuestion');
  const parts=[];
  if(english)parts.push(`🗣 English\n${english}`);
  if(arabic)parts.push(`🇪🇬 العربية\n${arabic}`);
  if(correction)parts.push(`✍️ التصحيح\n${correction}`);
  if(explanation)parts.push(`💡 الشرح\n${explanation}`);
  if(next)parts.push(`❓ السؤال التالي\n${next}`);
  return {display:parts.join('\n\n')||String(raw||'').trim(),spoken:[english,next].filter(Boolean).join(' ')};
}
async function loadFirebaseModules(){
  if(firebaseModules)return firebaseModules;
  const base=`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
  const app=await import(`${base}/firebase-app.js`);
  const au=await import(`${base}/firebase-auth.js`);
  const fs=await import(`${base}/firebase-firestore.js`);
  const ai=await import(`${base}/firebase-ai.js`);
  firebaseModules={...app,...au,...fs,...ai};
  return firebaseModules;
}
async function ensureAiModel(){
  if(aiModel)return aiModel;
  if(!await ensureFirebase())throw new Error('تعذر تهيئة Firebase');
  const m=firebaseModules;
  const ai=m.getAI(firebaseApp,{backend:new m.GoogleAIBackend()});
  aiModel=m.getGenerativeModel(ai,{
    model:GEMINI_MODEL,
    generationConfig:{temperature:0.55,maxOutputTokens:450,topP:0.9,responseMimeType:'application/json'}
  });
  return aiModel;
}
async function askAi(text){
  if(aiBusy||!text)return;
  const prompt=conversationPrompt(text);
  addAi('user',text);
  setNote('aiStatus','يفكر المدرّس...');
  aiBusy=true;
  if(el('aiSendBtn'))el('aiSendBtn').disabled=true;
  try{
    const model=await ensureAiModel();
    const result=await model.generateContent(prompt);
    const raw=result&&result.response&&typeof result.response.text==='function'?result.response.text().trim():'';
    if(!raw)throw new Error('لم يصل رد من Gemini');
    const reply=parseTeacherReply(raw);
    addAi('teacher',reply.display);
    setNote('aiStatus','تم التصحيح والرد عبر Firebase AI Logic.');
    if(voiceMode)await speakAi(reply.spoken||reply.display);
  }catch(e){
    const msg=String(e&&e.message||e);
    addAi('system','تعذر الاتصال بالمدرّس الذكي: '+msg);
    setNote('aiStatus',msg.includes('app-check')||msg.includes('App Check')?'راجعي إعداد App Check في Firebase.':'تعذر الاتصال بـ Gemini. تأكدي من الإنترنت ثم حاولي مرة أخرى.');
  }finally{
    aiBusy=false;
    if(el('aiSendBtn'))el('aiSendBtn').disabled=false;
    if(voiceMode)setTimeout(startAiVoice,700);
  }
}
function speakAi(text){
  return new Promise(resolve=>{
    if(!('speechSynthesis' in window)){resolve();return}
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.replace(/[*#`]/g,''));
    u.lang='en-US';u.rate=.86;u.onend=resolve;u.onerror=resolve;
    window.speechSynthesis.speak(u);
  });
}
function stopAiVoice(){
  voiceMode=false;
  if(voiceRecognition){try{voiceRecognition.abort()}catch{}voiceRecognition=null}
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  if(el('aiVoiceBtn'))el('aiVoiceBtn').textContent='🎙️ محادثة صوتية';
  setNote('aiStatus','تم إيقاف المحادثة الصوتية.');
}
function startAiVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setNote('aiStatus','المحادثة الصوتية تحتاج Chrome أو Edge.');return}
  if(voiceRecognition||aiBusy)return;
  if(!voiceMode)voiceMode=true;
  const r=new SR();voiceRecognition=r;r.lang='en-US';r.continuous=false;r.interimResults=true;
  r.onstart=()=>{if(el('aiVoiceBtn'))el('aiVoiceBtn').textContent='⏹ إيقاف';setNote('aiStatus','🎙️ اتكلمي الآن بالإنجليزية...')};
  r.onresult=e=>{let finalText='',all='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;all+=t;if(e.results[i].isFinal)finalText+=t}if(el('aiInput'))el('aiInput').value=all;if(finalText.trim()){try{r.stop()}catch{}if(el('aiInput'))el('aiInput').value='';askAi(finalText.trim())}};
  r.onerror=e=>{if(e.error!=='aborted')setNote('aiStatus','خطأ في الميكروفون: '+e.error)};
  r.onend=()=>{voiceRecognition=null;if(!voiceMode&&el('aiVoiceBtn'))el('aiVoiceBtn').textContent='🎙️ محادثة صوتية'};
  try{r.start()}catch(e){voiceRecognition=null;setNote('aiStatus','تعذر تشغيل الميكروفون: '+e.message)}
}
async function initFirebase(){
  if(firebaseApp&&auth&&db)return true;
  try{
    const m=await loadFirebaseModules();
    firebaseApp=m.getApps().length?m.getApp():m.initializeApp(BUILTIN_FIREBASE_CONFIG);
    auth=m.getAuth(firebaseApp);db=m.getFirestore(firebaseApp);
    await m.setPersistence(auth,m.browserLocalPersistence);
    m.onAuthStateChanged(auth,u=>{
      currentUser=u;updateAuthUI();
      const sessionKey='nada_cloud_loaded_uid_v1';
      if(u){if(sessionStorage.getItem(sessionKey)!==u.uid){sessionStorage.setItem(sessionKey,u.uid);downloadCloud(false)}}else sessionStorage.removeItem(sessionKey);
    });
    setNote('syncStatus','تم ربط Firebase بنجاح.');
    setNote('aiStatus','Gemini جاهز عبر Firebase AI Logic.');
    return true;
  }catch(e){setNote('syncStatus','تعذر ربط Firebase: '+e.message);setNote('aiStatus','تعذر تهيئة Firebase AI Logic.');return false}
}
function updateAuthUI(){const box=el('authState');if(!box)return;box.textContent=currentUser?'مسجلة الدخول: '+currentUser.email:'غير مسجلة الدخول';if(el('signOutBtn'))el('signOutBtn').disabled=!currentUser}
function localPayload(){if(typeof saveAllData==='function')saveAllData();return readJson('nada_english_academy_v18_data',{savedAt:new Date().toISOString()})}
async function ensureFirebase(){return auth&&db?true:initFirebase()}
async function uploadCloud(silent){if(!await ensureFirebase()||!currentUser){if(!silent)setNote('syncStatus','سجلي الدخول أولًا.');return}try{const m=firebaseModules;await m.setDoc(m.doc(db,'users',currentUser.uid),{academyData:localPayload(),updatedAt:m.serverTimestamp(),email:currentUser.email},{merge:true});setNote('syncStatus','آخر رفع: '+new Date().toLocaleString('ar-EG'))}catch(e){setNote('syncStatus','فشل الرفع: '+e.message)}}
async function downloadCloud(show){if(!await ensureFirebase()||!currentUser){if(show)setNote('syncStatus','سجلي الدخول أولًا.');return}try{const m=firebaseModules;const snap=await m.getDoc(m.doc(db,'users',currentUser.uid));if(!snap.exists()||!snap.data().academyData){setNote('syncStatus','لا توجد بيانات محفوظة لهذا الحساب.');return}const data=snap.data().academyData;localStorage.setItem('nada_english_academy_v18_data',JSON.stringify(data));if(data.state)localStorage.setItem('nada_v12_state',JSON.stringify(data.state));if(data.customTopics)localStorage.setItem('nada_custom_topics_v1',JSON.stringify(data.customTopics));if(show)setNote('syncStatus','تم تحميل البيانات. أعيدي فتح الصفحة لتطبيقها.')}catch(e){setNote('syncStatus','فشل التحميل: '+e.message)}}
function scheduleAutoSync(){if(localStorage.getItem(AUTO_SYNC_KEY)==='0'||!currentUser)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>uploadCloud(true),1200)}
function bind(){
  if(!el('aiMessages'))return;
  const s=getAiSettings();el('aiMode').value=s.mode||'general';el('aiLevel').value=s.level||'A2';
  aiHistory=readJson(AI_HISTORY_KEY,[]);if(!aiHistory.length)addAi('teacher','Hello Nada! I am your AI English teacher. What would you like to practice today?');else renderAi();
  el('saveAiSettings').onclick=saveAiSettings;
  el('aiMode').onchange=saveAiSettings;el('aiLevel').onchange=saveAiSettings;
  el('aiSendBtn').onclick=()=>{const t=el('aiInput').value.trim();if(t){el('aiInput').value='';askAi(t)}};
  el('aiInput').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();el('aiSendBtn').click()}};
  el('aiVoiceBtn').onclick=()=>{if(voiceMode)stopAiVoice();else startAiVoice()};
  el('clearAiChat').onclick=()=>{stopAiVoice();aiHistory=[];localStorage.removeItem(AI_HISTORY_KEY);addAi('teacher','Hello Nada! Let us start a new conversation.')};
  localStorage.setItem(FIREBASE_CONFIG_KEY,JSON.stringify(BUILTIN_FIREBASE_CONFIG));
  if(localStorage.getItem(AUTO_SYNC_KEY)===null)localStorage.setItem(AUTO_SYNC_KEY,'1');
  if(el('autoSyncToggle')){el('autoSyncToggle').checked=localStorage.getItem(AUTO_SYNC_KEY)!=='0';el('autoSyncToggle').onchange=e=>localStorage.setItem(AUTO_SYNC_KEY,e.target.checked?'1':'0')}
  el('signUpBtn').onclick=async()=>{if(!await ensureFirebase())return;try{await firebaseModules.createUserWithEmailAndPassword(auth,el('authEmail').value.trim(),el('authPassword').value);await uploadCloud(true);setNote('syncStatus','تم إنشاء الحساب وتفعيل المزامنة تلقائيًا.')}catch(e){setNote('syncStatus','تعذر إنشاء الحساب: '+e.message)}};
  el('signInBtn').onclick=async()=>{if(!await ensureFirebase())return;try{await firebaseModules.signInWithEmailAndPassword(auth,el('authEmail').value.trim(),el('authPassword').value);setNote('syncStatus','تم تسجيل الدخول والمزامنة تعمل تلقائيًا.')}catch(e){setNote('syncStatus','تعذر الدخول: '+e.message)}};
  el('signOutBtn').onclick=async()=>{if(auth)await firebaseModules.signOut(auth)};
  el('syncUploadBtn').onclick=()=>uploadCloud(false);el('syncDownloadBtn').onclick=()=>downloadCloud(true);
  updateAuthUI();initFirebase();window.addEventListener('nada:data-changed',scheduleAutoSync);
}
window.addEventListener('load',bind);window.NadaCloud={scheduleAutoSync,uploadCloud,downloadCloud};
})();
