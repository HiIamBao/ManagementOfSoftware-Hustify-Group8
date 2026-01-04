"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { CreateJobParams, UpdateJobParams, Job, Company } from "@/types";
import { revalidatePath } from "next/cache";
import { sendBulkJobNotificationEmails } from "@/lib/services/email.service";

/**
 * Create a new job posting
 */
export async function createJob(params: CreateJobParams) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can create jobs",
      };
    }

    if (!user.companyId) {
      return {
        success: false,
        message: "HR user must have a company",
      };
    }

    const jobRef = db.collection("jobs").doc();

    const jobData = {
      title: params.title,
      location: params.location,
      description: params.description,
      responsibilities: params.responsibilities,
      requirements: params.requirements,
      benefits: params.benefits,
      recruitmentUrl: params.recruitmentUrl || "",
      postedBy: user.id,
      companyId: user.companyId,
      status: params.status || "draft",
      jobType: params.jobType || "full-time",
      applicantCount: 0,
      viewCount: 0,
      applicants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await jobRef.set(jobData);

    revalidatePath("/hr/jobs");

    return {
      success: true,
      jobId: jobRef.id,
      message: "Job created successfully",
    };
  } catch (error) {
    console.error("Error creating job:", error);
    return {
      success: false,
      message: "Failed to create job",
    };
  }
}

/**
 * Update an existing job
 */
export async function updateJob(jobId: string, params: UpdateJobParams) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can update jobs",
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
        message: "You don't have permission to update this job",
      };
    }

    const updateData = {
      ...params,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("jobs").doc(jobId).update(updateData);

    revalidatePath("/hr/jobs");
    revalidatePath(`/hr/jobs/${jobId}`);

    return {
      success: true,
      message: "Job updated successfully",
    };
  } catch (error) {
    console.error("Error updating job:", error);
    return {
      success: false,
      message: "Failed to update job",
    };
  }
}

/**
 * Delete a job posting
 */
export async function deleteJob(jobId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can delete jobs",
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
        message: "You don't have permission to delete this job",
      };
    }

    await db.collection("jobs").doc(jobId).delete();

    revalidatePath("/hr/jobs");

    return {
      success: true,
      message: "Job deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting job:", error);
    return {
      success: false,
      message: "Failed to delete job",
    };
  }
}

/**
 * Get all jobs posted by the current HR user
 */
export async function getHRJobs(): Promise<Job[]> {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return [];
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      // .orderBy("createdAt", "desc") // Avoid composite index requirement
      .get();

    const items = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];

    // Sort in-memory by createdAt descending to avoid requiring Firestore index
    return items.sort((a, b) => {
      const da = new Date(a.createdAt || a.postedDate || 0).getTime();
      const dbt = new Date(b.createdAt || b.postedDate || 0).getTime();
      return dbt - da;
    });
  } catch (error) {
    console.error("Error fetching HR jobs:", error);
    return [];
  }
}

/**
 * Publish a job (change status from draft to published)
 */
export async function publishJob(jobId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can publish jobs",
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
        message: "You don't have permission to publish this job",
      };
    }

    await db.collection("jobs").doc(jobId).update({
      status: "published",
      updatedAt: new Date().toISOString(),
      postedDate: new Date().toISOString(), // Set postedDate on first publish
    });

    // Re-fetch the job data to ensure it's up-to-date
    const updatedJobDoc = await db.collection("jobs").doc(jobId).get();
    const updatedJobData = updatedJobDoc.data();

    // Create notifications for followers
    if (updatedJobData?.companyId) {
      console.log(`Job ${jobId} published for company ${updatedJobData.companyId}. Checking for followers...`);
      const companyRef = db.collection("companies").doc(updatedJobData.companyId);
      const companyDoc = await companyRef.get();
      if (companyDoc.exists) {
        const companyData = companyDoc.data() as Company;
        const followers = companyData.followers || [];
        console.log(`Found ${followers.length} followers for company ${companyData.name}.`);

        if (followers.length > 0) {
          // Fetch follower details for email sending
          const followerDetails: Array<{ id: string; email: string; name: string }> = [];
          
          // Batch fetch user data
          const userSnapshots = await Promise.all(
            followers.map(followerId => 
              db.collection("users").doc(followerId).get()
            )
          );

          userSnapshots.forEach((snapshot, index) => {
            if (snapshot.exists) {
              const userData = snapshot.data();
              if (userData?.email) {
                followerDetails.push({
                  id: followers[index],
                  email: userData.email,
                  name: userData.name || "User",
                });
              }
            }
          });

          // Create in-app notifications
          const batch = db.batch();
          followers.forEach(followerId => {
            const notificationRef = db.collection("notifications").doc();
            batch.set(notificationRef, {
              userId: followerId,
              message: `${companyData.name} just posted a new job: ${updatedJobData.title}`,
              link: `/jobs/${jobId}`,
              isRead: false,
              createdAt: new Date().toISOString(),
              type: "job_posting",
              companyId: updatedJobData.companyId,
              jobId,
            });
          });
          console.log(`Creating ${followers.length} in-app notifications...`);
          await batch.commit();
          console.log("In-app notifications created successfully.");

          // Send email notifications (async, don't block the response)
          if (followerDetails.length > 0) {
            console.log(`Sending email notifications to ${followerDetails.length} followers...`);
            
            // Fire and forget - don't await to avoid blocking
            sendBulkJobNotificationEmails(
              followerDetails.map(f => ({ email: f.email, name: f.name })),
              {
                companyName: companyData.name,
                jobTitle: updatedJobData.title,
                jobId: jobId,
                jobLocation: updatedJobData.location,
              }
            ).then(result => {
              console.log(`[Email] Notification results: ${result.totalSent} sent, ${result.totalFailed} failed`);
            }).catch(error => {
              console.error("[Email] Error sending notifications:", error);
            });
          }
        }
      }
    }

    revalidatePath("/hr/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath(`/company/${jobData?.companyId}`);

    return {
      success: true,
      message: "Job published successfully",
    };
  } catch (error) {
    console.error("Error publishing job:", error);
    return {
      success: false,
      message: "Failed to publish job",
    };
  }
}

/**
 * Close a job (change status to closed)
 */
export async function closeJob(jobId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can close jobs",
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
        message: "You don't have permission to close this job",
      };
    }

    await db.collection("jobs").doc(jobId).update({
      status: "closed",
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/hr/jobs");

    return {
      success: true,
      message: "Job closed successfully",
    };
  } catch (error) {
    console.error("Error closing job:", error);
    return {
      success: false,
      message: "Failed to close job",
    };
  }
}

