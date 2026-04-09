# Alexa AI Quiz — مشروع مبسّط

مهارة Alexa لتقييم تعليمي بالصوت، مع استخراج أسئلة من PDF بالذكاء الاصطناعي.

## هيكل المشروع

```
Alexa_AI_Project/
├── backend/                    # الباك اند (Python)
│   ├── api/                    # Controllers (Alexa, Dashboard, Web API)
│   ├── core/                   # Business logic (quiz_logic, pdf, embeddings)
│   ├── database/               # Models + Repositories
│   ├── scripts/                # سكربتات التحضير والتشغيل
│   │   ├── build_rag.py
│   │   ├── build_question_cache.py
│   │   ├── import_cache_to_db.py
│   │   ├── migrate_phase4.py
│   │   ├── run_all.py          # يشغّل Alexa + Dashboard + Web API
│   │   └── run_ngrok.py
│   ├── data/                   # question_cache.json, quiz_index.faiss, etc.
│   ├── config.py
│   └── requirements.txt
├── frontend/                   # Next.js (من WebSite/web-platform-for-kids)
├── docs/                       # WORKFLOW_PHASE4, SETUP_WINDOWS, ARCHITECTURE
├── run.py                      # تشغيل (يستدعي backend.scripts.run_all)
└── .env
```

## التثبيت

```bash
cd Alexa_AI_Project
python3 -m venv venv
source venv/bin/activate   # أو venv\Scripts\activate على Windows
pip install -r requirements.txt
cp backend/.env.example backend/.env
# أضف GROQ_API_KEY و DATABASE_URL في backend/.env
```

**ملاحظة:** إذا ظهر خطأ "flask could not be resolved" في Cursor، فعّل البيئة الافتراضية واختر المفسّر: `Ctrl+Shift+P` → "Python: Select Interpreter" → اختر `./venv/bin/python`

## الاستخدام
1. `cp ~/Downloads/adhd.pdf backend/data/sample.pdf`
2. **بناء RAG:** `python -m backend.scripts.build_rag backend/data/sample.pdf`
3. **بناء الكاش:** `python -m backend.scripts.build_question_cache 20`
4. **استيراد للـ DB:** `python -m backend.scripts.import_cache_to_db`
5. **Phase 4 (مرة واحدة):** `python -m backend.scripts.migrate_phase4`
6. **تشغيل السيرفر:** `python run.py`

- Alexa: `http://localhost:5002/alexa_quiz`
- Dashboard: `http://localhost:5003/dashboard`
- Web API: `http://localhost:5004/api/`
