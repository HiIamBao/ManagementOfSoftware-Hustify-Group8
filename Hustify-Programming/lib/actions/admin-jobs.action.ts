"use server";

import { db } from "@/firebase/admin";
import { requireAdmin } from "./auth.action";
import { Job } from "@/types";

function safeApplicantCount(data: any): number {
  if (typeof data?.applicantCount === "number") return data.applicantCount;
  if (Array.isArray(data?.applicants)) return data.applicants.length;
  return 0;
}

export async function getAllJobsAdmin(params?: {
  page?: number;
  limit?: number;
  status?: "draft" | "published" | "closed";
  sortBy?: "createdAt" | "title" | "applicantCount";
  order?: "asc" | "desc";
}) {
  try {
    await requireAdmin();

    const page = params?.page || 1;
    const limit = params?.limit || 50;

    let query: FirebaseFirestore.Query = db.collection("jobs");
    if (params?.status) {
      query = query.where("status", "==", params.status);
    }

    const snapshot = await query.get();

    let jobs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        location: data.location || "",
        description: data.description || "",
        postedDate: data.postedDate || data.createdAt || new Date().toISOString(),
        company: data.company || { id: data.companyId || "", name: data.companyName || "" },
        applicantCount: safeApplicantCount(data),
        status: data.status || "draft",
        jobType: data.jobType || "full-time",
        viewCount: data.viewCount || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Job;
    });

    // Sort
    const sortBy = params?.sortBy || "createdAt";
    const order = params?.order || "desc";
    jobs = jobs.sort((a, b) => {
      if (sortBy === "title") {
        const cmp = (a.title || "").localeCompare(b.title || "");
        return order === "asc" ? cmp : -cmp;
      }
      if (sortBy === "applicantCount") {
        const cmp = (a.applicantCount || 0) - (b.applicantCount || 0);
        return order === "asc" ? cmp : -cmp;
      }
      // createdAt fallback
      const ta = new Date(a.createdAt || a.postedDate || 0).getTime();
      const tb = new Date(b.createdAt || b.postedDate || 0).getTime();
      const cmp = ta - tb;
      return order === "asc" ? cmp : -cmp;
    });

    const total = jobs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageItems = jobs.slice(startIndex, endIndex);

    return {
      success: true,
      jobs: pageItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch jobs" };
  }
}

