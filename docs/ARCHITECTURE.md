# بنية المشروع

## هيكل الملفات

```
Alexa_AI_Project/
├── run.py              ← نقطة الدخول لتشغيل السيرفر
├── config.py           ← كل الإعدادات والمسارات
├── pdf_utils.py        ← استخراج نص PDF + تقسيمه
├── embeddings_utils.py ← نموذج التضمين + FAISS
├── quiz_logic.py       ← كل منطق الأسئلة والاختبارات
├── api.py              ← Flask + مسارات Alexa و Dashboard
├── scripts/
│   ├── build_rag.py              ← بناء RAG من PDF
│   └── build_question_cache.py   ← بناء كاش الأسئلة
├── data/               ← ملفات FAISS والكاش
├── requirements.txt
└── .env.example
```

## تدفق العمل

1. **run.py** → يُحمّل `.env`، ينشئ التطبيق من **api.py**، يشغّل Flask.
2. **api.py** → يقرأ الكاش، ينشئ QuizService و StatsService، يربط المسارات.
3. عند طلب Alexa **StartQuizIntent** → QuizService.start_quiz() → يختار سؤال ويرجع النص.
4. عند **AnswerIntent** → يقيّم، يحدّث الإحصائيات، يختار السؤال التالي.

## مهام كل ملف

| الملف | المهمة |
|-------|--------|
| config.py | مسارات، مفاتيح API، إعدادات الاختبار |
| pdf_utils.py | extract_text_from_pdf(), chunk_text() |
| embeddings_utils.py | EmbeddingModel، FaissStore (بناء/تحميل/بحث) |
| quiz_logic.py | QuizGenerator، QuizSelector، QuestionCache، SessionStore، QuizService، StatsService |
| api.py | Flask، /alexa_quiz، /dashboard، /test |
