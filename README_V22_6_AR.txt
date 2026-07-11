Nada English Academy V22.6

الملفات المعدلة:
- js/cloud-ai.js
- index.html

الإصلاحات:
- استخدام Firebase AI Logic Structured Output عبر Schema.object.
- ضمان الحقول: englishReply, arabicTranslation, correction, explanationArabic, nextQuestion.
- حذف Regex الذي كان يقطع رد Gemini.
- إضافة معالجة احتياطية إذا عاد رد نصي غير متوقع.
- إضافة cache-busting لملف cloud-ai.js.
