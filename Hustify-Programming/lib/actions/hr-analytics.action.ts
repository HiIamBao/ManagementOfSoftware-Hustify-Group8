"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { JobMetrics, ApplicantMetrics } from "@/types";

/**
 * Get job metrics for the current HR user
 */
export async function getJobMetrics(): Promise<JobMetrics | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return null;
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      .get();

    const jobs = jobsSnapshot.docs.map((doc) => doc.data());

    const totalJobsPosted = jobs.length;
    const totalApplicants = jobs.reduce(
      (sum, job) => sum + (job.applicantCount || 0),
      0
    );
    const openPositions = jobs.filter(
      (job) => job.status === "published"
    ).length;
    const pendingApplications = jobs.reduce((sum, job) => {
      const pending = (job.applicants || []).filter(
        (app: any) => app.status === "pending"
      ).length;
      return sum + pending;
    }, 0);

    const averageApplicantsPerJob =
      totalJobsPosted > 0 ? Math.round(totalApplicants / totalJobsPosted) : 0;

    return {
      totalJobsPosted,
      totalApplicants,
      openPositions,
      pendingApplications,
      averageApplicantsPerJob,
    };
  } catch (error) {
    console.error("Error fetching job metrics:", error);
    return null;
  }
}

/**
 * Get applicant metrics for the current HR user
 */
export async function getApplicantMetrics(): Promise<ApplicantMetrics | null> {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return null;
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      .get();

    const jobs = jobsSnapshot.docs.map((doc) => doc.data());

    let totalApplicants = 0;
    let pendingCount = 0;
    let reviewingCount = 0;
    let interviewedCount = 0;
    let rejectedCount = 0;
    let offeredCount = 0;

    jobs.forEach((job) => {
      const applicants = job.applicants || [];
      totalApplicants += applicants.length;

      applicants.forEach((app: any) => {
        switch (app.status) {
          case "pending":
            pendingCount++;
            break;
          case "reviewing":
            reviewingCount++;
            break;
          case "interviewed":
            interviewedCount++;
            break;
          case "rejected":
            rejectedCount++;
            break;
          case "offered":
            offeredCount++;
            break;
        }
      });
    });

    return {
      totalApplicants,
      pendingCount,
      reviewingCount,
      interviewedCount,
      rejectedCount,
      offeredCount,
    };
  } catch (error) {
    console.error("Error fetching applicant metrics:", error);
    return null;
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel() {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return null;
    }

    const metrics = await getApplicantMetrics();
    if (!metrics) return null;

    const total = metrics.totalApplicants;

    return {
      applied: {
        count: total,
        percentage: 100,
      },
      reviewing: {
        count: metrics.reviewingCount,
        percentage: total > 0 ? Math.round((metrics.reviewingCount / total) * 100) : 0,
      },
      interviewed: {
        count: metrics.interviewedCount,
        percentage: total > 0 ? Math.round((metrics.interviewedCount / total) * 100) : 0,
      },
      offered: {
        count: metrics.offeredCount,
        percentage: total > 0 ? Math.round((metrics.offeredCount / total) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching conversion funnel:", error);
    return null;
  }
}

/**
 * Get recent jobs for dashboard
 */
export async function getRecentJobs(limit: number = 5) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return [];
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
    return [];
  }
}

/**
 * Get recent applications for dashboard
 */
export async function getRecentApplications(limit: number = 10) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return [];
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      .get();

    const allApplications: any[] = [];

    for (const jobDoc of jobsSnapshot.docs) {
      const jobData = jobDoc.data();
      const applicants = jobData.applicants || [];

      for (const applicant of applicants) {
        const userDoc = await db
          .collection("users")
          .doc(applicant.userId)
          .get();
        const userData = userDoc.data();

        allApplications.push({
          jobId: jobDoc.id,
          jobTitle: jobData.title,
          userId: applicant.userId,
          userName: userData?.name || "Unknown",
          appliedAt: applicant.appliedAt,
          status: applicant.status,
        });
      }
    }

    // Sort by appliedAt and limit
    return allApplications
      .sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    return [];
  }
}

/**
 * Get application trends (last 30 days)
 */
export async function getApplicationTrends() {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return [];
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      .get();

    const allApplications: any[] = [];
    
    // Collect all applications
    jobsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.applicants && Array.isArray(data.applicants)) {
        allApplications.push(...data.applicants);
      }
    });

    // Generate last 30 days array
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    // Group by date
    const countsByDate = allApplications.reduce((acc, app) => {
      // Handle different date formats or timestamps
      const dateStr = app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : null;
      if (dateStr && acc[dateStr] !== undefined) {
        acc[dateStr]++;
      }
      return acc;
    }, last30Days.reduce((acc: any, date) => {
      acc[date] = 0;
      return acc;
    }, {}));

    // Convert to array format for Recharts
     return last30Days.map(date => {
       const d = new Date(date);
       return {
         date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
         count: countsByDate[date] || 0
       };
     });

  } catch (error) {
    console.error("Error fetching application trends:", error);
    return [];
  }
}

/**
 * Get top performing jobs by applicant count
 */
export async function getJobPerformanceMetrics() {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return [];
    }

    const jobsSnapshot = await db
      .collection("jobs")
      .where("postedBy", "==", user.id)
      .get();

    const jobs = jobsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        applicantCount: data.applicantCount || (data.applicants ? data.applicants.length : 0),
        status: data.status
      };
    });

    // Sort by applicant count descending and take top 5
    return jobs
      .sort((a, b) => b.applicantCount - a.applicantCount)
      .slice(0, 5);

  } catch (error) {
    console.error("Error fetching job performance metrics:", error);
    return [];
  }
}

