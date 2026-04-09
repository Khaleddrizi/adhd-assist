# Phase 4 — User System & Web API

## What was added

- **Database:** `specialists`, `parents`, `patients`, `training_programs`
- **API:** `web_api.py` on port 5004 for the Next.js frontend
- **Alexa:** `LinkPatientIntent` to link a child to their profile via code

---

## Run migration (once)

```bash
python scripts/migrate_phase4.py
```

---

## Web API endpoints

Base URL: `http://localhost:5004/api/`

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | `{ email, password, role: "specialist"\|"parent", full_name? }` | Create account |
| POST | `/auth/login` | `{ email, password, role }` | Login, returns `{ id, email, full_name, role }` |

### Specialist (header: `X-Specialist-Id`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/specialists/patients` | List patients with stats |
| POST | `/specialists/patients` | Create patient `{ name, age?, diagnostic?, parent_email? }` |
| GET | `/specialists/patients/:id` | Patient details + stats |
| GET | `/specialists/patients/:id/sessions` | Patient quiz sessions |

### Parent (header: `X-Parent-Id`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/parents/children` | List children with stats |
| GET | `/parents/children/:id` | Child details + stats |
| GET | `/parents/children/:id/sessions` | Child quiz sessions |

---

## Alexa: Link patient

Add in Alexa Developer Console → Build → Intents:

**Intent:** `LinkPatientIntent`  
**Utterances:** `link {code}`, `link my code {code}`, `my code is {code}`  
**Slot:** `code` — type AMAZON.SearchQuery or AMAZON.AlphaNumeric

Flow: Specialist creates patient → gets `alexa_code` (e.g. `A1B2C3D4`) → child says "link A1B2C3D4" in Alexa → sessions are attributed to that patient.

---

## Next.js integration

1. Run backend: `python run.py` (Alexa 5002, Dashboard 5003, Web API 5004)
2. Run frontend: `cd frontend && npm run dev`
3. Login at `/login` → selects role (Orthophoniste / Parent) → redirects to `/orthophoniste` or `/dashboard`
4. API client (`lib/api.ts`) adds `X-Specialist-Id` or `X-Parent-Id` from stored user
