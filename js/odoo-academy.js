(function(){
'use strict';
const $=id=>document.getElementById(id);
const STATE_KEY='nada_odoo_academy_v1';
const CONTENT_KEY='nada_odoo_academy_content_v274';
const LEGACY_CONTENT_KEY='nada_odoo_academy_content_v273';
let modules={
 payroll:{title:'Payroll',icon:'💰',tag:'HR & PAYROLL',description:'اشرحي دورة الرواتب، Salary Rules، Work Entries، المدخلات والتقارير باحتراف.',lessons:[
  ['Payroll Workflow','فهم دورة الراتب من العقد حتى اعتماد Payslip.','Explain the complete payroll workflow from employee contract to payslip validation.'],
  ['Salary Structure & Rules','شرح هيكل الراتب وقواعد Basic وAllowances وDeductions.','Explain how salary structures and salary rules control payroll calculation.'],
  ['Work Entries & Inputs','شرح أيام العمل والغياب والإضافي والمدخلات الأخرى.','Explain how work entries and payroll inputs affect the employee payslip.'],
  ['Payslip Review & Posting','مراجعة الراتب، الحساب، الاعتماد، وإنشاء القيد.','Show the client how to review, compute, validate, and post a payslip.'],
  ['Payroll Reports','شرح Payslip Details وPayroll Analysis والتصدير.','Demonstrate the payroll reports and explain how the client can filter and export data.']
 ],words:[['Payslip','قسيمة الراتب'],['Salary Structure','هيكل الراتب'],['Salary Rule','قاعدة الراتب'],['Work Entry','سجل العمل'],['Basic Salary','الراتب الأساسي'],['Allowance','بدل'],['Deduction','خصم'],['Gross Salary','إجمالي الراتب'],['Net Salary','صافي الراتب'],['Payroll Input','مدخل راتب'],['Compute Sheet','احتساب الراتب'],['Accounting Entry','القيد المحاسبي']],dialogue:[['Client','How is the employee salary calculated?'],['Consultant','The system calculates the salary according to the contract, salary structure, work entries, and additional inputs.'],['Client','Can we review the deductions before validation?'],['Consultant','Yes. You can review every salary rule result before validating the payslip.']],interview:['Walk me through a complete payroll cycle in Odoo.','How do salary rules get their values?','How do work entries affect payroll?','What would you check if a payslip calculation is incorrect?']},
 accounting:{title:'Accounting',icon:'📊',tag:'FINANCE',description:'تدربي على شرح القيود، الضرائب، التسوية البنكية، المدفوعات والتقارير المالية.',lessons:[
  ['Accounting Setup','إعداد دليل الحسابات والضرائب والدفاتر.','Explain the initial accounting configuration for a new company.'],['Customer Invoices','دورة فاتورة العميل من المسودة إلى الدفع.','Demonstrate the customer invoice workflow and payment registration.'],['Vendor Bills','شرح فواتير الموردين والمطابقة مع الشراء.','Explain vendor bill processing and purchase matching.'],['Bank Reconciliation','شرح استيراد كشف البنك والتسوية.','Show how bank transactions are reconciled in Odoo.'],['Financial Reports','شرح Balance Sheet وProfit and Loss وAged Reports.','Present the main financial reports to the finance team.']
 ],words:[['Chart of Accounts','دليل الحسابات'],['Journal Entry','قيد يومية'],['Receivable','ذمم مدينة'],['Payable','ذمم دائنة'],['Reconciliation','تسوية'],['Tax Grid','شبكة الضريبة'],['Fiscal Position','وضع ضريبي'],['Trial Balance','ميزان المراجعة'],['Profit and Loss','قائمة الدخل'],['Balance Sheet','الميزانية العمومية'],['Outstanding Account','حساب وسيط'],['Payment Terms','شروط الدفع']],dialogue:[['Client','Why is this payment still outstanding?'],['Consultant','The payment has been posted, but it still needs to be reconciled with the related invoice.'],['Client','Where can I complete the reconciliation?'],['Consultant','You can open the bank journal and match the transaction with the invoice.']],interview:['Explain the difference between posting and reconciliation.','How do payment terms affect invoice due dates?','What is the role of outstanding accounts?','How would you troubleshoot an unbalanced journal entry?']},
 inventory:{title:'Inventory',icon:'📦',tag:'SUPPLY CHAIN',description:'اشرحي المستودعات، المواقع، الحركات، Routes، Valuation وReplenishment.',lessons:[
  ['Warehouses & Locations','الفرق بين Warehouse وLocation وأنواع المواقع.','Explain warehouses, locations, and location types.'],['Receipts & Deliveries','شرح الاستلام والتسليم والتحويل الداخلي.','Demonstrate receipts, delivery orders, and internal transfers.'],['Routes & Reordering','شرح Routes وMTO وReordering Rules.','Explain routes, make-to-order, and replenishment rules.'],['Inventory Adjustments','شرح الجرد والتسويات وأسباب الفروقات.','Show how to perform and validate an inventory adjustment.'],['Inventory Valuation','شرح التقييم الآلي وقيود المخزون وCOGS.','Explain automated inventory valuation and accounting entries.']
 ],words:[['Warehouse','مستودع'],['Location','موقع مخزني'],['Receipt','استلام'],['Delivery Order','أمر تسليم'],['Internal Transfer','تحويل داخلي'],['Reordering Rule','قاعدة إعادة الطلب'],['Route','مسار'],['Make To Order','تصنيع/شراء حسب الطلب'],['Inventory Adjustment','تسوية مخزون'],['On Hand Quantity','الكمية المتاحة'],['Forecasted Quantity','الكمية المتوقعة'],['Inventory Valuation','تقييم المخزون']],dialogue:[['Client','Why was the product not replenished automatically?'],['Consultant','Let us review the reordering rule, route, minimum quantity, and preferred vendor.'],['Client','Does the system create the purchase order automatically?'],['Consultant','It can generate a request for quotation when the replenishment conditions are met.']],interview:['Explain the difference between on-hand and forecasted quantity.','When would you use Make To Order?','How does automated valuation create accounting entries?','What should you check when stock is available but cannot be reserved?']},
 sales:{title:'Sales',icon:'🧾',tag:'CRM & SALES',description:'تدربي على Quotation، Sales Order، Pricelists، Delivery وInvoicing.',lessons:[['Quotation Flow','إنشاء العرض وإرساله واعتماده.','Demonstrate the quotation workflow.'],['Pricing & Discounts','شرح Pricelists والخصومات.','Explain pricelists, discounts, and pricing rules.'],['Sales Delivery','ربط أمر البيع بالتسليم.','Explain how a confirmed sales order creates delivery operations.'],['Invoicing Policy','شرح Ordered vs Delivered Quantities.','Explain invoice policies based on ordered or delivered quantities.'],['Sales Reporting','تحليل المبيعات والفلاتر والتجميع.','Show the sales analysis report and useful filters.']],words:[['Quotation','عرض سعر'],['Sales Order','أمر بيع'],['Pricelist','قائمة أسعار'],['Discount','خصم'],['Expiration Date','تاريخ انتهاء'],['Invoicing Policy','سياسة الفوترة'],['Delivered Quantity','الكمية المسلمة'],['Salesperson','مندوب مبيعات'],['Sales Team','فريق مبيعات'],['Upselling','بيع إضافي']],dialogue:[['Client','Can we invoice only the delivered quantity?'],['Consultant','Yes. We can set the product invoicing policy to delivered quantities.'],['Client','What happens if the delivery is partial?'],['Consultant','The invoice will include only the quantity delivered so far.']],interview:['Walk me through the quotation-to-cash process.','Explain ordered quantity versus delivered quantity invoicing.','How do pricelists work?','How would you handle partial deliveries?']},
 purchase:{title:'Purchase',icon:'🛒',tag:'PROCUREMENT',description:'اشرحي RFQ، Purchase Orders، Vendor Bills، Approvals وThree-way matching.',lessons:[['RFQ to Purchase Order','تحويل طلب عرض السعر إلى أمر شراء.','Explain the RFQ to purchase order workflow.'],['Vendor Pricelists','إدارة أسعار الموردين والمهل الزمنية.','Explain vendor pricelists and lead times.'],['Purchase Receipts','ربط أمر الشراء بالاستلام.','Demonstrate receipt processing for a purchase order.'],['Vendor Bills','إنشاء فاتورة المورد والمطابقة.','Explain vendor bill creation and matching.'],['Purchase Controls','الموافقات وControl Policy.','Explain purchase approvals and billing control policies.']],words:[['Request for Quotation','طلب عرض سعر'],['Purchase Order','أمر شراء'],['Vendor','مورد'],['Lead Time','مهلة التوريد'],['Receipt','استلام'],['Vendor Bill','فاتورة مورد'],['Purchase Agreement','اتفاقية شراء'],['Call for Tender','مناقصة'],['Control Policy','سياسة التحكم'],['Three-way Matching','مطابقة ثلاثية']],dialogue:[['Client','Why can we not create the vendor bill?'],['Consultant','The billing control is based on received quantities, and the receipt has not been validated yet.'],['Client','Can we change it to ordered quantities?'],['Consultant','Yes, depending on your purchasing policy and control requirements.']],interview:['Explain the procure-to-pay process.','What is three-way matching?','How do vendor lead times affect planning?','When do you use purchase agreements?']},
 hr:{title:'HR & Time Off',icon:'👥',tag:'HUMAN RESOURCES',description:'تدربي على الموظفين، العقود، الإجازات، الرصيد، التخصيص والتقارير.',lessons:[['Employee Records','بيانات الموظف والأقسام والمناصب.','Explain employee records and organizational structure.'],['Contracts','شرح العقود والراتب وتاريخ البداية.','Explain employee contracts and compensation details.'],['Time Off Types','إعداد أنواع الإجازات وقواعدها.','Explain time-off types and their validation rules.'],['Allocations & Balance','التخصيص والرصيد الفعلي.','Explain allocations and how the employee balance is calculated.'],['Leave Reports','التقارير والتجميع حسب الموظف والحالة.','Demonstrate time-off reports and filters.']],words:[['Employee','موظف'],['Department','قسم'],['Job Position','مسمى وظيفي'],['Contract','عقد'],['Time Off Type','نوع إجازة'],['Allocation','تخصيص رصيد'],['Accrual Plan','خطة استحقاق'],['Remaining Balance','الرصيد المتبقي'],['Approval','موافقة'],['Return Date','تاريخ العودة']],dialogue:[['Client','How can I check the employee’s actual leave balance?'],['Consultant','Open the time-off report and filter by employee and leave type.'],['Client','Does the balance increase automatically?'],['Consultant','Yes, when the employee is assigned to an accrual plan.']],interview:['How do allocations differ from time-off requests?','Explain accrual plans.','How would you configure multi-level leave approval?','How do you verify an employee’s actual balance?']},
 realestate:{title:'Real Estate',icon:'🏢',tag:'INDUSTRY SOLUTION',description:'تدربي على الوحدات، العقود، المستأجرين، الأقساط، الصيانة والتقارير.',lessons:[['Property Structure','المناطق والعقارات والوحدات.','Explain the property hierarchy from region to unit.'],['Tenants & Owners','إدارة الشركاء والممثلين.','Explain tenant, owner, and representative records.'],['Rental Contracts','إنشاء العقد والجدول والفواتير.','Demonstrate the rental contract workflow.'],['Installments & Settlement','الأقساط وتسوية الإيجار.','Explain installment scheduling and rental settlement.'],['Maintenance & Reporting','طلبات الصيانة وربطها بالوحدة والعقد.','Explain maintenance operations and real-estate reports.']],words:[['Property','عقار'],['Unit','وحدة'],['Tenant','مستأجر'],['Owner','مالك'],['Broker','وسيط'],['Rental Contract','عقد إيجار'],['Installment','قسط'],['Rental Fee','قيمة الإيجار'],['Reservation','حجز'],['Maintenance Order','طلب صيانة'],['Running Contract','عقد ساري'],['Settlement','تسوية']],dialogue:[['Client','Can we generate the installments automatically?'],['Consultant','Yes. The system creates the installment schedule according to the contract dates and payment frequency.'],['Client','Can maintenance costs be linked to the tenant?'],['Consultant','Yes. The maintenance order can be linked to the unit, running contract, and tenant.']],interview:['Explain the rental contract lifecycle.','How would you generate recurring rental invoices?','How do you link maintenance to units and contracts?','What controls would you add when duplicating a contract?']}
};
const defaultModules=JSON.parse(JSON.stringify(modules));
function normalizeModule(m={}){
 const normalizeCase=x=>({title:String(x?.title||'Implementation Case'),context:String(x?.context||''),requirements:Array.isArray(x?.requirements)?x.requirements.map(String):[],model:String(x?.model||'')});
 const normalizeQuiz=x=>({type:String(x?.type||'Custom'),q:String(x?.q||''),options:Array.isArray(x?.options)?x.options.map(String):[],answer:String(x?.answer||''),explain:String(x?.explain||'')});
 return {
  title:String(m.title||'New Module'),icon:String(m.icon||'🧩'),color:String(m.color||'#6d5dfc'),tag:String(m.tag||'ODOO MODULE'),description:String(m.description||''),
  lessons:Array.isArray(m.lessons)?m.lessons.map(x=>[String(x?.[0]||''),String(x?.[1]||''),String(x?.[2]||'')]):[],
  sentences:Array.isArray(m.sentences)?m.sentences.map(x=>[String(x?.[0]||''),String(x?.[1]||'')]):[],
  words:Array.isArray(m.words)?m.words.map(x=>[String(x?.[0]||''),String(x?.[1]||'')]):[],
  dialogue:Array.isArray(m.dialogue)?m.dialogue.map(x=>[String(x?.[0]||'Client'),String(x?.[1]||'')]):[],
  interview:Array.isArray(m.interview)?m.interview.map(String):[],
  cases:Array.isArray(m.cases)?m.cases.map(normalizeCase):[],
  quiz:Array.isArray(m.quiz)?m.quiz.map(normalizeQuiz):[]
 };
}
function loadContent(){
 try{
  const raw=localStorage.getItem(CONTENT_KEY)||localStorage.getItem(LEGACY_CONTENT_KEY)||'null';
  const saved=JSON.parse(raw);
  if(saved&&typeof saved==='object'&&Object.keys(saved).length){
   const normalized=Object.fromEntries(Object.entries(saved).map(([k,v])=>[k,normalizeModule(v)]));
   localStorage.setItem(CONTENT_KEY,JSON.stringify(normalized));
   return normalized;
  }
 }catch(e){console.warn('Odoo Academy content load failed',e)}
 return Object.fromEntries(Object.entries(defaultModules).map(([k,v])=>[k,normalizeModule(v)]));
}
function saveContent(){localStorage.setItem(CONTENT_KEY,JSON.stringify(modules));window.dispatchEvent(new CustomEvent('nada:data-changed'));}
modules=loadContent();
let active=modules.payroll?'payroll':Object.keys(modules)[0],state=load(),quizWord=null;
const caseStudies={
 payroll:{title:'Incorrect Net Salary After Payroll Computation',context:'A Saudi client computed the July payroll. Several employees have incorrect net salaries, overtime is missing, and one absence deduction was calculated twice.',requirements:['Identify the data and configuration you need to review.','Explain the troubleshooting steps to the payroll officer.','Describe how you will validate the correction before posting.'],model:'First, I would review the employee contracts, salary structures, work entries, and payroll inputs. Then I would check the sequence and Python logic of the overtime and absence salary rules. I would recompute the affected payslips in draft, compare the results with the approved attendance data, and validate a sample with the payroll officer before posting the batch.'},
 accounting:{title:'Payment Posted but Invoice Still Unpaid',context:'The finance team registered a customer payment, but the invoice still appears as unpaid and the amount remains in an outstanding receipts account.',requirements:['Explain the likely reason.','Show the user where to complete the process.','Mention the accounting result after reconciliation.'],model:'The payment has been posted, but it has not yet been reconciled with the invoice. I would open the bank or outstanding receipts journal, match the payment transaction with the customer invoice, and validate the reconciliation. After that, the invoice status will become paid and the outstanding balance will be cleared.'},
 inventory:{title:'Stock Available but Delivery Cannot Reserve',context:'The product shows positive on-hand quantity, but a confirmed delivery order cannot reserve any quantity.',requirements:['List the checks you would perform.','Explain the difference between on-hand and available stock.','Give the client a clear next action.'],model:'I would check the exact source location, lot or serial requirements, package and owner restrictions, reserved quantities, routes, and the scheduled date. On-hand quantity may exist in another location or may already be reserved. After identifying the available stock in the correct source location, I would release conflicting reservations or correct the operation details and run Check Availability again.'},
 sales:{title:'Partial Delivery and Incorrect Invoice Quantity',context:'A customer ordered 100 units, only 60 were delivered, but the sales team expects the invoice to include only the delivered quantity.',requirements:['Identify the relevant product setting.','Explain the expected invoice behavior.','Describe what happens after the remaining delivery.'],model:'I would verify that the product invoicing policy is set to Delivered Quantities. The first invoice should include only the 60 delivered units. When the remaining 40 units are delivered, the sales team can create a second invoice for the balance.'},
 purchase:{title:'Vendor Bill Cannot Be Created',context:'The purchasing team confirmed a purchase order, but the system does not allow them to bill the received products yet.',requirements:['Check the billing control policy.','Explain the effect of receipt validation.','Recommend the correct process.'],model:'I would review the product control policy. If it is based on received quantities, the receipt must be validated before the related quantity becomes billable. The correct process is to validate the actual receipt, then create the vendor bill and verify the quantities and prices before posting.'},
 hr:{title:'Employee Leave Balance Is Lower Than Expected',context:'An employee believes the annual leave balance is incorrect after returning from leave. The HR officer also changed the actual return date.',requirements:['Explain which records affect the balance.','Describe the checks needed after changing the return date.','Tell HR how to verify the final balance.'],model:'I would review the employee allocation, accrual plan, approved leave request, and actual return date. If the employee returned early or late, the leave duration and related work entries may need recalculation. Finally, I would open the time-off report, filter by employee and leave type, and compare allocated, taken, and remaining days.'},
 realestate:{title:'Rental Contract Installments Have Wrong Dates',context:'A rental contract started on the first day of the month but was confirmed later. The client wants the first invoice and installment dates to follow the approved business rule.',requirements:['Clarify the required date rule.','Identify records that may be affected.','Explain how you would test the solution.'],model:'I would first confirm whether the first installment should follow the contract start date or the confirmation date when confirmation is late. Then I would review the installment schedule, generated invoices, posting dates, and tax submission impact. I would test new contracts with normal and late confirmation scenarios, verify all dates, and obtain client approval before applying the change to production.'}
};
let assessment={questions:[],index:0,answers:[]};

function load(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'')||{done:{},words:{},practices:0,days:[],scores:{}}}catch{return{done:{},words:{},practices:0,days:[],scores:{}}}}
function save(){localStorage.setItem(STATE_KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent('nada:data-changed'));renderStats()}
function mod(){return modules[active]}
function speak(text,rate=.85){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=rate;speechSynthesis.speak(u)}
function goAI(prompt){const nav=document.querySelector('[data-screen="aiteacher"]');nav?.click();setTimeout(()=>{const mode=$('aiMode');if(mode){mode.value='odoo';mode.dispatchEvent(new Event('change'))}const inp=$('aiInput');if(inp){inp.value=prompt;$('aiSendBtn')?.click()}},350)}
function moduleDone(key){return Object.keys(state.done).filter(x=>x.startsWith(key+':')&&state.done[x]).length}
function renderModules(){
 const box=$('oaModuleList');if(!box)return;
 box.innerHTML=Object.entries(modules).map(([k,m])=>{const done=moduleDone(k);return `<button class="${k===active?'active':''}" data-module="${k}"><span>${m.icon}</span><div><b>${m.title}</b><small>${done}/${m.lessons.length} دروس</small></div><i>${m.lessons.length?Math.round(done/m.lessons.length*100):0}%</i></button>`}).join('')+
 `<div class="oaDirectModuleTools"><button id="oaDirectAddModule">＋ إضافة موديول</button><button id="oaDirectEditModule">✏️ تعديل الموديول</button><button id="oaDirectDeleteModule" class="danger">🗑️ حذف</button></div>`;
 box.querySelectorAll('[data-module]').forEach(b=>b.onclick=()=>{active=b.dataset.module;renderAll()});
 $('oaDirectAddModule').onclick=addModuleDirect;
 $('oaDirectEditModule').onclick=editModuleDirect;
 $('oaDirectDeleteModule').onclick=deleteModuleDirect;
}

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function uniqueModuleKey(title){let base=String(title||'module').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'module',key=base,n=2;while(modules[key])key=`${base}-${n++}`;return key}
function addModuleDirect(){
 const title=prompt('اسم الموديول بالإنجليزية');if(title===null||!title.trim())return;
 const key=uniqueModuleKey(title),icon=prompt('الأيقونة', '🧩')||'🧩',description=prompt('وصف الموديول بالعربية','')||'';
 modules[key]=normalizeModule({title:title.trim(),icon,tag:'ODOO MODULE',description,color:'#6d5dfc',lessons:[],sentences:[],words:[],dialogue:[],interview:[],cases:[],quiz:[]});active=key;saveContent();renderAll();
}
function editModuleDirect(){
 const m=mod(),title=prompt('اسم الموديول',m.title);if(title===null)return;
 const icon=prompt('الأيقونة',m.icon);if(icon===null)return;
 const tag=prompt('التصنيف',m.tag);if(tag===null)return;
 const description=prompt('الوصف',m.description);if(description===null)return;
 m.title=title.trim()||m.title;m.icon=icon.trim()||m.icon;m.tag=tag.trim()||m.tag;m.description=description.trim();saveContent();renderAll();
}
function deleteModuleDirect(){
 if(Object.keys(modules).length<=1){alert('لا يمكن حذف آخر موديول.');return}
 if(!confirm(`حذف موديول ${mod().title} بكل محتواه؟`))return;
 delete modules[active];active=Object.keys(modules)[0];saveContent();renderAll();
}
function editLessonDirect(index=null){
 const current=index===null?['','','']:mod().lessons[index];
 const title=prompt('اسم الدرس',current[0]);if(title===null)return;
 const arabic=prompt('الشرح بالعربي',current[1]);if(arabic===null)return;
 const english=prompt('المهمة أو الجملة بالإنجليزية',current[2]);if(english===null)return;
 const row=[title.trim(),arabic.trim(),english.trim()];
 if(!row[0]&&!row[1]&&!row[2])return;
 if(index===null)mod().lessons.push(row);else mod().lessons[index]=row;
 saveContent();renderAll();
}
function deleteLessonDirect(index){if(!confirm('حذف هذا الدرس؟'))return;mod().lessons.splice(index,1);saveContent();renderAll()}
function moveLessonDirect(index,dir){const target=index+dir;if(target<0||target>=mod().lessons.length)return;[mod().lessons[index],mod().lessons[target]]=[mod().lessons[target],mod().lessons[index]];saveContent();renderAll()}

