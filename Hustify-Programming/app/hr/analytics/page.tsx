import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getJobMetrics,
  getApplicantMetrics,
  getConversionFunnel,
} from "@/lib/actions/hr-analytics.action";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const [jobMetrics, applicantMetrics, conversionFunnel] = await Promise.all([
    getJobMetrics(),
    getApplicantMetrics(),
    getConversionFunnel(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your recruitment metrics and performance
        </p>
      </div>

      {/* Job Metrics */}
      {jobMetrics && (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Job Posting Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Total Jobs Posted
              </div>
              <div className="text-3xl font-bold">
                {jobMetrics.totalJobsPosted}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Open Positions
              </div>
              <div className="text-3xl font-bold">{jobMetrics.openPositions}</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Total Applicants
              </div>
              <div className="text-3xl font-bold">
                {jobMetrics.totalApplicants}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Pending Applications
              </div>
              <div className="text-3xl font-bold">
                {jobMetrics.pendingApplications}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Avg Applicants/Job
              </div>
              <div className="text-3xl font-bold">
                {jobMetrics.averageApplicantsPerJob}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Metrics */}
      {applicantMetrics && (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Applicant Status Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                Pending
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                {applicantMetrics.pendingCount}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                Reviewing
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                {applicantMetrics.reviewingCount}
              </div>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                Interviewed
              </div>
              <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">
                {applicantMetrics.interviewedCount}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                Rejected
              </div>
              <div className="text-3xl font-bold text-red-900 dark:text-red-300">
                {applicantMetrics.rejectedCount}
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                Offered
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-300">
                {applicantMetrics.offeredCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {conversionFunnel && (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Conversion Funnel</h2>
          <div className="space-y-4">
            {[
              { label: "Applied", key: "applied" },
              { label: "Reviewing", key: "reviewing" },
              { label: "Interviewed", key: "interviewed" },
              { label: "Offered", key: "offered" },
            ].map((stage) => (
              <div key={stage.key}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{stage.label}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {conversionFunnel[stage.key as keyof typeof conversionFunnel]?.count} (
                    {conversionFunnel[stage.key as keyof typeof conversionFunnel]?.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#BF3131] h-2 rounded-full transition-all"
                    style={{
                      width: `${conversionFunnel[stage.key as keyof typeof conversionFunnel]?.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

