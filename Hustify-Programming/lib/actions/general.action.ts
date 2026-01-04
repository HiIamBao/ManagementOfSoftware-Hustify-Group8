"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { generateJobBasedQuestions, getRandomInterviewCover } from "../utils";
import { getCurrentUser } from "./auth.action";
import {
  CreateJobBasedInterviewParams,
  CreateFeedbackParams,
  Interview,
  GetFeedbackByInterviewIdParams,
  Feedback,
  GetLatestInterviewsParams,
  Job,
  Company,
  Applicant,
  User,
} from "@/types";

// Helper function to extract tech stack from text
function extractTechStack(text: string): string[] {
  const commonTechnologies = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Python",
    "Django",
    "Flask",
    "Java",
    "Spring",
    "C#",
    ".NET",
    "PHP",
    "Laravel",
    "Ruby",
    "Rails",
    "Go",
    "Rust",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "GraphQL",
    "REST",
    "HTML",
    "CSS",
    "Sass",
    "Less",
    "TailwindCSS",
    "Bootstrap",
    "Material UI",
    "Firebase",
    "Supabase",
  ];

  const techStack: string[] = [];

  commonTechnologies.forEach((tech) => {
    // Case insensitive search
    const regex = new RegExp(`\\b${tech.replace(".", "\\.")}\\b`, "i");
    if (regex.test(text)) {
      techStack.push(tech);
    }
  });

  return techStack;
}