function renderHeader(){const m=mod(),done=moduleDone(active),pct=m.lessons.length?Math.round(done/m.lessons.length*100):0;$('oaModuleIcon').textContent=m.icon;$('oaModuleTag').textContent=m.tag;$('oaModuleTitle').textContent=m.title;$('oaModuleDescription').textContent=m.description;$('oaModulePct').textContent=pct+'%';$('oaModuleBar').style.width=pct+'%';$('oaModuleProgressText').textContent=`${done} من ${m.lessons.length} دروس`}
function renderLessons(){
 const box=$('oaLessons');if(!box)return;
 box.innerHTML=`<div class="oaDirectLessonsHead"><div><small>LESSON MANAGER</small><h3>دروس ${mod().title}</h3></div><button id="oaDirectAddLesson" class="btn green">＋ إضافة درس</button></div>`+
 mod().lessons.map((l,i)=>{const key=`${active}:${i}`,done=!!state.done[key];return `<article class="oaLesson ${done?'done':''}"><button class="oaLessonCheck" data-check="${i}">${done?'✓':''}</button><div><small>LESSON ${i+1}</small><h3>${escapeHtml(l[0])}</h3><p>${escapeHtml(l[1])}</p><div class="oaEnglishTask">${escapeHtml(l[2])}</div></div><div class="oaLessonActions"><button data-speak="${i}">🔊 اسمع</button><button data-practice="${i}">🤖 تدربي</button><button data-lesson-up="${i}" title="لأعلى">↑</button><button data-lesson-down="${i}" title="لأسفل">↓</button><button data-lesson-edit="${i}">✏️ تعديل</button><button data-lesson-delete="${i}" class="danger">🗑️ حذف</button></div></article>`}).join('');
 $('oaDirectAddLesson').onclick=()=>editLessonDirect();
 box.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const key=`${active}:${b.dataset.check}`;state.done[key]=!state.done[key];save();renderAll()});
 box.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speak(mod().lessons[+b.dataset.speak][2]));
 box.querySelectorAll('[data-practice]').forEach(b=>b.onclick=()=>{const l=mod().lessons[+b.dataset.practice];startPractice();goAI(`You are an Odoo client. Ask me to complete this task about ${mod().title}: ${l[2]} Ask one question at a time, correct my English in Arabic, then continue.`)});
 box.querySelectorAll('[data-lesson-edit]').forEach(b=>b.onclick=()=>editLessonDirect(+b.dataset.lessonEdit));
 box.querySelectorAll('[data-lesson-delete]').forEach(b=>b.onclick=()=>deleteLessonDirect(+b.dataset.lessonDelete));
 box.querySelectorAll('[data-lesson-up]').forEach(b=>b.onclick=()=>moveLessonDirect(+b.dataset.lessonUp,-1));
 box.querySelectorAll('[data-lesson-down]').forEach(b=>b.onclick=()=>moveLessonDirect(+b.dataset.lessonDown,1));
}
function renderSentences(){
 const host=$('oaSentences');if(!host)return;const rows=mod().sentences||[];
 host.innerHTML=rows.length?rows.map((x,i)=>`<article class="oaSentenceCard"><div><small>SENTENCE ${i+1}</small><b>${x[0]}</b><span>${x[1]}</span></div><div><button data-sentence-speak="${i}">🔊</button><button data-sentence-practice="${i}">🤖 تدربي</button></div></article>`).join(''):'<div class="smartEmpty">لا توجد جمل إضافية في هذا الموديول بعد.</div>';
 host.querySelectorAll('[data-sentence-speak]').forEach(b=>b.onclick=()=>speak(rows[+b.dataset.sentenceSpeak][0]));
 host.querySelectorAll('[data-sentence-practice]').forEach(b=>b.onclick=()=>{const row=rows[+b.dataset.sentencePractice];startPractice();goAI(`Practice this Odoo ${mod().title} sentence with me: ${row[0]} Correct my grammar and pronunciation, then ask me to use it in a client conversation.`)});
}
function renderWords(filter=''){const box=$('oaVocabulary'),q=filter.toLowerCase();box.innerHTML=mod().words.filter(w=>w[0].toLowerCase().includes(q)||w[1].includes(filter)).map((w,i)=>{const key=`${active}:${w[0]}`,known=!!state.words[key];return `<div class="oaWord ${known?'known':''}"><button class="oaWordSound" data-word="${w[0]}">🔊</button><div><b>${w[0]}</b><span>${w[1]}</span></div><button class="oaWordKnow" data-known="${w[0]}">${known?'✓ متقنة':'عرفتها'}</button></div>`}).join('')||'<div class="smartEmpty">لا توجد نتائج.</div>';box.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>speak(b.dataset.word,.72));box.querySelectorAll('[data-known]').forEach(b=>b.onclick=()=>{const key=`${active}:${b.dataset.known}`;state.words[key]=!state.words[key];save();renderWords($('oaWordSearch').value)})}
function renderDialogue(){const box=$('oaDialogue');box.innerHTML=mod().dialogue.map((d,i)=>`<div class="oaDialogueLine ${i%2?'consultant':'client'}"><span>${d[0]}</span><p>${d[1]}</p><button data-line="${i}">🔊</button></div>`).join('');box.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>speak(mod().dialogue[+b.dataset.line][1]))}
function renderInterview(){const box=$('oaInterviewQuestions');box.innerHTML=mod().interview.map((q,i)=>`<div><span>${i+1}</span><p>${q}</p><button data-q="${i}">تدربي مع AI</button></div>`).join('');box.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{startPractice();goAI(`Act as an interviewer hiring an Odoo Functional Consultant. Ask me this question about ${mod().title}: ${mod().interview[+b.dataset.q]} Wait for my answer, then give correction, a stronger model answer, and one follow-up question.`)})}
function scenarioText(){const type=$('oaScenario')?.value||'requirements',m=mod().title;return {requirements:`The client wants to implement ${m}. Discover their current process, pain points, approvals, reports, and expected outcome.`,demo:`Give a simple professional demo of the main ${m} workflow and answer client questions.`,support:`The client reports an urgent ${m} issue. Ask diagnostic questions and explain the solution clearly.`,uat:`Lead a UAT session for ${m}. Confirm test cases, expected results, issues, and sign-off.`}[type]}
function updateScenario(){$('oaScenarioPreview').innerHTML=`<b>${mod().title}</b><p>${scenarioText()}</p>`}
function startPractice(){state.practices=(state.practices||0)+1;const today=new Date().toISOString().slice(0,10);state.days=Array.from(new Set([...(state.days||[]),today])).slice(-30);save()}
function startWordQuiz(){const words=mod().words;quizWord=words[Math.floor(Math.random()*words.length)];const options=[quizWord,...words.filter(x=>x!==quizWord).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);$('oaWordQuiz').innerHTML=`<h4>اختاري معنى: <span>${quizWord[0]}</span></h4>${options.map(w=>`<button data-answer="${w[1]}">${w[1]}</button>`).join('')}<div id="oaQuizFeedback"></div>`;$('oaWordQuiz').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{$('oaQuizFeedback').textContent=b.dataset.answer===quizWord[1]?'✅ إجابة صحيحة':'❌ الإجابة الصحيحة: '+quizWord[1]})}
function renderStats(){const totalLessons=Object.values(modules).reduce((n,m)=>n+m.lessons.length,0),done=Object.values(state.done||{}).filter(Boolean).length,words=Object.values(state.words||{}).filter(Boolean).length,pct=Math.round((done/totalLessons)*100);$('oaOverall').textContent=pct+'%';$('oaDoneLessons').textContent=done;$('oaMasteredWords').textContent=words;$('oaPracticeCount').textContent=state.practices||0;$('oaTrackStreak').textContent=(state.days||[]).length;$('oaLevel').textContent=(JSON.parse(localStorage.getItem('nada_ai_settings_v2')||'{}').level||'A2')+' • Functional Track'}

