import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getJobMetrics,
  getApplicantMetrics,
  getConversionFunnel,
  getApplicationTrends,
  getJobPerformanceMetrics,
} from "@/lib/actions/hr-analytics.action";
import { redirect } from "next/navigation";
import AnalyticsCharts from "@/components/hr/AnalyticsCharts";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const [
    jobMetrics, 
    applicantMetrics, 
    conversionFunnel,
    applicationTrends,
    jobPerformance
  ] = await Promise.all([
    getJobMetrics(),
    getApplicantMetrics(),
    getConversionFunnel(),
    getApplicationTrends(),
    getJobPerformanceMetrics()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track your recruitment metrics and performance
        </p>
      </div>

      {/* Visual Charts */}
      {applicationTrends && jobPerformance && (
        <AnalyticsCharts 
          applicationTrends={applicationTrends} 
          jobPerformance={jobPerformance} 
        />
      )}

      {/* Job Metrics */}
      {jobMetrics && (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Job Posting Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard 
              label="Total Jobs Posted" 
              value={jobMetrics.totalJobsPosted} 
            />
            <MetricCard 
              label="Open Positions" 
              value={jobMetrics.openPositions} 
            />
            <MetricCard 
              label="Total Applicants" 
              value={jobMetrics.totalApplicants} 
            />
            <MetricCard 
              label="Pending Applications" 
              value={jobMetrics.pendingApplications} 
            />
            <MetricCard 
              label="Avg Applicants/Job" 
              value={jobMetrics.averageApplicantsPerJob} 
            />
          </div>
        </div>
      )}

      {/* Applicant Metrics */}
      {applicantMetrics && (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Applicant Status Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatusMetricCard 
              label="Pending" 
              value={applicantMetrics.pendingCount} 
              color="blue"
            />
            <StatusMetricCard 
              label="Reviewing" 
              value={applicantMetrics.reviewingCount} 
              color="purple"
            />
            <StatusMetricCard 
              label="Interviewed" 
              value={applicantMetrics.interviewedCount} 
              color="orange"
            />
            <StatusMetricCard 
              label="Rejected" 
              value={applicantMetrics.rejectedCount} 
              color="red"
            />
            <StatusMetricCard 
              label="Offered" 
              value={applicantMetrics.offeredCount} 
              color="green"
            />
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {conversionFunnel && (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Conversion Funnel</h2>
          <div className="space-y-6">
            {[
              { label: "Applied", key: "applied", color: "#6B7280" },
              { label: "Reviewing", key: "reviewing", color: "#8B5CF6" },
              { label: "Interviewed", key: "interviewed", color: "#F97316" },
              { label: "Offered", key: "offered", color: "#10B981" },
            ].map((stage) => (
              <div key={stage.key}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{stage.label}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {conversionFunnel[stage.key as keyof typeof conversionFunnel]?.count} (
                    {conversionFunnel[stage.key as keyof typeof conversionFunnel]?.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${conversionFunnel[stage.key as keyof typeof conversionFunnel]?.percentage}%`,
                      backgroundColor: stage.color
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-100 dark:border-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}

function StatusMetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorStyles = {
    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400",
    green: "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400",
  };

  const style = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;

  return (
    <div className={`p-4 rounded-lg border ${style}`}>
      <div className="text-sm font-medium mb-1 opacity-80">
        {label}
      </div>
      <div className="text-3xl font-bold">
        {value}
      </div>
    </div>
  );
}
