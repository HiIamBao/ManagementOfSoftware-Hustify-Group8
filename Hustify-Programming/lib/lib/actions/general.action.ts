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
    .orderBy("createdAt", "desc")
    .get();

  return jobsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Job[];
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

export async function applyToJob(
  jobId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current user from cookies (you'll need to implement this based on your auth system)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return {
        success: false,
        message: "You must be logged in to apply for a job",
      };
    }

    // Get job reference
    const jobRef = db.collection("jobs").doc(jobId);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    // Get current user ID (replace with your actual auth logic)
    // For example, decode the session cookie to get the user ID
    // This is just a placeholder - implement your actual user ID extraction
    const userId = "current-user-id"; // Replace with actual user ID extraction

    // Check if user has already applied
    const jobData = jobDoc.data();

    const jobDataTyped = jobData as { applicants?: Applicant[] };

    const existingApplication = jobDataTyped?.applicants?.find(
      (app: Applicant) => app.userId === userId
    );

    if (existingApplication) {
      return {
        success: false,
        message: "You have already applied for this job",
      };
    }

    // Update job with new applicant and increment count
    const newApplicant = {
      userId: userId,
      appliedAt: new Date().toISOString(),
      status: "pending",
    };

    await jobRef.update({
      applicants: [...(jobData?.applicants || []), newApplicant],
      applicantCount: (jobData?.applicantCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    });

    // Revalidate the job page to reflect changes
    revalidatePath(`/jobs/${jobId}`);

    return {
      success: true,
      message: "Application submitted successfully",
    };
  } catch (error) {
    console.error("Error applying to job:", error);
    return {
      success: false,
      message: "An error occurred while submitting your application",
    };
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
