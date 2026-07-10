Nada English Academy V21.0

الميزات الجديدة:
1) AI Teacher
- محادثة كتابية حقيقية عبر AI Endpoint متوافق مع صيغة OpenAI.
- تصحيح الجملة، شرح مختصر بالعربية، وسؤال متابعة.
- أوضاع: عام، عمل، Odoo/ERP، ومقابلة عمل.

2) محادثة صوتية
- التعرف على صوت المتعلمة من Chrome أو Edge.
- إرسال الكلام للمدرس الذكي.
- قراءة رد المدرس بصوت إنجليزي ثم فتح الميكروفون للجولة التالية.

3) تسجيل الدخول ومزامنة Firebase
- تسجيل حساب بالبريد وكلمة المرور.
- رفع التقدم والموضوعات والمفضلة إلى Firestore.
- تحميل نفس البيانات على الكمبيوتر أو الموبايل.
- مزامنة تلقائية اختيارية.

إعداد Firebase:
- أنشئي Firebase Project.
- فعّلي Authentication > Email/Password.
- أنشئي Firestore Database.
- أضيفي Web App وانسخي firebaseConfig بصيغة JSON داخل شاشة الحساب والمزامنة.
- قواعد Firestore المقترحة:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

إعداد AI Teacher:
- أدخلي رابط خادم آمن يستقبل POST بالشكل:
  { "messages": [...], "model": "gpt-4o-mini" }
- ويرجع أحد الحقول: reply أو message أو output_text أو choices[0].message.content.
- لا تضعي مفتاح خدمة AI السري داخل نسخة منشورة للعامة؛ الأفضل تمريره عبر Backend آمن.
