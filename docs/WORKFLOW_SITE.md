# Site Workflow — ADHD Assist

## A. Central Home Page (`/`)

- **Role:** Landing page + unique entry point for Doctors and Parents
- **Navigation:**
  - "Login" — for everyone
  - "Join as a Doctor" — for new doctors only
- **Redirection after login:**
  - Doctor → clinical dashboard (orthophoniste)
  - Parent → child progress view (parent dashboard)

---

## B. Doctor Portal (Orthophoniste Workspace)

| Feature | Description |
|--------|-------------|
| **Main Dashboard** | Overview of all patients + **Attention Alerts** (red flags for low scores) |
| **Patient Management** | Table of all children under their care |
| **Add Patient Page** | Form to register a child **and** create a parent account in one step |
| **Clinical Analytics** | Charts per child: **Latency** (response time) + **Accuracy** trends |
| **Library** | Upload PDFs and assign them to specific children for Alexa use |

---

## C. Parent Portal

| Feature | Description |
|--------|-------------|
| **Home Page** | "How is my child doing today?" summary |
| **Progress Tracker** | Charts: stars earned, daily streaks |
| **Reward System** | Set goals (e.g. "Answer 50 questions to get a toy") |

---

## D. Alexa Integration (The Bridge)

1. **Child identification:** Alexa identifies the child (unique code or account linking)
2. **PDF assignment:** Alexa fetches the PDF assigned by the Doctor to that child
3. **Interaction logging:** Alexa logs each interaction, especially **time between question and answer** (latency)

---

## Summary: What Exists vs. What's Needed

| Component | Current State | Needed |
|-----------|---------------|--------|
| Home (/) | Has Login + Register | Add "Join as a Doctor" link; unify roles (Doctor = Admin) |
| Doctor Dashboard | Basic dashboard | Add Attention Alerts, Patient table, Analytics (Latency + Accuracy) |
| Add Patient | Modal form | Full page; create parent account at the same time |
| Clinical Analytics | Basic stats | Per-child Latency + Accuracy charts |
| Library | — | Upload PDFs, assign to children |
| Parent Home | Basic dashboard | "How is my child doing today?" summary |
| Progress Tracker | Basic list | Stars, daily streaks |
| Reward System | — | Set goals (e.g. 50 questions → toy) |
| Alexa | Quiz + sessions | Store latency (question→answer time); fetch PDF per child |
