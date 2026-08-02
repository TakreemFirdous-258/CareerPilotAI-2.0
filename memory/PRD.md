# CareerPilot AI — PRD

## Original problem
AI-powered career guidance platform for students: ATS resume, skill gap, career recs, mock interviews, job matching, progress tracking. Theme: black + emerald green + glassmorphism.

## Stack
- Backend: FastAPI + MongoDB + JWT + Gemini 3.1 Pro (via emergentintegrations / EMERGENT_LLM_KEY)
- Frontend: React 19 + Tailwind + shadcn/ui + Recharts + Framer Motion + Sonner toasts
- Fonts: Cabinet Grotesk (headings), Manrope (body)

## Implemented (v1 — 2026-02-01)
- Auth: JWT register/login, `/api/register`, `/api/login`, `/api/profile`
- Resume: PDF/TXT upload → Gemini ATS analysis (score, strengths, weaknesses, suggestions, detected skills). Detected skills auto-merged into profile.
- Career recs: 4 careers with match %, salary, roadmap
- Skill Gap: match score, missing skills, courses, 8-week plan
- Mock Interview: technical/HR question generation + per-answer Gemini evaluation
- Jobs: 10 seeded jobs, filter by location/remote, recommendation ranking based on skills
- Dashboard: metrics (resume/interview/profile/skills/jobs) + weekly line chart + profile completion gauge
- Progress: line + bar charts + interview history
- Profile: full form (name, phone, degree, education, target role, skills, interests, projects, certificates)
- Landing page: hero + 6 features + testimonials + CTA

## User personas
- Student: main user

## Deferred (P1/P2)
- OTP email verification
- Password reset flow
- Celery background tasks / notifications
- Admin panel (manage jobs, courses, users, analytics)
- Voice-based interview answers (Whisper)
- Cloudinary/object storage for resume files (currently text stored)
