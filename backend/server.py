from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import io
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt as pyjwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import PyPDF2

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI(title="CareerPilot AI")
api_router = APIRouter(prefix="/api")

# ---------- Models ----------
class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    degree: Optional[str] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    education: Optional[str] = None
    projects: Optional[List[str]] = None
    certificates: Optional[List[str]] = None
    target_role: Optional[str] = None

class CareerInput(BaseModel):
    skills: List[str]
    degree: str
    interests: List[str]

class SkillGapInput(BaseModel):
    current_skills: List[str]
    target_role: str

class InterviewStartInput(BaseModel):
    role: str
    interview_type: str  # 'technical' | 'hr'
    difficulty: str = "medium"

class InterviewSubmitInput(BaseModel):
    interview_id: str
    question: str
    answer: str

class JobApply(BaseModel):
    job_id: str

# ---------- Helpers ----------
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    try:
        payload = pyjwt.decode(authorization.split(" ")[1], JWT_SECRET, algorithms=[JWT_ALGO])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(401, "Invalid user")
        return user
    except pyjwt.PyJWTError:
        raise HTTPException(401, "Invalid token")

def now_iso():
    return datetime.now(timezone.utc).isoformat()

async def gemini_json(system: str, prompt: str, session: str) -> dict:
    """Call Gemini and parse JSON response."""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session,
        system_message=system,
    ).with_model("gemini", "gemini-3.1-pro-preview")
    resp = await chat.send_message(UserMessage(text=prompt))
    text = resp.strip()
    # strip markdown code fences
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
        if text.endswith("```"):
            text = text[:-3].strip()
    try:
        return json.loads(text)
    except Exception:
        # try to locate JSON object
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start:end+1])
        raise HTTPException(500, f"AI response parse error: {text[:200]}")

# ---------- Auth ----------
@api_router.post("/register")
async def register(inp: RegisterInput):
    existing = await db.users.find_one({"email": inp.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": inp.name,
        "email": inp.email,
        "password": hash_pw(inp.password),
        "phone": "",
        "degree": "",
        "interests": [],
        "skills": [],
        "education": "",
        "projects": [],
        "certificates": [],
        "target_role": "",
        "role": "student",
        "created_at": now_iso(),
        "learning_streak": 0,
        "jobs_applied": [],
    }
    await db.users.insert_one(doc)
    token = make_token(user_id)
    doc.pop("password"); doc.pop("_id", None)
    return {"token": token, "user": doc}

@api_router.post("/login")
async def login(inp: LoginInput):
    user = await db.users.find_one({"email": inp.email})
    if not user or not verify_pw(inp.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"])
    user.pop("password"); user.pop("_id", None)
    return {"token": token, "user": user}

@api_router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    return user

@api_router.put("/profile")
async def update_profile(inp: ProfileUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in inp.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated

# ---------- Resume ----------
def extract_pdf_text(content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception:
        return ""

@api_router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...), user=Depends(get_current_user)):
    content = await file.read()
    if file.filename.lower().endswith(".pdf"):
        text = extract_pdf_text(content)
    else:
        text = content.decode("utf-8", errors="ignore")
    if not text.strip():
        raise HTTPException(400, "Could not extract text from resume")

    system = "You are an expert ATS resume evaluator. Return strict JSON only."
    prompt = f"""Analyze this resume and return JSON:
{{
  "ats_score": <int 0-100>,
  "strengths": [<3-5 short strings>],
  "weaknesses": [<3-5 short strings>],
  "suggestions": [<5 actionable improvements>],
  "detected_skills": [<10-15 skills>],
  "keyword_density": <int 0-100>,
  "formatting_score": <int 0-100>,
  "impact_score": <int 0-100>
}}

RESUME:
{text[:6000]}"""
    analysis = await gemini_json(system, prompt, f"resume-{user['id']}")

    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "filename": file.filename,
        "resume_text": text[:8000],
        "ats_score": analysis.get("ats_score", 0),
        "analysis": analysis,
        "uploaded_at": now_iso(),
    }
    await db.resumes.insert_one(doc)
    doc.pop("_id", None)
    # sync detected skills into profile
    detected = analysis.get("detected_skills", [])
    if detected:
        existing_skills = user.get("skills", []) or []
        merged = list({*existing_skills, *detected})
        await db.users.update_one({"id": user["id"]}, {"$set": {"skills": merged}})
    return doc

@api_router.get("/resume/score")
async def resume_score(user=Depends(get_current_user)):
    latest = await db.resumes.find_one({"user_id": user["id"]}, sort=[("uploaded_at", -1)])
    if not latest:
        return {"ats_score": 0, "analysis": None}
    latest.pop("_id", None)
    return latest

# ---------- Career Recommendation ----------
@api_router.post("/career/recommend")
async def career_recommend(inp: CareerInput, user=Depends(get_current_user)):
    system = "You are an expert AI career counselor. Return strict JSON only."
    prompt = f"""Based on the student profile, recommend 4 career paths.
Skills: {inp.skills}
Degree: {inp.degree}
Interests: {inp.interests}

Return JSON:
{{
  "recommendations": [
    {{
      "career": "<title>",
      "match_percentage": <int 0-100>,
      "salary_range": "<e.g. $60k - $120k>",
      "required_skills": [<6 skills>],
      "why_fit": "<one sentence>",
      "roadmap": [
        {{"milestone": "<step>", "duration": "<e.g. 2 months>", "resources": [<2 items>]}}
      ]
    }}
  ]
}}
Provide 4 diverse careers, each with 4-5 roadmap steps."""
    result = await gemini_json(system, prompt, f"career-{user['id']}")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "input": inp.model_dump(),
        "result": result,
        "created_at": now_iso(),
    }
    await db.careers.insert_one(doc)
    return result

