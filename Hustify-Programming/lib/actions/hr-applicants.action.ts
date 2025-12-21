"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { Job, Applicant, User } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Get all applicants for a specific job
 */
export async function getJobApplicants(jobId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        applicants: [],
        message: "Only HR users can view applicants",
      };
    }

    // Verify ownership
    const jobDoc = await db.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return {
        success: false,
        applicants: [],
        message: "Job not found",
      };
    }

    const jobData = jobDoc.data();
    if (jobData?.postedBy !== user.id) {
      return {
        success: false,
        applicants: [],
        message: "You don't have permission to view these applicants",
      };
    }

    const applicants = jobData?.applicants || [];

    // Enrich applicants with user data
    const enrichedApplicants = await Promise.all(
      applicants.map(async (applicant: Applicant) => {
        const userDoc = await db.collection("users").doc(applicant.userId).get();
        const userData = userDoc.data();
        return {
          ...applicant,
          userName: userData?.name || "Unknown",
          userEmail: userData?.email || "Unknown",
        };
      })
    );

    return {
      success: true,
      applicants: enrichedApplicants,
      message: "Applicants retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return {
      success: false,
      applicants: [],
      message: "Failed to fetch applicants",
    };
  }
}

/**
 * Update applicant status
 */
export async function updateApplicantStatus(
  jobId: string,
  userId: string,
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "offered"
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can update applicant status",
      };
    }

    // Verify ownership
    const jobDoc = await db.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    const jobData = jobDoc.data();
    if (jobData?.postedBy !== user.id) {
      return {
        success: false,
        message: "You don't have permission to update this applicant",
      };
    }

    const applicants = jobData?.applicants || [];
    const applicantIndex = applicants.findIndex(
      (app: Applicant) => app.userId === userId
    );

    if (applicantIndex === -1) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    applicants[applicantIndex].status = status;
    applicants[applicantIndex].updatedAt = new Date().toISOString();

    await db.collection("jobs").doc(jobId).update({
      applicants,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/hr/jobs/${jobId}/applicants`);

    return {
      success: true,
      message: "Applicant status updated successfully",
    };
  } catch (error) {
    console.error("Error updating applicant status:", error);
    return {
      success: false,
      message: "Failed to update applicant status",
    };
  }
}

/**
 * Add or update notes for an applicant
 */
export async function addApplicantNotes(
  jobId: string,
  userId: string,
  notes: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can add notes",
      };
    }

    // Verify ownership
    const jobDoc = await db.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    const jobData = jobDoc.data();
    if (jobData?.postedBy !== user.id) {
      return {
        success: false,
        message: "You don't have permission to add notes",
      };
    }

    const applicants = jobData?.applicants || [];
    const applicantIndex = applicants.findIndex(
      (app: Applicant) => app.userId === userId
    );

    if (applicantIndex === -1) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    applicants[applicantIndex].notes = notes;
    applicants[applicantIndex].updatedAt = new Date().toISOString();

    await db.collection("jobs").doc(jobId).update({
      applicants,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/hr/jobs/${jobId}/applicants`);

    return {
      success: true,
      message: "Notes added successfully",
    };
  } catch (error) {
    console.error("Error adding notes:", error);
    return {
      success: false,
      message: "Failed to add notes",
    };
  }
}

/**
 * Rate an applicant
 */
export async function rateApplicant(
  jobId: string,
  userId: string,
  rating: number
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can rate applicants",
      };
    }

    if (rating < 0 || rating > 5) {
      return {
        success: false,
        message: "Rating must be between 0 and 5",
      };
    }

    // Verify ownership
    const jobDoc = await db.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return {
        success: false,
        message: "Job not found",
      };
    }

    const jobData = jobDoc.data();
    if (jobData?.postedBy !== user.id) {
      return {
        success: false,
        message: "You don't have permission to rate this applicant",
      };
    }

    const applicants = jobData?.applicants || [];
    const applicantIndex = applicants.findIndex(
      (app: Applicant) => app.userId === userId
    );

    if (applicantIndex === -1) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    applicants[applicantIndex].rating = rating;
    applicants[applicantIndex].updatedAt = new Date().toISOString();

    await db.collection("jobs").doc(jobId).update({
      applicants,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/hr/jobs/${jobId}/applicants`);

    return {
      success: true,
      message: "Applicant rated successfully",
    };
  } catch (error) {
    console.error("Error rating applicant:", error);
    return {
      success: false,
      message: "Failed to rate applicant",
    };
  }
}

