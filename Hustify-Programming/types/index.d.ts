interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  image: string;
  coverimg: string;
  phone: string;
  birthday: string;
  address: string;
  name: string;
  email: string;
  id: string;
  darkmode: boolean;
  userRole?: "normal" | "hr" | "company-admin"; // Default: "normal"
  companyId?: string; // For HR users, reference to their company
  description?: string;
  skills?: string[];
  experiences?: string[];
  education?: Array<{
    school: string;
    className: string;
    year: string;
    description?: string;
  }>;
  projects?: Array<{
    image?: string;
    title: string;
    description: string;
    link: string;
  }>;
  followingCompanies?: string[]; // IDs of companies the user follows
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  userRole?: "normal" | "hr" | "company-admin";
  companyId?: string;
}

export interface RegisterCompanyAndAdminParams {
  // User fields
  userName: string;
  userEmail: string;
  password: string;
  // Company fields
  companyName: string;
  companyIndustry?: string;
  companyDescription?: string;
}


type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

type Company = {
  id: string;
  name: string;
  logo?: string;
  coverimg?: string;
  description: string;
  website?: string;
  industry?: string;
  gallery?: string[];
  followerCount?: number;
  followers?: string[]; // Array of user IDs
  createdAt?: string;
  updatedAt?: string;
  leaders?: Array<{
    image?: string;
    name: string;
    major: string;
    description?: string;
  }>;
  spotlightJobs?: Job[];
  fields?: string[];
  hrMembers?: string[]; // Array of user IDs for HR members
};

type Applicant = {
  userId: string;
  appliedAt: string;
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "offered";
  // Application form data
  fullName?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
  resumeUrl?: string;
  cvLink?: string;
  answers?: Array<{ question: string; answer: string }>;
  attachments?: Array<{ name: string; url: string }>;
  // HR review fields
  rating?: number; // HR can rate applicants (0-5)
  notes?: string; // HR notes about applicant
  updatedAt?: string;
};

type Job = {
  id: string;
  title: string;
  location: string;
  company: Company;
  logoUrl?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  postedDate: string;
  applicants?: Applicant[];
  applicantCount: number;
  recruitmentUrl?: string;
  postedBy?: string; // User ID of HR who posted
  companyId?: string; // Company ID
  status?: "draft" | "published" | "closed"; // Job status
  jobType?: "full-time" | "part-time" | "remote";
  viewCount?: number; // Number of views
  createdAt?: string;
  updatedAt?: string;
};

interface JobDescriptionProps {
  job: Job | null | undefined;
}

interface CreateJobBasedInterviewParams {
  jobId: string;
  role: string;
  company: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

interface GenerateJobBasedQuestionsParams {
  role: string;
  company: string;
  description: string;
  responsibilities: string;
  requirements: string;
}

interface RoadmapNode {
  name: string;
  content: string;
  links?: string;
}

interface Roadmap {
  name: string;
  tips: string[];
  nodes: RoadmapNode[];
}

interface RoadmapRole {
  id: string;
  name: string;
  tips: string[];
  nodes: RoadmapNode[];
}

// HR-specific types
export interface CreateJobParams {
  title: string;
  location: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  recruitmentUrl?: string;
  status?: "draft" | "published";
  jobType?: "full-time" | "part-time" | "remote";
}

export interface UpdateJobParams extends Partial<CreateJobParams> {
  id: string;
}

export interface CreateCompanyParams {
  name: string;
  description: string;
  logo?: string;
  coverimg?: string;
  fields?: string[];
}

export interface Notification {
  id: string;
  userId: string; // The ID of the user who receives the notification
  message: string;
  link: string; // Link to the relevant page (e.g., a job posting)
  isRead: boolean;
  createdAt: string;
}

export interface UpdateCompanyParams {
  name?: string;
  description?: string;
  logo?: string;
  coverimg?: string;
  website?: string;
  industry?: string;
  gallery?: string[];
  fields?: string[];
}

export interface JobMetrics {
  totalJobsPosted: number;
  totalApplicants: number;
  openPositions: number;
  pendingApplications: number;
  averageApplicantsPerJob: number;
}

export interface ApplicantMetrics {
  totalApplicants: number;
  pendingCount: number;
  reviewingCount: number;
  interviewedCount: number;
  rejectedCount: number;
  offeredCount: number;
}