# ---------- Skill Gap ----------
@api_router.post("/skill-gap")
async def skill_gap(inp: SkillGapInput, user=Depends(get_current_user)):
    system = "You are an expert career skills analyst. Return strict JSON only."
    prompt = f"""Compare the current skills against target role requirements.
Current skills: {inp.current_skills}
Target role: {inp.target_role}

Return JSON:
{{
  "match_score": <int 0-100>,
  "existing_relevant": [<skills user has that matter>],
  "missing_critical": [<skills user must learn>],
  "missing_nice_to_have": [<optional skills>],
  "suggested_courses": [
    {{"title": "<course>", "platform": "<Coursera/Udemy/etc>", "duration": "<e.g. 4 weeks>", "level": "<beginner/intermediate/advanced>"}}
  ],
  "learning_timeline_weeks": <int>,
  "weekly_plan": [
    {{"week": <int>, "focus": "<topic>", "goal": "<measurable outcome>"}}
  ]
}}
Provide 5 courses and a 8-week weekly plan."""
    result = await gemini_json(system, prompt, f"skillgap-{user['id']}")
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "target_role": inp.target_role,
        "result": result,
        "created_at": now_iso(),
    }
    await db.skill_gaps.insert_one(doc)
    return result

# ---------- Interview ----------
@api_router.post("/interview/start")
async def interview_start(inp: InterviewStartInput, user=Depends(get_current_user)):
    system = "You generate high-quality interview questions. Return strict JSON only."
    prompt = f"""Generate 5 {inp.interview_type} interview questions for a {inp.role} at {inp.difficulty} difficulty.
Return JSON:
{{
  "questions": [
    {{"id": <int>, "question": "<question>", "expected_topics": [<3 key points>]}}
  ]
}}"""
    result = await gemini_json(system, prompt, f"iv-start-{user['id']}")
    interview_id = str(uuid.uuid4())
    doc = {
        "id": interview_id,
        "user_id": user["id"],
        "role": inp.role,
        "type": inp.interview_type,
        "difficulty": inp.difficulty,
        "questions": result.get("questions", []),
        "answers": [],
        "score": 0,
        "status": "in_progress",
        "created_at": now_iso(),
    }
    await db.interviews.insert_one(doc)
    return {"interview_id": interview_id, "questions": doc["questions"]}

