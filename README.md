# Hustify – AI-Powered Career Preparation Platform

Hustify is a voice-enabled AI platform that helps job seekers practice interviews, receive actionable feedback, and follow personalized learning roadmaps. It combines real-time voice conversations (Vapi), AI analysis (Gemini), and a modern web app (Next.js + Firebase).

---

## 🌿 Branch: `feat/company-profile-job-notification`

### Nhiệm vụ chính
Branch này được phát triển bởi **Đinh Nguyễn Sơn** (20225997) với các tính năng:

1. **Follow/Unfollow Company**: Cho phép user follow/unfollow công ty để theo dõi tin tuyển dụng
2. **Notification System**: Khi HR đăng job mới, tự động gửi thông báo đến tất cả followers
3. **Email Notification**: Ngoài thông báo trong web, còn gửi email thông báo đến Gmail của người dùng

### Các file đã tạo/sửa

| File | Mô tả |
|------|-------|
| `lib/services/email.service.ts` | **[NEW]** Email service sử dụng Resend API để gửi email thông báo |
| `lib/actions/hr-jobs.action.ts` | **[MODIFIED]** Tích hợp gửi email notification khi HR publish job mới |
| `app/api/email/test/route.ts` | **[NEW]** API endpoint để test chức năng gửi email |
| `.env.local` | **[MODIFIED]** Thêm `RESEND_API_KEY` |

### Cách hoạt động

```
User follow Company → Company lưu userId vào followers[]
        ↓
HR publish Job mới
        ↓
System tạo in-app notifications (Firestore)
        ↓
System gửi email notifications (Resend) → Gmail của followers
```

### Exception Handling
- ✅ Email format không hợp lệ → Skip và log warning
- ✅ Email không tồn tại → Resend trả error, log và tiếp tục gửi cho người khác
- ✅ Rate limit → Batch gửi với delay giữa các batch
- ✅ Không block main flow → Sử dụng fire-and-forget pattern

### Cấu hình Email Service

Thêm vào `.env.local`:
```env
RESEND_API_KEY=your_resend_api_key
```

Để gửi email đến bất kỳ địa chỉ nào, cần verify domain tại https://resend.com/domains

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
| **Đinh Nguyễn Sơn** | **20225997** | **Software Engineer** | **son.dn225997@sis.hust.edu.vn** |
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
- Resend API key (for email notifications)

### 1) Clone and install
```bash
git clone <repo-url>
cd Hustify-Programming
npm install
```

### 2) Configure environment
Create a `.env.local` file in the `Hustify-Programming` directory:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Vapi (Voice)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id

# Gemini (Feedback/analysis)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Resend (Email notifications)
RESEND_API_KEY=your_resend_api_key

# Base URL (used by workflows)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3) Run locally
```bash
npm run dev
# open http://localhost:3000
```

### 4) Test Email Notification (Development)
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com", "name": "Your Name"}'
```

### 5) Build for production
```bash
npm run build
npm start
```

### 6) Usage
1. Sign up / sign in.
2. **Follow companies** you're interested in.
3. When HR publishes a new job:
   - You'll receive an **in-app notification**.
   - You'll receive an **email notification** to your registered email.
4. Start an interview:
   - Generate questions by role, type, level, and tech stack; or
   - Create a practice from a job description.
5. Click Call to begin the voice interview (allow microphone access).
6. End the call to save the transcript and generate feedback.
7. Review feedback (scores, strengths, improvements) and generate a learning roadmap.