function renderCase(){
 const c=(mod().cases&&mod().cases[0])||caseStudies[active]||{title:mod().title+' Implementation Case',context:'Create a realistic client scenario for this module and practice gathering requirements.',requirements:['Explain the current process.','Identify the required configuration.','Present the recommended Odoo workflow.'],model:'Start by gathering the client requirements, map the current process, configure the suitable Odoo workflow, test it with realistic data, and obtain user approval.'},box=$('oaCaseStudy');if(!box)return;
 box.innerHTML=`<div class="oaCaseBlock"><small>CLIENT CASE</small><h4>${c.title}</h4><p>${c.context}</p></div><div class="oaCaseBlock"><small>YOUR TASK</small><ul>${c.requirements.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
 const ans=$('oaCaseAnswer');if(ans){ans.hidden=true;ans.textContent=c.model}
}
function buildAssessment(){
 const m=mod(),qs=[];
 if(Array.isArray(m.quiz)&&m.quiz.length){m.quiz.forEach(q=>qs.push({type:q.type||'Custom',q:q.q,options:[...(q.options||[])],answer:q.answer,explain:q.explain||''}));}
 const shuffled=[...m.words].sort(()=>Math.random()-.5).slice(0,5);
 shuffled.forEach(w=>{
  const distract=[...m.words].filter(x=>x[0]!==w[0]).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[1]);
  qs.push({type:'Vocabulary',q:`What is the Arabic meaning of “${w[0]}”?`,options:[w[1],...distract].sort(()=>Math.random()-.5),answer:w[1],explain:`${w[0]} = ${w[1]}`});
 });
 m.lessons.slice(0,3).forEach((l,i)=>{
  const wrong=m.lessons.filter((_,j)=>j!==i).sort(()=>Math.random()-.5).slice(0,3).map(x=>x[2]);
  qs.push({type:'Workflow',q:`Which task best matches “${l[0]}”?`,options:[l[2],...wrong].sort(()=>Math.random()-.5),answer:l[2],explain:l[1]});
 });
 const d=m.dialogue;
 if(d.length>=4){
  qs.push({type:'Consulting',q:`The client says: “${d[0][1]}” What is the best professional response?`,options:[d[1][1],d[3][1],'This is not an Odoo issue.','Please try again later without checking.'].sort(()=>Math.random()-.5),answer:d[1][1],explain:'Use a clear response that explains the system logic and the next step.'});
  qs.push({type:'Consulting',q:`The client asks: “${d[2][1]}” What is the best response?`,options:[d[3][1],d[1][1],'The system cannot support this process.','You need to create a new database.'].sort(()=>Math.random()-.5),answer:d[3][1],explain:'Answer the exact client question and explain the relevant configuration or process.'});
 }
 assessment={questions:qs.slice(0,10),index:0,answers:Array(qs.slice(0,10).length).fill(null)};
 renderAssessmentQuestion();
}
function renderAssessmentQuestion(){
 const box=$('oaAssessment');if(!box)return;const q=assessment.questions[assessment.index];
 if(!q){box.innerHTML='';return}
 box.innerHTML=`<div class="oaQuestion"><div class="oaQuestionHead"><span>${q.type.toUpperCase()}</span><span>${assessment.index+1} / ${assessment.questions.length}</span></div><h4>${q.q}</h4><div class="oaOptions">${q.options.map((o,i)=>`<button data-option="${i}" class="${assessment.answers[assessment.index]===i?'selected':''}">${o}</button>`).join('')}</div></div><div class="oaAssessmentNav"><button class="btn" id="oaPrevQuestion" ${assessment.index===0?'disabled':''}>السابق</button><span>أجيبي عن كل الأسئلة ثم اعرضي النتيجة</span><button class="btn blue" id="oaNextQuestion">${assessment.index===assessment.questions.length-1?'إنهاء الاختبار':'التالي'}</button></div>`;
 box.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{assessment.answers[assessment.index]=+b.dataset.option;renderAssessmentQuestion()});
 $('oaPrevQuestion').onclick=()=>{assessment.index--;renderAssessmentQuestion()};
 $('oaNextQuestion').onclick=()=>{if(assessment.answers[assessment.index]===null){alert('اختاري إجابة أولًا.');return}if(assessment.index<assessment.questions.length-1){assessment.index++;renderAssessmentQuestion()}else finishAssessment()};
}
function finishAssessment(){
 const correct=assessment.questions.reduce((n,q,i)=>n+(q.options[assessment.answers[i]]===q.answer?1:0),0),score=Math.round(correct/assessment.questions.length*100),pass=score>=70;
 state.scores=state.scores||{};state.scores[active]=Math.max(state.scores[active]||0,score);save();
 const review=assessment.questions.map((q,i)=>{const chosen=q.options[assessment.answers[i]],ok=chosen===q.answer;return `<div>${ok?'✅':'❌'} <b>${q.q}</b><br><small>${ok?'Correct':'Your answer: '+chosen+' | Correct: '+q.answer}</small></div>`}).join('');
 $('oaAssessment').innerHTML=`<div class="oaAssessmentResult ${pass?'pass':'fail'}"><div class="score">${score}%</div><h3>${pass?'🎉 اجتزتِ الموديول':'📚 تحتاجي مراجعة إضافية'}</h3><p>${correct} إجابات صحيحة من ${assessment.questions.length}</p><p>${pass?'ابدئي Case Study أو انتقلي للموديول التالي.':'راجعي الدروس والمصطلحات ثم أعيدي الاختبار.'}</p><button class="btn blue" id="oaRetryAssessment">إعادة الاختبار</button><div class="oaAssessmentReview">${review}</div></div>`;
 $('oaRetryAssessment').onclick=buildAssessment;renderBestScore();
}
function renderBestScore(){const el=$('oaBestScore');if(el)el.textContent=(state.scores?.[active]??'—')+(state.scores?.[active]!=null?'%':'')}
function renderAll(){renderModules();renderHeader();renderLessons();renderSentences();renderWords($('oaWordSearch')?.value||'');renderDialogue();renderInterview();updateScenario();renderStats();renderCase();renderBestScore();if($('oaAssessment'))$('oaAssessment').innerHTML=''}

window.OdooAcademyEditorAPI={
 getModules:()=>JSON.parse(JSON.stringify(modules)),
 getActive:()=>active,
 setActive:key=>{if(modules[key]){active=key;renderAll()}},
 saveModules:next=>{
  if(!next||typeof next!=='object'||!Object.keys(next).length)throw new Error('At least one module is required');
  modules=Object.fromEntries(Object.entries(next).map(([k,v])=>[k,normalizeModule(v)]));
  if(!modules[active])active=Object.keys(modules)[0];
  saveContent();renderAll();
 },
 reset:()=>{modules=JSON.parse(JSON.stringify(defaultModules));active=modules.payroll?'payroll':Object.keys(modules)[0];saveContent();renderAll()},
 refresh:renderAll,
 getCases:()=>JSON.parse(JSON.stringify(caseStudies)),
 speak
};

function bind(){if(!$('odooacademy'))return;document.querySelectorAll('[data-oa-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-oa-tab]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('[data-oa-pane]').forEach(p=>p.classList.toggle('active',p.dataset.oaPane===b.dataset.oaTab))});$('oaWordSearch').oninput=e=>renderWords(e.target.value);$('oaQuizWords').onclick=startWordQuiz;$('oaPlayDialogue').onclick=()=>{let i=0;const lines=mod().dialogue;const next=()=>{if(i>=lines.length)return;const u=new SpeechSynthesisUtterance(lines[i++][1]);u.lang='en-US';u.rate=.82;u.onend=()=>setTimeout(next,350);speechSynthesis.speak(u)};speechSynthesis.cancel();next()};$('oaScenario').onchange=updateScenario;$('oaStartPractice').onclick=()=>{startPractice();goAI(`Role-play this Odoo ${mod().title} scenario: ${scenarioText()} You are the client and I am the functional consultant. Ask one question at a time and correct my English after each answer.`)};$('oaStartInterview').onclick=()=>{startPractice();goAI(`Interview me for an Odoo Functional Consultant position, focusing on ${mod().title}. Ask one question at a time. After each answer, correct my English in Arabic and give a professional improved answer.`)};$('oaSpeakCase').onclick=()=>speak(caseStudies[active].context+' '+caseStudies[active].requirements.join(' '),.82);$('oaStartCase').onclick=()=>{startPractice();const c=caseStudies[active]||{context:'A client needs help implementing '+mod().title+'.',requirements:['Gather requirements','Explain the workflow','Validate the solution']};goAI(`Act as an Odoo client and guide me through this real implementation case for ${mod().title}: ${c.context} My tasks are: ${c.requirements.join(' ')} Ask one question at a time. Correct my English in Arabic and evaluate my functional approach.`)};$('oaRevealCase').onclick=()=>{const a=$('oaCaseAnswer');a.hidden=!a.hidden};$('oaStartAssessment').onclick=buildAssessment;renderAll()}
window.addEventListener('load',bind);
})();
