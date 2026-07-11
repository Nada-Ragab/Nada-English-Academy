Nada English Academy V26.3 - Technical Cleanup

تم تنفيذ تنظيف تقني آمن دون تغيير وظائف التطبيق:
- حذف CSS الميت الخاص بالأقسام التي أزيلت من الداشبورد.
- حذف الملفات القديمة غير المستخدمة app.js و style.css من جذر المشروع.
- حذف assets/data/sentences.json لأنه غير مستخدم وكانت بياناته مكررة داخل js/app.js.
- حذف مراجع JavaScript الميتة الخاصة ببطاقة Premium Motivation.
- توحيد رقم النسخة في index.html و manifest.webmanifest.
- تحديث Service Worker وحذف الملف غير المستخدم من قائمة Cache.
- تحديث اسم الكاش لضمان وصول النسخة الجديدة للمستخدمين.

ملاحظة: إعادة هيكلة patches القديمة في js/app.js و js/storage.js مؤجلة لمرحلة مستقلة لتقليل مخاطر كسر الوظائف.