@api_router.post("/interview/submit")
async def interview_submit(inp: InterviewSubmitInput, user=Depends(get_current_user)):
    system = "You are a strict but constructive interview coach. Return strict JSON only."
    prompt = f"""Evaluate this candidate answer.
Question: {inp.question}
Answer: {inp.answer}

Return JSON:
{{
  "score": <int 0-100>,
  "confidence": <int 0-100>,
  "strengths": [<2 items>],
  "improvements": [<2 items>],
  "ideal_answer_hint": "<one sentence guidance>",
  "feedback": "<2-3 sentence overall feedback>"
}}"""
    result = await gemini_json(system, prompt, f"iv-eval-{user['id']}")
    interview = await db.interviews.find_one({"id": inp.interview_id, "user_id": user["id"]})
    if not interview:
        raise HTTPException(404, "Interview not found")
    answers = interview.get("answers", [])
    answers.append({
        "question": inp.question,
        "answer": inp.answer,
        "evaluation": result,
        "at": now_iso(),
    })
    # rolling avg score
    scores = [a["evaluation"]["score"] for a in answers]
    avg = int(sum(scores) / len(scores)) if scores else 0
    await db.interviews.update_one(
        {"id": inp.interview_id},
        {"$set": {"answers": answers, "score": avg}}
    )
    return {"evaluation": result, "current_avg_score": avg, "answered": len(answers)}

@api_router.get("/interview/history")
async def interview_history(user=Depends(get_current_user)):
    items = await db.interviews.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return items

# ---------- Jobs ----------
SEED_JOBS = [
    {"company": "Google", "title": "Software Engineer, New Grad", "location": "Mountain View, CA", "salary": "$140k - $180k", "experience": "0-2 yrs", "remote": False, "description": "Build scalable systems. Skills: Python, distributed systems, algorithms."},
    {"company": "Stripe", "title": "Frontend Engineer", "location": "Remote", "salary": "$120k - $170k", "experience": "1-3 yrs", "remote": True, "description": "Craft delightful payment UIs. Skills: React, TypeScript, CSS."},
    {"company": "Airbnb", "title": "Data Analyst Intern", "location": "San Francisco, CA", "salary": "$40/hr", "experience": "0-1 yrs", "remote": False, "description": "Analyze booking patterns. Skills: SQL, Python, Tableau."},
    {"company": "Notion", "title": "Product Designer", "location": "Remote", "salary": "$110k - $150k", "experience": "2-4 yrs", "remote": True, "description": "Design workflows. Skills: Figma, prototyping, user research."},
    {"company": "OpenAI", "title": "ML Engineer", "location": "San Francisco, CA", "salary": "$200k - $300k", "experience": "3-5 yrs", "remote": False, "description": "Train LLMs. Skills: PyTorch, transformers, distributed training."},
    {"company": "Vercel", "title": "DevRel Engineer", "location": "Remote", "salary": "$130k - $170k", "experience": "2-4 yrs", "remote": True, "description": "Build community + demos. Skills: Next.js, writing, speaking."},
    {"company": "Linear", "title": "Backend Engineer", "location": "Remote", "salary": "$140k - $190k", "experience": "3-5 yrs", "remote": True, "description": "Realtime sync engine. Skills: Node.js, PostgreSQL, WebSockets."},
    {"company": "Figma", "title": "Growth PM Intern", "location": "New York, NY", "salary": "$50/hr", "experience": "0-1 yrs", "remote": False, "description": "Growth experiments. Skills: SQL, product sense, A/B testing."},
    {"company": "Anthropic", "title": "Research Engineer", "location": "San Francisco, CA", "salary": "$220k - $320k", "experience": "3-6 yrs", "remote": False, "description": "AI safety research. Skills: ML, Python, safety."},
    {"company": "Shopify", "title": "Full Stack Developer", "location": "Remote", "salary": "$110k - $160k", "experience": "1-3 yrs", "remote": True, "description": "Commerce features. Skills: Ruby, React, GraphQL."},
]