export async function createJobBasedInterview(
  params: CreateJobBasedInterviewParams
) {
  try {
    const {
      jobId,
      role,
      company,
      description,
      responsibilities,
      requirements,
    } = params;

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    // Extract tech stack from requirements (if available)
    const techstack = extractTechStack(
      requirements.join(" ") + " " + description
    );

    // Generate personalized questions using the job details
    const questions = await generateJobBasedQuestions({
      role,
      company,
      description,
      responsibilities: responsibilities.join("\n"),
      requirements: requirements.join("\n"),
    });

    // Create new interview document
    const interviewRef = db.collection("interviews").doc();

    const interview = {
      role,
      type: "job-specific",
      techstack,
      questions,
      jobId, // Reference to original job
      company,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
      coverImage: getRandomInterviewCover(),
      userId: user.id,
    };

    await interviewRef.set(interview);

    return {
      success: true,
      interviewId: interviewRef.id,
      message: "Interview created successfully",
    };
  } catch (error) {
    console.error("Error creating job-based interview:", error);
    return {
      success: false,
      message: "Failed to create interview",
    };
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getAllJobs(): Promise<Job[]> {
  const jobsSnapshot = await db
    .collection("jobs")
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .get();

  const rawJobs = jobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

  // Collect unique companyIds
  const companyIds = Array.from(
    new Set(
      rawJobs
        .map((j) => j.companyId)
        .filter((id) => typeof id === "string" && id.length > 0)
    )
  );

  // Fetch companies in parallel (simple loop; can be optimized later)
  const companyMap: Record<string, any> = {};
  await Promise.all(
    companyIds.map(async (cid) => {
      try {
        const cdoc = await db.collection("companies").doc(cid).get();
        if (cdoc.exists) companyMap[cid] = { id: cdoc.id, ...cdoc.data() };
      } catch (e) {
        console.error("Error fetching company:", cid, e);
      }
    })
  );

  // Enrich each job with company info and safe defaults
  const jobs: Job[] = rawJobs.map((j) => {
    const compFromId = j.companyId ? companyMap[j.companyId] : null;
    const company = compFromId || j.company || {
      id: j.companyId || "",
      name: j.companyName || "",
      logo: j.companyLogo || "",
      description: j.companyDescription || "",
      followers: j.companyFollowers || 0,
    };

    const applicantCount = j.applicantCount || (Array.isArray(j.applicants) ? j.applicants.length : 0) || 0;

    return {
      id: j.id,
      title: j.title || "",
      location: j.location || "",
      description: j.description || "",
      postedDate: j.postedDate || j.createdAt || new Date().toISOString(),
      company,
      applicantCount,
      responsibilities: j.responsibilities || [],
      requirements: j.requirements || [],
      benefits: j.benefits || [],
      ...j,
    } as Job;
  });

  return jobs;
}

/**
 * Get all published jobs for a specific company
 */
export async function getJobsByCompanyId(companyId: string): Promise<Job[]> {
  try {
    const jobsSnapshot = await db
      .collection("jobs")
      .where("companyId", "==", companyId)
      .where("status", "==", "published")
      .orderBy("createdAt", "desc")
      .get();

    if (jobsSnapshot.empty) {
      return [];
    }

    const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
    return jobs;

  } catch (error) {
    console.error("Error fetching jobs by company ID:", error);
    return [];
  }
}


export async function getJobById(id: string): Promise<Job | null> {
  try {
    const jobDoc = await db.collection("jobs").doc(id).get();
    if (!jobDoc.exists) return null;

    const jobData = jobDoc.data();

    let companyData = null;
    if (jobData?.companyId) {
      const companyDoc = await db
        .collection("companies")
        .doc(jobData.companyId)
        .get();
      if (companyDoc.exists) {
        companyData = { id: companyDoc.id, ...companyDoc.data() };
      }
    }

    let applicantCount = jobData?.applicantCount || 0;
    if (!jobData?.applicantCount && jobData?.applicants) {
      applicantCount = jobData.applicants.length;
    }

    const job: Job = {
      id: jobDoc.id,
      title: jobData?.title || "",
      location: jobData?.location || "",
      description: jobData?.description || "",
      postedDate: jobData?.postedDate || "",
      company: companyData ||
        jobData?.company || {
        id: jobData?.companyId || "",
        name: jobData?.companyName || "Unknown Company",
        description: jobData?.companyDescription || "",
        followers: jobData?.companyFollowers || 0,
      },
      applicantCount: applicantCount,
      responsibilities: jobData?.responsibilities || [],
      requirements: jobData?.requirements || [],
      benefits: jobData?.benefits || [],
      ...jobData,
    };

    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

// Add function to get company by ID
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const companyDoc = await db.collection("companies").doc(id).get();
    if (!companyDoc.exists) return null;

    return { id: companyDoc.id, ...companyDoc.data() } as Company;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}
interface ApplyJobParams {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  cvLink: string;
  coverLetter?: string;
}
export async function applyToJob(
  params: ApplyJobParams
): Promise<{ success: boolean; message: string }> {
  try {
    const { jobId, fullName, email, phone, cvLink, coverLetter } = params;

    // 1. Check Authentication
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: "You must be logged in to apply." };
    }

    // 2. Fetch Job from Firestore
    const jobRef = db.collection("jobs").doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return { success: false, message: "Job not found." };
    }

    const jobData = jobDoc.data();

    // 3. Check for Existing Application
    // Use 'any' type casting for applicants to avoid TS errors if not strictly defined
    const applicants = (jobData?.applicants || []) as any[];
    const hasApplied = applicants.some((app) => app.userId === user.id);

    if (hasApplied) {
      return { success: false, message: "You have already applied for this job." };
    }

    // 4. Create New Applicant Data
    const newApplicant = {
      userId: user.id,
      fullName: fullName,
      email: email,
      phone: phone,
      resumeUrl: cvLink,
      cvLink: cvLink,
      coverLetter: coverLetter || "",
      appliedAt: new Date().toISOString(),
      status: "pending",
    } as Applicant;

    // 5. Update Firestore (Add to applicants array & increment count)
    await jobRef.update({
      applicants: [...applicants, newApplicant],
      applicantCount: (jobData?.applicantCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    });

    // 6. Revalidate Path to update UI immediately
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath(`/hr/jobs/${jobId}/applicants`);

    return { success: true, message: "Application submitted successfully!" };
  } catch (error) {
    console.error("Error applying to job:", error);
    return { success: false, message: "An error occurred. Please try again later." };
  }
}
export async function getFeedbacksByUserId(
  userId: string
): Promise<Feedback[] | null> {
  const feedbacks = await db
    .collection("feedback")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return feedbacks.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Feedback[];
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Get recommended jobs for the current user based on their profile
 * Matches user skills, experiences, and education with job requirements
 */
export async function getRecommendedJobs(limit: number = 10): Promise<Job[]> {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    // Fetch all published jobs
    const jobsSnapshot = await db
      .collection("jobs")
      .where("status", "==", "published")
      .get();

    if (jobsSnapshot.empty) {
      return [];
    }

    const rawJobs = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Collect unique companyIds
    const companyIds = Array.from(
      new Set(
        rawJobs
          .map((j) => j.companyId)
          .filter((id) => typeof id === "string" && id.length > 0)
      )
    );

    // Fetch companies in parallel
    const companyMap: Record<string, any> = {};
    await Promise.all(
      companyIds.map(async (cid) => {
        try {
          const cdoc = await db.collection("companies").doc(cid).get();
          if (cdoc.exists) companyMap[cid] = { id: cdoc.id, ...cdoc.data() };
        } catch (e) {
          console.error("Error fetching company:", cid, e);
        }
      })
    );

    // Enrich jobs with company info
    const jobs: Job[] = rawJobs.map((j) => {
      const compFromId = j.companyId ? companyMap[j.companyId] : null;
      const company = compFromId || j.company || {
        id: j.companyId || "",
        name: j.companyName || "",
        logo: j.companyLogo || "",
        description: j.companyDescription || "",
        followers: j.companyFollowers || 0,
      };

      const applicantCount =
        j.applicantCount ||
        (Array.isArray(j.applicants) ? j.applicants.length : 0) ||
        0;

      return {
        id: j.id,
        title: j.title || "",
        location: j.location || "",
        description: j.description || "",
        postedDate: j.postedDate || j.createdAt || new Date().toISOString(),
        company,
        applicantCount,
        responsibilities: j.responsibilities || [],
        requirements: j.requirements || [],
        benefits: j.benefits || [],
        ...j,
      } as Job;
    });

    // Calculate match scores for each job
    const userSkills = (user.skills || []).map((s) => s.toLowerCase());
    const userExperiences = (user.experiences || []).join(" ").toLowerCase();
    const userEducation = (user.education || [])
      .map((e) => `${e.school} ${e.className}`)
      .join(" ")
      .toLowerCase();

    const jobsWithScores = jobs.map((job) => {
      let score = 0;

      // 1. Skills matching (40% weight)
      const jobRequirements = (job.requirements || []).join(" ").toLowerCase();
      const jobDescription = (job.description || "").toLowerCase();
      const jobText = `${jobRequirements} ${jobDescription}`;

      let skillsMatchCount = 0;
      userSkills.forEach((skill) => {
        // Check if skill appears in requirements or description
        if (jobText.includes(skill)) {
          skillsMatchCount++;
        }
      });

      const skillsScore =
        userSkills.length > 0
          ? (skillsMatchCount / userSkills.length) * 40
          : 0;
      score += skillsScore;

      // 2. Experience matching (30% weight)
      const jobResponsibilities = (job.responsibilities || []).join(" ").toLowerCase();
      const allJobText = `${jobText} ${jobResponsibilities}`;

      // Count how many experience keywords match
      const experienceKeywords = userExperiences.split(/\s+/).filter((w) => w.length > 3);
      let experienceMatches = 0;
      experienceKeywords.forEach((keyword) => {
        if (allJobText.includes(keyword)) {
          experienceMatches++;
        }
      });

      const experienceScore =
        experienceKeywords.length > 0
          ? Math.min((experienceMatches / experienceKeywords.length) * 30, 30)
          : 0;
      score += experienceScore;

      // 3. Education matching (10% weight)
      const educationKeywords = userEducation.split(/\s+/).filter((w) => w.length > 3);
      let educationMatches = 0;
      educationKeywords.forEach((keyword) => {
        if (allJobText.includes(keyword)) {
          educationMatches++;
        }
      });

      const educationScore =
        educationKeywords.length > 0
          ? Math.min((educationMatches / educationKeywords.length) * 10, 10)
          : 0;
      score += educationScore;

      // 4. Job title relevance (10% weight)
      const jobTitleLower = job.title.toLowerCase();
      let titleMatch = false;
      userSkills.forEach((skill) => {
        if (jobTitleLower.includes(skill)) {
          titleMatch = true;
        }
      });
      if (titleMatch) {
        score += 10;
      }

      // 5. Company following bonus (5% weight)
      if (user.followingCompanies?.includes(job.company.id)) {
        score += 5;
      }

      // 6. Recency bonus (5% weight) - newer jobs get slight boost
      const postedDate = new Date(job.postedDate);
      const daysSincePosted = Math.floor(
        (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePosted < 7) {
        score += 5;
      } else if (daysSincePosted < 30) {
        score += 2;
      }

      return { job, score };
    });

    // Sort by score (descending) and return top N
    const recommendedJobs = jobsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.job);

    return recommendedJobs;
  } catch (error) {
    console.error("Error getting recommended jobs:", error);
    return [];
  }
}