export async function updateJobStatusAdmin(jobId: string, status: "draft" | "published" | "closed") {
  try {
    await requireAdmin();
    const jobRef = db.collection("jobs").doc(jobId);
    const doc = await jobRef.get();
    if (!doc.exists) return { success: false, message: "Job not found" };

    await jobRef.update({ status, updatedAt: new Date().toISOString() });
    return { success: true, message: "Job status updated" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update job status" };
  }
}

export async function deleteJobAdmin(jobId: string) {
  try {
    await requireAdmin();
    const jobRef = db.collection("jobs").doc(jobId);
    const doc = await jobRef.get();
    if (!doc.exists) return { success: false, message: "Job not found" };
    await jobRef.delete();
    return { success: true, message: "Job deleted" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete job" };
  }
}

type TopJobsMetric = "applicants" | "views" | "conversion" | "recentApplicants" | "growth" | "composite";

function toDate(val: any): Date | null {
  if (!val) return null;
  try {
    return new Date(val);
  } catch {
    return null;
  }
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.floor((a.getTime() - b.getTime()) / 86400000));
}

function countRecentApplicants(job: any, windowDays: number, refDate = new Date()) {
  const apps: any[] = Array.isArray(job?.applicants) ? job.applicants : [];
  const since = new Date(refDate.getTime() - windowDays * 86400000);
  return apps.filter((a) => {
    const d = toDate(a?.appliedAt);
    return d && d >= since;
  }).length;
}

export async function getTopJobs(options?: {
  limit?: number;
  status?: "draft" | "published" | "closed";
  metric?: TopJobsMetric;
  windowDays?: number; // for recent/growth/composite
  normalizeByFollowers?: boolean; // optional
}) {
  try {
    await requireAdmin();
    const limit = options?.limit ?? 5;
    const metric: TopJobsMetric = options?.metric ?? "applicants";
    const status = options?.status; // if provided, filter
    const windowDays = Math.max(1, options?.windowDays ?? 30);

    let query: FirebaseFirestore.Query = db.collection("jobs");
    if (status) query = query.where("status", "==", status);
    const snapshot = await query.get();

    const jobs: any[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Optionally fetch company followers to normalize
    let followersMap: Record<string, number> = {};
    if (options?.normalizeByFollowers) {
      const companyIds = Array.from(new Set(jobs.map((j) => j.companyId).filter(Boolean)));
      await Promise.all(
        companyIds.map(async (cid) => {
          try {
            const cdoc = await db.collection("companies").doc(cid).get();
            const cdata: any = cdoc.exists ? cdoc.data() : {};
            const followers = Array.isArray(cdata?.followers) ? cdata.followers.length : (cdata?.followerCount || 0);
            followersMap[cid as string] = followers || 0;
          } catch {}
        })
      );
    }

    const now = new Date();

    const enriched = jobs.map((j) => {
      const applicants = safeApplicantCount(j);
      const views = typeof j.viewCount === "number" ? j.viewCount : 0;
      const postedAt = toDate(j.postedDate || j.createdAt) || now;
      const recency = 1 / (1 + daysBetween(now, postedAt)); // 0..1 giảm dần theo thời gian
      const recent = countRecentApplicants(j, windowDays, now);
      const prev = countRecentApplicants(j, windowDays, new Date(now.getTime() - windowDays * 86400000));
      const growth = recent - prev;
      const interviewed = (Array.isArray(j.applicants) ? j.applicants : []).filter((a: any) => a?.status === "interviewed").length;
      const offered = (Array.isArray(j.applicants) ? j.applicants : []).filter((a: any) => a?.status === "offered").length;
      const quality = applicants > 0 ? (interviewed * 0.4 + offered * 0.6) / applicants : 0; // 0..1
      const conversion = views > 0 ? applicants / views : 0;
      const followers = j.companyId ? (followersMap[j.companyId] || 0) : 0;

      return {
        id: j.id,
        title: j.title || "Untitled",
        applicantCount: applicants,
        viewCount: views,
        postedDate: j.postedDate || j.createdAt,
        companyId: j.companyId,
        followers,
        recency,
        recentApplicants: recent,
        growth,
        quality,
        conversion,
      };
    });

    // Prepare min-max for normalization if needed
    const getMinMax = (arr: number[]) => ({ min: Math.min(...arr, 0), max: Math.max(...arr, 1) });
    const norm = (v: number, { min, max }: { min: number; max: number }) => (max === min ? 0 : (v - min) / (max - min));

    let ranked: any[] = [];
    if (metric === "applicants") {
      ranked = [...enriched].sort((a, b) => b.applicantCount - a.applicantCount);
    } else if (metric === "views") {
      ranked = [...enriched].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (metric === "conversion") {
      ranked = [...enriched].sort((a, b) => (b.conversion || 0) - (a.conversion || 0));
    } else if (metric === "recentApplicants") {
      ranked = [...enriched].sort((a, b) => (b.recentApplicants || 0) - (a.recentApplicants || 0));
    } else if (metric === "growth") {
      ranked = [...enriched].sort((a, b) => (b.growth || 0) - (a.growth || 0));
    } else {
      // composite
      const appsMM = getMinMax(enriched.map((x) => x.applicantCount));
      const convMM = getMinMax(enriched.map((x) => x.conversion));
      const recMM = getMinMax(enriched.map((x) => x.recency));
      const qualMM = getMinMax(enriched.map((x) => x.quality));
      const grMM = getMinMax(enriched.map((x) => x.growth));
      ranked = enriched
        .map((x) => {
          const score = 0.5 * norm(x.applicantCount, appsMM) + 0.2 * norm(x.conversion, convMM) + 0.15 * norm(x.recency, recMM) + 0.1 * norm(x.quality, qualMM) + 0.05 * norm(x.growth, grMM);
          return { ...x, score };
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    const items = ranked.slice(0, limit).map((x) => ({
      title: x.title,
      applicantCount: x.applicantCount || 0,
      viewCount: x.viewCount || 0,
      conversion: x.conversion || 0,
      recentApplicants: x.recentApplicants || 0,
      growth: x.growth || 0,
      score: typeof x.score === "number" ? x.score : undefined,
    }));

    return { success: true, items, meta: { metric, windowDays, status } };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get top jobs" };
  }
}



export async function getJobsStatsAdmin() {
  try {
    await requireAdmin();
    const snapshot = await db.collection("jobs").get();
    let totalApplicants = 0;
    snapshot.forEach((doc) => {
      const data: any = doc.data();
      totalApplicants += safeApplicantCount(data);
    });
    const totalJobs = snapshot.size;
    const avgApplicantsPerJob = totalJobs > 0 ? +(totalApplicants / totalJobs).toFixed(2) : 0;
    return { success: true, totals: { totalJobs, totalApplicants, avgApplicantsPerJob } };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get jobs stats" };
  }
}

export async function getJobsByTypeAdmin() {
  try {
    await requireAdmin();
    const snapshot = await db.collection("jobs").get();
    const map: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const data: any = doc.data();
      const t = (data?.jobType || "other").toString().toLowerCase();
      map[t] = (map[t] || 0) + 1;
    });
    const items = Object.keys(map).map((k) => ({ type: k, count: map[k] }));
    // Sort by count desc
    items.sort((a, b) => b.count - a.count);
    return { success: true, items };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get jobs by type" };
  }
}
