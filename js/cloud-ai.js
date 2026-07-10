(function(){
'use strict';
const el=id=>document.getElementById(id);
const AI_SETTINGS_KEY='nada_ai_settings_v1';
const AI_HISTORY_KEY='nada_ai_history_v1';
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
let aiHistory=[];
let voiceRecognition=null;
let voiceMode=false;
let firebaseApp=null, auth=null, db=null, currentUser=null, firebaseModules=null;
let syncTimer=null;
function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}}
function setNote(id,text){const n=el(id);if(n)n.textContent=text}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function getAiSettings(){return readJson(AI_SETTINGS_KEY,{endpoint:'',apiKey:'',mode:'general',level:'A2'})}
function saveAiSettings(){
  localStorage.setItem(AI_SETTINGS_KEY,JSON.stringify({endpoint:el('aiEndpoint').value.trim(),apiKey:el('aiApiKey').value.trim(),mode:el('aiMode').value,level:el('aiLevel').value}));
  setNote('aiStatus','تم حفظ إعدادات AI Teacher.');
}
function renderAi(){const box=el('aiMessages');if(!box)return;box.innerHTML=aiHistory.map(m=>`<div class="aiMsg ${m.role}">${escapeHtml(m.text)}</div>`).join('');box.scrollTop=box.scrollHeight}
function addAi(role,text){aiHistory.push({role,text,time:Date.now()});aiHistory=aiHistory.slice(-60);localStorage.setItem(AI_HISTORY_KEY,JSON.stringify(aiHistory));renderAi()}
function teacherPrompt(s){const labels={general:'daily English conversation',work:'work meetings and professional communication',odoo:'Odoo and ERP functional consulting',interview:'job interviews'};return `You are Nada's friendly English teacher. Her level is ${s.level}. Practice ${labels[s.mode]||labels.general}. Reply in simple English. Briefly correct her sentence when needed, explain the correction in Arabic in one short line, then continue with one natural question. Keep the response under 90 words.`}
async function askAi(text){
  const s=getAiSettings();
  if(!s.endpoint){setNote('aiStatus','أضيفي AI Endpoint من إعدادات المدرّس أولًا.');return}
  addAi('user',text);setNote('aiStatus','يفكر المدرّس...');el('aiSendBtn').disabled=true;
  try{
    const messages=[{role:'system',content:teacherPrompt(s)},...aiHistory.slice(-12).filter(x=>x.role!=='system').map(x=>({role:x.role==='teacher'?'assistant':'user',content:x.text}))];
    const headers={'Content-Type':'application/json'};if(s.apiKey)headers.Authorization='Bearer '+s.apiKey;
    const res=await fetch(s.endpoint,{method:'POST',headers,body:JSON.stringify({messages,model:'gpt-4o-mini'})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();
    const reply=data.reply||data.message||data.output_text||(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content);
    if(!reply)throw new Error('صيغة الرد غير معروفة');
    addAi('teacher',reply);setNote('aiStatus','تم الرد.');
    if(voiceMode){speakAi(reply);setTimeout(startAiVoice,900)}
  }catch(e){addAi('system','تعذر الاتصال بخدمة AI: '+e.message);setNote('aiStatus','راجعي رابط الخدمة وإعدادات CORS.')}finally{el('aiSendBtn').disabled=false}
}
function speakAi(text){if(!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.86;window.speechSynthesis.speak(u)}
function startAiVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setNote('aiStatus','المحادثة الصوتية تحتاج Chrome أو Edge.');return}
  if(voiceRecognition){voiceRecognition.stop();return}
  voiceMode=true;const r=new SR();voiceRecognition=r;r.lang='en-US';r.continuous=false;r.interimResults=true;
  r.onstart=()=>{el('aiVoiceBtn').textContent='⏹ إيقاف';setNote('aiStatus','🎙️ اتكلمي الآن بالإنجليزية...')};
  r.onresult=e=>{let finalText='',all='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;all+=t;if(e.results[i].isFinal)finalText+=t}el('aiInput').value=all;if(finalText.trim()){r.stop();el('aiInput').value='';askAi(finalText.trim())}};
  r.onerror=e=>setNote('aiStatus','خطأ في الميكروفون: '+e.error);
  r.onend=()=>{voiceRecognition=null;el('aiVoiceBtn').textContent='🎙️ محادثة صوتية'};
  r.start();
}
async function loadFirebaseModules(){
  if(firebaseModules)return firebaseModules;
  const v='10.12.5';
  const app=await import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`);
  const au=await import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`);
  const fs=await import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`);
  firebaseModules={...app,...au,...fs};return firebaseModules;
}
async function initFirebase(){
  const cfg=BUILTIN_FIREBASE_CONFIG;
  try{
    const m=await loadFirebaseModules();firebaseApp=m.getApps().length?m.getApp():m.initializeApp(cfg);auth=m.getAuth(firebaseApp);db=m.getFirestore(firebaseApp);
    await m.setPersistence(auth,m.browserLocalPersistence);
    m.onAuthStateChanged(auth,u=>{
      currentUser=u;
      updateAuthUI();
      const sessionKey='nada_cloud_loaded_uid_v1';
      if(u){
        // تحميل بيانات الحساب مرة واحدة فقط في جلسة المتصفح.
        // وضع العلامة قبل التحميل يمنع حلقة إعادة تحميل لا نهائية بعد location.reload().
        if(sessionStorage.getItem(sessionKey)!==u.uid){
          sessionStorage.setItem(sessionKey,u.uid);
          downloadCloud(false);
        }
      }else{
        sessionStorage.removeItem(sessionKey);
      }
    });
    setNote('syncStatus','تم ربط Firebase بنجاح.');return true;
  }catch(e){setNote('syncStatus','تعذر ربط Firebase: '+e.message);return false}
}
function updateAuthUI(){const box=el('authState');if(!box)return;box.textContent=currentUser?'مسجلة الدخول: '+currentUser.email:'غير مسجلة الدخول';el('signOutBtn').disabled=!currentUser}
function localPayload(){if(typeof saveAllData==='function')saveAllData();return readJson('nada_english_academy_v18_data',{savedAt:new Date().toISOString()})}
async function ensureFirebase(){return auth&&db?true:initFirebase()}
async function uploadCloud(silent){if(!await ensureFirebase()||!currentUser){if(!silent)setNote('syncStatus','سجلي الدخول أولًا.');return}try{const m=firebaseModules;await m.setDoc(m.doc(db,'users',currentUser.uid),{academyData:localPayload(),updatedAt:m.serverTimestamp(),email:currentUser.email},{merge:true});setNote('syncStatus','آخر رفع: '+new Date().toLocaleString('ar-EG'))}catch(e){setNote('syncStatus','فشل الرفع: '+e.message)}}
async function downloadCloud(show){if(!await ensureFirebase()||!currentUser){if(show)setNote('syncStatus','سجلي الدخول أولًا.');return}try{const m=firebaseModules;const snap=await m.getDoc(m.doc(db,'users',currentUser.uid));if(!snap.exists()||!snap.data().academyData){setNote('syncStatus','لا توجد بيانات محفوظة لهذا الحساب.');return}const data=snap.data().academyData;localStorage.setItem('nada_english_academy_v18_data',JSON.stringify(data));if(data.state)localStorage.setItem('nada_v12_state',JSON.stringify(data.state));if(data.customTopics)localStorage.setItem('nada_custom_topics_v1',JSON.stringify(data.customTopics));setNote('syncStatus','تم تحميل البيانات. يتم تحديث التطبيق...');setTimeout(()=>location.reload(),600)}catch(e){setNote('syncStatus','فشل التحميل: '+e.message)}}
function scheduleAutoSync(){if(localStorage.getItem(AUTO_SYNC_KEY)==='0'||!currentUser)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>uploadCloud(true),1200)}
function bind(){
  if(!el('aiMessages'))return;
  const s=getAiSettings();el('aiEndpoint').value=s.endpoint||'';el('aiApiKey').value=s.apiKey||'';el('aiMode').value=s.mode||'general';el('aiLevel').value=s.level||'A2';
  aiHistory=readJson(AI_HISTORY_KEY,[]);if(!aiHistory.length)addAi('teacher','Hello Nada! I am your AI English teacher. What would you like to practice today?');else renderAi();
  el('saveAiSettings').onclick=saveAiSettings;el('aiSendBtn').onclick=()=>{const t=el('aiInput').value.trim();if(t){el('aiInput').value='';askAi(t)}};el('aiInput').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();el('aiSendBtn').click()}};el('aiVoiceBtn').onclick=startAiVoice;el('clearAiChat').onclick=()=>{aiHistory=[];localStorage.removeItem(AI_HISTORY_KEY);addAi('teacher','Hello Nada! Let us start a new conversation.')};
  localStorage.setItem(FIREBASE_CONFIG_KEY,JSON.stringify(BUILTIN_FIREBASE_CONFIG));
  if(localStorage.getItem(AUTO_SYNC_KEY)===null)localStorage.setItem(AUTO_SYNC_KEY,'1');
  if(el('autoSyncToggle')){el('autoSyncToggle').checked=localStorage.getItem(AUTO_SYNC_KEY)!=='0';el('autoSyncToggle').onchange=e=>localStorage.setItem(AUTO_SYNC_KEY,e.target.checked?'1':'0')}
  el('signUpBtn').onclick=async()=>{if(!await ensureFirebase())return;try{await firebaseModules.createUserWithEmailAndPassword(auth,el('authEmail').value.trim(),el('authPassword').value);await uploadCloud(true);setNote('syncStatus','تم إنشاء الحساب وتفعيل المزامنة تلقائيًا.')}catch(e){setNote('syncStatus','تعذر إنشاء الحساب: '+e.message)}};
  el('signInBtn').onclick=async()=>{if(!await ensureFirebase())return;try{await firebaseModules.signInWithEmailAndPassword(auth,el('authEmail').value.trim(),el('authPassword').value);setNote('syncStatus','تم تسجيل الدخول والمزامنة تعمل تلقائيًا.')}catch(e){setNote('syncStatus','تعذر الدخول: '+e.message)}};
  el('signOutBtn').onclick=async()=>{if(auth)await firebaseModules.signOut(auth)};el('syncUploadBtn').onclick=()=>uploadCloud(false);el('syncDownloadBtn').onclick=()=>downloadCloud(true);updateAuthUI();initFirebase();window.addEventListener('nada:data-changed',scheduleAutoSync);
}
window.addEventListener('load',bind);window.NadaCloud={scheduleAutoSync,uploadCloud,downloadCloud};
})();
