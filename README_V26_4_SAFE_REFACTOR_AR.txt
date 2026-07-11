Nada English Academy V26.4 - Safe Refactor

تم تنفيذ إعادة هيكلة آمنة للجزء الأساسي من التطبيق بدون تغيير تجربة الاستخدام:

- دمج تتبع الجمل المتقنة والمراجعة مباشرة داخل markKnown و markReview.
- إزالة طبقات التغليف القديمة v2001OldMarkKnown و v2001OldMarkReview.
- دمج تحديث الداشبورد وملخص التعلم داخل updateStats بدل patch لاحق.
- دمج فتح المفضلة داخل openScreen وإزالة override قديم.
- إعادة تسمية وظائف نشاط التعلم بأسماء واضحة وقابلة للصيانة.
- الإبقاء على مفتاح التخزين القديم لضمان عدم فقدان النشاط السابق.
- حذف منطق weeklyTimeline الميت بعد حذف اللوحة من الواجهة.
- توحيد رقم النسخة إلى V26.4 وتحديث Service Worker cache.

الملفات المعدلة:
- js/app.js
- js/storage.js
- index.html
- manifest.webmanifest
- sw.js