async def seed_jobs():
    count = await db.jobs.count_documents({})
    if count == 0:
        for j in SEED_JOBS:
            j2 = {**j, "id": str(uuid.uuid4()), "posted_at": now_iso()}
            await db.jobs.insert_one(j2)

@api_router.get("/jobs")
async def list_jobs(
    location: Optional[str] = None,
    remote: Optional[bool] = None,
    experience: Optional[str] = None,
    user=Depends(get_current_user),
):
    query: dict = {}
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if remote is not None:
        query["remote"] = remote
    if experience:
        query["experience"] = {"$regex": experience, "$options": "i"}
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(100)
    return jobs

@api_router.get("/recommended-jobs")
async def recommended_jobs(user=Depends(get_current_user)):
    skills = set([s.lower() for s in user.get("skills", []) or []])
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(100)
    scored = []
    for j in jobs:
        desc = j.get("description", "").lower()
        matched = [s for s in skills if s in desc]
        j["match_percentage"] = min(100, 30 + len(matched) * 15)
        j["matched_skills"] = matched
        scored.append(j)
    scored.sort(key=lambda x: x["match_percentage"], reverse=True)
    return scored[:10]

@api_router.post("/jobs/apply")
async def apply_job(inp: JobApply, user=Depends(get_current_user)):
    applied = user.get("jobs_applied", []) or []
    if inp.job_id not in applied:
        applied.append(inp.job_id)
        await db.users.update_one({"id": user["id"]}, {"$set": {"jobs_applied": applied}})
    return {"success": True, "total_applied": len(applied)}

# ---------- Dashboard / Analytics ----------
@api_router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    # latest resume
    resume = await db.resumes.find_one({"user_id": user["id"]}, sort=[("uploaded_at", -1)])
    resume_score_val = resume.get("ats_score", 0) if resume else 0

    # avg interview score
    interviews = await db.interviews.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
    if interviews:
        iv_scores = [i.get("score", 0) for i in interviews if i.get("score", 0) > 0]
        interview_score = int(sum(iv_scores) / len(iv_scores)) if iv_scores else 0
    else:
        interview_score = 0

    # profile completion
    fields = ["name", "phone", "degree", "education", "target_role"]
    list_fields = ["skills", "interests", "projects", "certificates"]
    completion = 0
    for f in fields:
        if user.get(f):
            completion += 10
    for f in list_fields:
        if user.get(f) and len(user.get(f)) > 0:
            completion += 12.5
    completion = min(100, int(completion))

    jobs_applied = len(user.get("jobs_applied", []) or [])
    skills_count = len(user.get("skills", []) or [])

    # weekly progress: use interview history over recent weeks
    weekly = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_end = now - timedelta(days=i)
        day_start = day_end - timedelta(days=1)
        day_interviews = [
            iv for iv in interviews
            if day_start.isoformat() <= iv.get("created_at", "") <= day_end.isoformat()
        ]
        avg = 0
        if day_interviews:
            s = [d.get("score", 0) for d in day_interviews]
            avg = int(sum(s) / len(s)) if s else 0
        weekly.append({
            "day": day_end.strftime("%a"),
            "interview_score": avg,
        })

    return {
        "resume_score": resume_score_val,
        "interview_score": interview_score,
        "profile_completion": completion,
        "skills_count": skills_count,
        "jobs_applied": jobs_applied,
        "learning_streak": user.get("learning_streak", 0),
        "weekly_progress": weekly,
        "recent_interviews": [
            {"role": i.get("role"), "type": i.get("type"), "score": i.get("score", 0), "date": i.get("created_at")}
            for i in interviews[:5]
        ],
    }

@api_router.get("/")
async def root():
    return {"message": "CareerPilot AI API", "version": "1.0"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await seed_jobs()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
