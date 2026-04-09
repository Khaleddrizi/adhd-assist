# Setup Guide — Windows

## What you need before starting
- Python 3.11+ → https://www.python.org/downloads/ (check "Add to PATH")
- PostgreSQL 16  → https://www.postgresql.org/download/windows/
- Groq API Key  → https://console.groq.com (free account)
- ngrok account → https://ngrok.com (free account)

---

## Step 1 — Extract and open the project

Extract `Alexa_AI_Project.zip` to your Desktop.
Open **Command Prompt** (cmd) or **PowerShell** in that folder:
```
cd %USERPROFILE%\Desktop\Alexa_AI_Project
```

---

## Step 2 — Create virtual environment

```cmd
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

You should see `(venv)` at the start of the line.

---

## Step 3 — Set up PostgreSQL

During PostgreSQL installation, remember the password you set for the `postgres` user.

Then open **pgAdmin** (installed with PostgreSQL) OR use **psql** from the Start Menu:

```sql
CREATE USER quiz_user WITH PASSWORD 'quiz_pass';
CREATE DATABASE quiz_db OWNER quiz_user;
GRANT ALL PRIVILEGES ON DATABASE quiz_db TO quiz_user;
```

Test the connection:
```cmd
set PGPASSWORD=quiz_pass
psql -U quiz_user -h localhost -d quiz_db -c "SELECT 'OK';"
```

---

## Step 4 — Configure .env

Copy the example file:
```cmd
copy .env.example .env
```

Open `.env` in Notepad and fill in your keys:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxx
NGROK_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://quiz_user:quiz_pass@localhost:5432/quiz_db
```

**Where to get the keys:**
- `GROQ_API_KEY` → https://console.groq.com → API Keys → Create
- `NGROK_AUTH_TOKEN` → https://dashboard.ngrok.com/get-started/your-authtoken

---

## Step 5 — Build RAG index from PDF

```cmd
python scripts\build_rag.py data\sample.pdf
```

Expected output:
```
1. Extracting text from PDF...
2. Chunking text...
3. Building FAISS index...
   Saved to ...\data
```

---

## Step 6 — Generate questions

```cmd
python scripts\build_question_cache.py 20
```

This generates 20 questions using the Groq API. Wait for it to finish.

---

## Step 7 — Import questions to PostgreSQL

```cmd
python scripts\import_cache_to_db.py
```

Expected output:
```
Found 20 question(s) in the cache.
Database ready.
Done: 20 new question(s) imported to DB.
```

---

## Step 8 — Run the project

Open **two** Command Prompt windows, both with `venv\Scripts\activate`.

**Window 1 — Main server:**
```cmd
python run.py
```

Expected:
```
Initializing database...
Dashboard  → http://0.0.0.0:5003/dashboard
Alexa API  → http://0.0.0.0:5002/alexa_quiz
```

**Window 2 — ngrok tunnel:**
```cmd
python scripts\run_ngrok.py
```

Copy the URL that looks like:
```
Alexa endpoint → https://abc123.ngrok-free.app/alexa_quiz
```

---

## Step 9 — Connect to Amazon Alexa

1. Go to https://developer.amazon.com/alexa/console/ask
2. Open your Skill → **Build → Endpoint**
3. Paste the ngrok URL in **Default Region**
4. Click **Save Endpoints**

---

## Step 10 — Test

**Dashboard** (open in browser):
```
http://localhost:5003/dashboard
```

**Alexa** (in the Alexa Developer Console → Test tab):
```
"open book quiz"
"give me a quiz"
"a" or "b" or "c"
"end quiz"
```

---

## Common issues on Windows

| Error | Fix |
|-------|-----|
| `python not found` | Reinstall Python and check "Add to PATH" |
| `pip not found` | Use `python -m pip install -r requirements.txt` |
| `psycopg2 error` | Make sure PostgreSQL is running (check Services) |
| `venv\Scripts\activate` not working in PowerShell | Run: `Set-ExecutionPolicy RemoteSigned` |
| Port 5002 already in use | Change `FLASK_PORT=5002` in `.env` to another port |
