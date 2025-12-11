import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getJobMetrics,
  getApplicantMetrics,
  getRecentJobs,
  getRecentApplications,
} from "@/lib/actions/hr-analytics.action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HRDashboard() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const [jobMetrics, applicantMetrics, recentJobs, recentApplications] =
    await Promise.all([
      getJobMetrics(),
      getApplicantMetrics(),
      getRecentJobs(5),
      getRecentApplications(10),
    ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your job postings and applicants
          </p>
        </div>
        <Button asChild>
          <Link href="/hr/jobs/new">+ Create New Job</Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Jobs Posted
          </div>
          <div className="text-3xl font-bold">
            {jobMetrics?.totalJobsPosted || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Open Positions
          </div>
          <div className="text-3xl font-bold">
            {jobMetrics?.openPositions || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Applicants
          </div>
          <div className="text-3xl font-bold">
            {jobMetrics?.totalApplicants || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Pending Applications
          </div>
          <div className="text-3xl font-bold">
            {jobMetrics?.pendingApplications || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Avg Applicants/Job
          </div>
          <div className="text-3xl font-bold">
            {jobMetrics?.averageApplicantsPerJob || 0}
          </div>
        </div>
      </div>

      {/* Recent Jobs and Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Jobs</h2>
            <Link href="/hr/jobs" className="text-[#BF3131] text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="flex justify-between items-start p-3 border border-gray-100 dark:border-gray-800 rounded"
                >
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.location}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {job.applicantCount || 0} applicants
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      job.status === "published"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No jobs posted yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/hr/jobs" className="text-[#BF3131] text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications && recentApplications.length > 0 ? (
              recentApplications.map((app: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-start p-3 border border-gray-100 dark:border-gray-800 rounded"
                >
                  <div>
                    <h3 className="font-semibold">{app.userName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {app.jobTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      app.status === "pending"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        : app.status === "offered"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No applications yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

