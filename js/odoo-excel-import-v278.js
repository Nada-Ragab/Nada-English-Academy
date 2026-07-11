(()=>{
'use strict';
const $=id=>document.getElementById(id);
let sheetLoader=null;
function loadSheetJS(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  if(sheetLoader)return sheetLoader;
  sheetLoader=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.async=true;
    s.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('تعذر تحميل مكتبة Excel'));
    s.onerror=()=>reject(new Error('تعذر تحميل مكتبة Excel. استخدمي CSV أو اتصلي بالإنترنت.'));
    document.head.appendChild(s);
  });
  return sheetLoader;
}
function normalize(v){return String(v||'').trim().toLowerCase().replace(/[ _-]+/g,'')}
function parseCsvLine(line){const out=[];let cur='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){cur+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out}
function rowToSentence(row){const n={};Object.keys(row||{}).forEach(k=>n[normalize(k)]=row[k]);const en=String(n.english||n.sentence||n.englishsentence||'').trim();const ar=String(n.arabic||n.translation||n.arabictranslation||'').trim();return en?[en,ar]:null}
function getEditorData(){
  const api=window.OdooAcademyEditorAPI;
  if(!api||typeof api.getModules!=='function'||typeof api.getActive!=='function'||typeof api.saveModules!=='function')return null;
  return {api,draft:api.getModules(),key:api.getActive()};
}
async function readRows(file){
  if(/\.csv$/i.test(file.name)){
    const text=(await file.text()).replace(/^\uFEFF/,'');const lines=text.split(/\r?\n/).filter(x=>x.trim());
    if(lines.length<2)throw new Error('الملف فارغ');const headers=parseCsvLine(lines[0]);
    return lines.slice(1).map(line=>{const cells=parseCsvLine(line);return Object.fromEntries(headers.map((h,i)=>[h,cells[i]||'']))});
  }
  const XLSX=await loadSheetJS();const data=await file.arrayBuffer();const wb=XLSX.read(data,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(ws,{defval:''});
}
async function importFile(file){
  const ctx=getEditorData();if(!ctx)throw new Error('افتحي إدارة موديول Odoo أولًا');
  const rows=await readRows(file);const items=rows.map(rowToSentence).filter(Boolean);if(!items.length)throw new Error('استخدمي الأعمدة English وArabic');
  const mod=ctx.draft[ctx.key];if(!mod)throw new Error('لم يتم تحديد موديول');mod.sentences=Array.isArray(mod.sentences)?mod.sentences:[];mod.sentences.push(...items);
  ctx.api.saveModules(ctx.draft);ctx.api.refresh?.();alert(`تمت إضافة ${items.length} جملة بنجاح.`);
}
function downloadTemplate(){
  const csv='English,Arabic\n"How can I configure payroll rules?","كيف يمكنني إعداد قواعد الرواتب؟"\n"Please confirm the employee contract first.","يرجى تأكيد عقد الموظف أولًا."';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));a.download='Odoo_Sentences_Template.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function enhance(){
  const head=document.querySelector('.oaAdminListHead');
  if(!head||$('oaExcelImportStable'))return;
  const active=document.querySelector('.oaAdminSectionTabs button.active');
  if(!active||active.dataset.section!=='sentences')return;
  const wrap=document.createElement('div');wrap.className='oaExcelTools';wrap.id='oaExcelImportStable';
  wrap.innerHTML='<button class="btn blue" type="button">📥 رفع Excel/CSV</button><button class="btn orange" type="button">📄 نموذج CSV</button><input type="file" accept=".xlsx,.xls,.csv" hidden>';
  head.appendChild(wrap);const [importBtn,templateBtn,input]=wrap.children;
  importBtn.onclick=()=>input.click();templateBtn.onclick=downloadTemplate;
  input.onchange=async()=>{const f=input.files&&input.files[0];if(!f)return;try{await importFile(f)}catch(e){alert('تعذر رفع الملف: '+e.message)}finally{input.value=''}};
}
const obs=new MutationObserver(()=>enhance());
window.addEventListener('DOMContentLoaded',()=>{enhance();obs.observe(document.body,{childList:true,subtree:true})});
})();
