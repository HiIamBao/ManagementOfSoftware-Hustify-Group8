# Hustify – AI-Powered Career Preparation Platform

Hustify is a voice-enabled AI platform that helps job seekers practice interviews, receive actionable feedback, and follow personalized learning roadmaps. It combines real-time voice conversations (Vapi), AI analysis (Gemini), and a modern web app (Next.js + Firebase).

---

## Project Objectives
- Provide realistic, voice-based mock interviews with an AI interviewer.
- Generate job- and role-specific questions (technical, behavioral, mixed).
- Deliver structured feedback with scores and clear improvement guidance.
- Create personalized learning roadmaps based on interview results.
- Support job exploration, profiles, and light social features to accelerate growth.

---

## Team Members & Assigned Roles

| Name | Student ID | Role | Email |
|------|------------|------|-------|
| Nguyễn Hữu Hoàng Hải Anh | 20226010 | Software Engineer | Anh.NHHH226010@sis.hust.edu.vn |
| Hoàng Bá Bảo | 20226015 | Software Engineer | bao.hb226015@sis.hust.edu.vn |
| Đinh Ngọc Cầm | 20226016 | Software Engineer | cam.dn226016@sis.hust.edu.vn |
| Nguyễn Đình An | 20226007 | Software Engineer | an.nd226007@sis.hust.edu.vn |
| Trần Việt Anh | 20226012 | Software Engineer | anh.tv226012@sis.hust.edu.vn |
| Trần Quang Hưng | 20226045 | Software Engineer | hung.tq226045@sis.hust.edu.vn |
| Tưởng Phi Tuấn | 20226069 | Software Engineer | tuan.tp226069@sis.hust.edu.vn |
| Nguyễn Hữu Hoàng | 20225972 | Software Engineer | hoang.nh225972@sis.hust.edu.vn |
| Đinh Nguyễn Sơn | 20225997 | Software Engineer | son.dn225997@sis.hust.edu.vn |
| Lê Đại Lâm | 20225982 | Software Engineer | lam.ld225982@sis.hust.edu.vn |
| Vũ Hải Đăng | 20225962 | Software Engineer | dang.vh225962@sis.hust.edu.vn |
| Nguyễn Minh Khôi | 20226050 | Software Engineer | khoi.nm226050@sis.hust.edu.vn |
| Nguyễn Lê Quý Dương | 20210242 | Software Engineer | duong.nlq210242@sis.hust.edu.vn |


---

## Installation & Usage Guide

### Prerequisites
- Node.js 18+ and npm
- Git
- Firebase project (Auth + Firestore)
- Vapi account (Web token + Workflow ID)
- Google Gemini API key

### 1) Clone and install
```bash
git clone <repo-url>
cd Hustify_Programming
npm install
```

### 2) Configure environment
Create a `.env.local` file in the repository root:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Vapi (Voice)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id

# Gemini (Feedback/analysis)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Base URL (used by workflows)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3) Run locally
```bash
npm run dev
# open http://localhost:3000
```
Optionally seed local data (if needed):
```bash
npm run seed
```

### 4) Build for production
```bash
npm run build
npm start
```

### 5) Usage
1. Sign up / sign in.
2. Start an interview:
   - Generate questions by role, type, level, and tech stack; or
   - Create a practice from a job description.
3. Click Call to begin the voice interview (allow microphone access).
4. End the call to save the transcript and generate feedback.
5. Review feedback (scores, strengths, improvements) and generate a learning roadmap.
