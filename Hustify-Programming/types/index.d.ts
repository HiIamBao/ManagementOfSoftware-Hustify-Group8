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
  followers: number;
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
};

type Applicant = {
  userId: string;
  appliedAt: string;
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "offered";
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
