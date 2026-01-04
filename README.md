# Hustify – AI-Powered Career Preparation Platform

Hustify is a voice-enabled AI platform that helps job seekers practice interviews, receive actionable feedback, and follow personalized learning roadmaps. It combines real-time voice conversations (Vapi), AI analysis (Gemini), and a modern web app (Next.js + Firebase).

---

## Tech Stack Overview

### Frontend
- **Framework**: Next.js 15.2.8 with React 18.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with `tailwindcss-animate`
- **UI Components**: Radix UI (Avatar, Dialog, Dropdown Menu, Select, Tabs, etc.)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Themes**: next-themes (Dark mode support)

### AI & Voice Technology
- **Voice AI**: Vapi AI (@vapi-ai/web) - Real-time voice conversation
- **AI Analysis**: Google Gemini (@ai-sdk/google) - Feedback generation and analysis
- **AI SDK**: Vercel AI SDK - AI integration framework

### Backend & Database
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Server Actions**: Next.js Server Actions
- **Admin SDK**: Firebase Admin

### Data Pipeline & Job Crawler
- **Workflow Orchestration**: Apache Airflow 2.8.1
- **Message Queue**: Redis, Kafka (Confluent)
- **Database**: PostgreSQL 13
- **Object Storage**: MinIO
- **Container**: Docker & Docker Compose
- **Web Scraping**: BeautifulSoup4, lxml, requests
- **Data Processing**: Pandas, Python

### DevOps & Tools
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js)
- **Linting**: ESLint
- **Version Control**: Git
- **Deployment**: Vercel (Frontend), Docker (Backend services)

---

## Main Features

### 🎤 AI-Powered Voice Interviews
- **Real-time Voice Conversations**: Conduct mock interviews with an AI interviewer using Vapi technology
- **Customizable Question Generation**: Create interview questions based on:
  - Job role and position
  - Technical or behavioral focus
  - Difficulty level
  - Specific tech stack requirements
- **Job Description Integration**: Generate practice interviews from actual job descriptions
- **Live Transcript**: Real-time conversation recording and transcription

### 📊 Intelligent Feedback & Analysis
- **AI-Powered Feedback**: Comprehensive evaluation powered by Google Gemini
- **Performance Scoring**: Detailed scoring across multiple dimensions
- **Strengths & Weaknesses**: Clear identification of areas of excellence and improvement
- **Actionable Insights**: Specific recommendations for skill development

### 🗺️ Personalized Learning Roadmaps
- **AI-Generated Roadmaps**: Customized learning paths based on interview performance
- **Visual Progress Tracking**: Interactive Mermaid charts showing learning progression
- **Skill Gap Analysis**: Identification of knowledge gaps and required skills
- **Resource Recommendations**: Curated learning materials and resources

### 💼 Job Search & Exploration
- **Job Discovery**: Browse and search through job opportunities
- **Job Recommendations**: AI-powered job matching based on profile and skills
- **External Job Integration**: Aggregated job listings from multiple sources via data pipeline
- **Job Details**: Comprehensive job descriptions, requirements, and company information
- **Application Tracking**: Apply to jobs and track application status

### 📄 CV Analysis & Comparison
- **CV Scanning**: Upload and parse resumes in PDF format
- **Smart Matching**: Compare CV against job requirements
- **Gap Analysis**: Identify missing skills and qualifications
- **Improvement Suggestions**: Recommendations for CV enhancement

### 🏢 HR Recruitment Management
- **Company Registration**: Create and manage company profiles
- **Job Posting Management**: Create, edit, publish, and close job positions
- **Applicant Tracking System (ATS)**: Track candidates through the hiring pipeline
- **Candidate Evaluation**: Rate applicants, add notes, and manage interview stages
- **Recruitment Analytics**: Dashboard with hiring metrics and conversion funnels
- **Status Workflows**: Manage applicant status (Pending → Reviewing → Interviewed → Offered/Rejected)

### 👥 Social Networking
- **Professional Network**: Connect with other job seekers and professionals
- **Community Features**: Share experiences and insights
- **Profile Management**: Maintain professional profile with skills and experience

### 📈 Analytics & Insights
- **Interview History**: Track all practice sessions and progress over time
- **Performance Trends**: Visualize improvement across multiple interviews
- **Skill Development**: Monitor growth in specific skill areas
- **HR Dashboard**: Recruitment metrics, job performance, and candidate analytics

### 🎨 User Experience
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Dark Mode**: Full dark mode support for comfortable viewing
- **Intuitive Navigation**: User-friendly interface with clear information architecture
- **Real-time Updates**: Live notifications and status updates
- **Form Validation**: Smart input validation with clear error messages

---

## Team Workflow & Methodology

### Extended Scrum Framework

Our team follows an **Extended Scrum** methodology, which adapts traditional Scrum practices to accommodate our academic project timeline and team structure:

#### Team Structure
- **Team Size**: 13 Software Engineers
- **Organization**: Cross-functional team with shared responsibilities
- **Collaboration**: Distributed workload across frontend, backend, data pipeline, and documentation

#### Sprint Organization
- **Sprint Duration**: 2-week iterations
- **Sprint Planning**: Collaborative planning sessions to define sprint goals and task breakdown
- **Daily Standups**: Regular sync meetings (adapted to academic schedules)
- **Sprint Review**: Demo of completed features to stakeholders
- **Sprint Retrospective**: Team reflection and process improvement discussions

#### Extended Scrum Practices
1. **Flexible Role Assignment**: Team members work across different areas based on project needs rather than fixed roles
2. **Documentation-Driven Development**: Comprehensive documentation created alongside code
3. **Continuous Integration**: Regular code commits and integration to maintain system cohesion
4. **Iterative Feature Development**: Features built incrementally with regular feedback loops
5. **Academic Milestones**: Sprints aligned with academic deadlines and course requirements

#### Development Workflow
1. **Planning**: Define user stories and technical requirements
2. **Design**: Create architectural and detailed designs before implementation
3. **Implementation**: Develop features following established patterns and conventions
4. **Testing**: Manual testing and validation of features
5. **Review**: Code review and feedback from team members
6. **Documentation**: Maintain up-to-date README files and technical documentation
7. **Integration**: Merge completed features into main branch
8. **Deployment**: Deploy to staging/production environments

#### Communication & Collaboration Tools
- **Version Control**: Git with GitHub for code collaboration
- **Task Tracking**: GitHub Issues/Projects for task management
- **Documentation**: Markdown files for technical documentation
- **Code Review**: Pull requests with peer review process
- **Knowledge Sharing**: Team documentation and code comments

#### Quality Assurance
- **Code Standards**: Follow consistent coding conventions across the team
- **Peer Review**: All code changes reviewed by team members
- **Feature Testing**: Manual testing of features before deployment
- **Security Review**: Security considerations in code and architecture
- **Documentation Review**: Ensure documentation accuracy and completeness

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
cd Hustify-Programming
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
