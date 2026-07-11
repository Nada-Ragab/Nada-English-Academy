(function(){
'use strict';
const $=id=>document.getElementById(id);
let draft=null,selected=null,section='lessons',search='';
const clone=x=>JSON.parse(JSON.stringify(x));
function api(){return window.OdooAcademyEditorAPI}
function ensure(){if(!api()||!$('oaAdminRoot'))return false;if(!draft){draft=api().getModules();selected=api().getActive()||Object.keys(draft)[0]}return true}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slug(title){let base=String(title||'module').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'module';let k=base,n=2;while(draft[k])k=base+'-'+n++;return k}
function save(){api().saveModules(clone(draft));render();}
function moduleForm(m){return `<div class="oaAdminModuleForm"><label>الأيقونة<input id="oaAdminIcon" value="${esc(m.icon)}" maxlength="4"></label><label>اسم الموديول<input id="oaAdminTitle" value="${esc(m.title)}"></label><label>التصنيف<input id="oaAdminTag" value="${esc(m.tag)}"></label><label class="wide">الوصف<textarea id="oaAdminDescription">${esc(m.description)}</textarea></label></div>`}
function itemRows(m){const rows={lessons:m.lessons,words:m.words,dialogue:m.dialogue,interview:m.interview}[section]||[];const q=search.trim().toLowerCase();return rows.map((item,i)=>({item,i})).filter(x=>JSON.stringify(x.item).toLowerCase().includes(q)).map(({item,i})=>{
 let body='';
 if(section==='lessons')body=`<b>${esc(item[0])}</b><span>${esc(item[1])}</span><small>${esc(item[2])}</small>`;
 if(section==='words')body=`<b>${esc(item[0])}</b><span>${esc(item[1])}</span>`;
 if(section==='dialogue')body=`<b>${esc(item[0])}</b><span>${esc(item[1])}</span>`;
 if(section==='interview')body=`<b>${esc(item)}</b>`;
 const speakText=section==='lessons'?item[2]:section==='words'?item[0]:section==='dialogue'?item[1]:item;
 return `<article class="oaAdminRow" data-index="${i}"><div class="oaAdminRowText">${body}</div><div class="oaAdminRowActions"><button data-act="speak" data-text="${esc(speakText)}">🔊</button><button data-act="up">↑</button><button data-act="down">↓</button><button data-act="edit">✏️</button><button data-act="delete" class="danger">🗑️</button></div></article>`}).join('')||'<div class="smartEmpty">لا توجد عناصر مطابقة.</div>'}
function render(){if(!ensure())return;const root=$('oaAdminRoot'),m=draft[selected];if(!m){selected=Object.keys(draft)[0];return render()}
 root.innerHTML=`<div class="oaAdminLayout"><aside class="oaAdminModules"><div class="oaAdminModuleTools"><input id="oaAdminModuleSearch" placeholder="بحث في الموديولات..."><button id="oaAdminDuplicateModule">نسخ</button></div><div class="oaAdminModuleList">${Object.entries(draft).map(([k,x])=>`<button data-module="${esc(k)}" class="${k===selected?'active':''}"><span>${esc(x.icon)}</span><b>${esc(x.title)}</b><small>${x.lessons.length} درس</small></button>`).join('')}</div><button id="oaAdminDeleteModule" class="btn danger wide">حذف الموديول الحالي</button><button id="oaAdminReset" class="btn wide">استعادة المحتوى الأصلي</button></aside><section class="oaAdminWorkspace">${moduleForm(m)}<div class="oaAdminSaveBar"><button id="oaAdminSaveModule" class="btn blue">💾 حفظ بيانات الموديول</button><button id="oaAdminOpenModule" class="btn green">▶ فتح للتعلّم</button></div><div class="oaAdminSectionTabs">${[['lessons','الدروس'],['words','المصطلحات'],['dialogue','الحوار'],['interview','أسئلة المقابلة']].map(([k,t])=>`<button data-section="${k}" class="${section===k?'active':''}">${t}</button>`).join('')}</div><div class="oaAdminListHead"><input id="oaAdminSearch" value="${esc(search)}" placeholder="بحث داخل المحتوى..."><button id="oaAdminAddItem" class="btn green">＋ إضافة</button></div><div id="oaAdminItems">${itemRows(m)}</div></section></div>`;
 bindRendered();}
function promptItem(existing){if(section==='lessons'){const a=prompt('اسم الدرس',existing?.[0]||'');if(a===null)return null;const b=prompt('الشرح بالعربي',existing?.[1]||'');if(b===null)return null;const c=prompt('الجملة أو المهمة بالإنجليزية',existing?.[2]||'');if(c===null)return null;return[a.trim(),b.trim(),c.trim()]}
 if(section==='words'){const a=prompt('المصطلح بالإنجليزية',existing?.[0]||'');if(a===null)return null;const b=prompt('المعنى بالعربية',existing?.[1]||'');if(b===null)return null;return[a.trim(),b.trim()]}
 if(section==='dialogue'){const a=prompt('المتحدث: Client أو Consultant',existing?.[0]||'Client');if(a===null)return null;const b=prompt('الجملة بالإنجليزية',existing?.[1]||'');if(b===null)return null;return[a.trim(),b.trim()]}
 const a=prompt('سؤال المقابلة بالإنجليزية',existing||'');return a===null?null:a.trim()}
function bindRendered(){document.querySelectorAll('.oaAdminModuleList [data-module]').forEach(b=>b.onclick=()=>{selected=b.dataset.module;search='';render()});
 $('oaAdminSaveModule').onclick=()=>{const m=draft[selected];m.icon=$('oaAdminIcon').value.trim()||'🧩';m.title=$('oaAdminTitle').value.trim()||'Untitled Module';m.tag=$('oaAdminTag').value.trim()||'ODOO MODULE';m.description=$('oaAdminDescription').value.trim();save()};
 $('oaAdminOpenModule').onclick=()=>{save();api().setActive(selected);document.querySelector('[data-oa-tab="lessons"]')?.click()};
 $('oaAdminAddItem').onclick=()=>{const v=promptItem(null);if(v===null||v==='')return;draft[selected][section].push(v);save()};
 $('oaAdminSearch').oninput=e=>{search=e.target.value;const box=$('oaAdminItems');box.innerHTML=itemRows(draft[selected]);bindRows()};
 $('oaAdminDuplicateModule').onclick=()=>{const key=slug(draft[selected].title+' Copy');draft[key]=clone(draft[selected]);draft[key].title+=' Copy';selected=key;save()};
 $('oaAdminDeleteModule').onclick=()=>{if(Object.keys(draft).length===1)return alert('لا يمكن حذف آخر موديول.');if(!confirm('حذف الموديول وكل محتواه؟'))return;delete draft[selected];selected=Object.keys(draft)[0];save()};
 $('oaAdminReset').onclick=()=>{if(confirm('استعادة محتوى Odoo Academy الأصلي؟ ستُحذف تعديلاتك الحالية.')){api().reset();draft=api().getModules();selected=api().getActive();render()}};
 document.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{section=b.dataset.section;search='';render()});bindRows();}
function bindRows(){$('oaAdminItems')?.querySelectorAll('.oaAdminRow').forEach(row=>{const i=+row.dataset.index;row.querySelectorAll('[data-act]').forEach(btn=>btn.onclick=()=>{const arr=draft[selected][section],act=btn.dataset.act;if(act==='speak')return api().speak(btn.dataset.text);if(act==='edit'){const v=promptItem(arr[i]);if(v===null||v==='')return;arr[i]=v}if(act==='delete'){if(!confirm('حذف هذا العنصر؟'))return;arr.splice(i,1)}if(act==='up'&&i>0)[arr[i-1],arr[i]]=[arr[i],arr[i-1]];if(act==='down'&&i<arr.length-1)[arr[i+1],arr[i]]=[arr[i],arr[i+1]];save()})})}
function addModule(){if(!ensure())return;const title=prompt('اسم الموديول الجديد');if(!title)return;const key=slug(title);draft[key]={title:title.trim(),icon:'🧩',tag:'ODOO MODULE',description:'',lessons:[],words:[],dialogue:[],interview:[]};selected=key;save()}
window.addEventListener('load',()=>{if(!ensure())return;$('oaAdminAddModule').onclick=addModule;document.querySelector('[data-oa-tab="manage"]')?.addEventListener('click',render);render()});
})();
