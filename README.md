# 🚀 CareerPilot AI

> An AI-powered career guidance platform that helps students and job seekers analyze resumes, identify skill gaps, receive personalized career recommendations, practice mock interviews, and discover relevant job opportunities—all in one place.

---

## 📌 Overview

CareerPilot AI is a full-stack web application designed to simplify career planning using Artificial Intelligence. The platform combines resume analysis, career recommendations, interview preparation, and job matching to help users improve their employability.

The application provides an interactive dashboard where users can upload their resumes, receive AI-driven insights, identify missing skills, practice interview questions, and track their career progress.

---

## ✨ Features

### 📄 AI Resume Analyzer
- Upload PDF resumes
- ATS score analysis
- Resume strengths & weaknesses
- Keyword optimization suggestions
- Resume improvement recommendations

### 🎯 Career Recommendation
- Personalized career paths
- Match percentage for each career
- Salary insights
- Required skills
- Step-by-step learning roadmap

### 📈 Skill Gap Analysis
- Compare existing skills with target role
- Identify missing technical skills
- Recommended courses
- Weekly learning plan
- Career readiness score

### 🎤 AI Mock Interview
- Technical interview practice
- HR interview preparation
- AI-generated interview questions
- Performance evaluation
- Feedback & improvement suggestions

### 💼 Job Recommendation
- Personalized job listings
- Skill-based matching
- Match percentage
- Remote & onsite opportunities
- Job application tracking

### 📊 Career Dashboard
- Resume score
- Interview performance
- Profile completion
- Learning streak
- Weekly progress analytics

### 🔐 Authentication
- Secure Login & Registration
- JWT Authentication
- User Profile Management

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- Tailwind CSS
- React Router

### Backend
- FastAPI
- Python

### Database
- MongoDB Atlas

### AI
- Google Gemini API

### Authentication
- JWT Authentication

### Deployment
- GitHub
- Vercel / Render (Recommended)

---

## 📂 Project Structure

```text
CareerPilot-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/CareerPilot-AI.git
cd CareerPilot-AI
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

python -m uvicorn server:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=careerpilot
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=*
```

---

## 📸 Application Modules

- Authentication
- User Dashboard
- Resume Analyzer
- Career Recommendation
- Skill Gap Analyzer
- AI Interview
- Job Recommendation
- Profile Management

---

## 🎯 Future Improvements

- Voice-based AI Interview
- Resume Builder
- Cover Letter Generator
- Company-specific Interview Preparation
- AI Career Chatbot
- Resume Version History
- Email Notifications
- Learning Progress Tracking

---

## 📖 Learning Outcomes

This project helped strengthen knowledge in:

- Full Stack Development
- REST API Development
- FastAPI
- React.js
- MongoDB
- JWT Authentication
- Google Gemini API Integration
- AI-powered Recommendation Systems
- Resume Analysis
- Prompt Engineering

---

## 👨‍💻 Author

**Pattan Takreem Firdoz**

B.Tech Artificial Intelligence and Machine Learning

Passionate about AI, Full Stack Development, and building intelligent applications that solve real-world problems.

GitHub:
https://github.com/TakreemFirdous-258

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub. Your support helps motivate further development and improvements.
