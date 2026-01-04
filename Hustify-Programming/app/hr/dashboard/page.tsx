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
import { 
  Briefcase, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your recruitment pipeline today.
          </p>
        </div>
        <div>
          <Button asChild className="bg-[#BF3131] hover:bg-[#a62b2b] text-white shadow-lg shadow-red-900/20">
            <Link href="/hr/jobs/new">
              <Briefcase className="mr-2 h-4 w-4" />
              Create New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard 
          title="Total Jobs Posted" 
          value={jobMetrics?.totalJobsPosted || 0} 
          icon={<Briefcase className="h-5 w-5 text-blue-600" />}
          trend="+2 this week"
          trendUp={true}
          className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50"
        />
        
        <StatsCard 
          title="Open Positions" 
          value={jobMetrics?.openPositions || 0} 
          icon={<FileText className="h-5 w-5 text-purple-600" />}
          className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/50"
        />

        <StatsCard 
          title="Total Applicants" 
          value={jobMetrics?.totalApplicants || 0} 
          icon={<Users className="h-5 w-5 text-green-600" />}
          trend="+12% vs last month"
          trendUp={true}
          className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/50"
        />

        <StatsCard 
          title="Pending Review" 
          value={jobMetrics?.pendingApplications || 0} 
          icon={<Clock className="h-5 w-5 text-orange-600" />}
          className="bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/50"
        />

        <StatsCard 
          title="Avg Applicants/Job" 
          value={jobMetrics?.averageApplicantsPerJob || 0} 
          icon={<TrendingUp className="h-5 w-5 text-red-600" />}
          className="bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/50"
        />
      </div>

      {/* Recent Jobs and Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-400" />
              Recent Jobs
            </h2>
            <Link href="/hr/jobs" className="text-[#BF3131] text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              {recentJobs && recentJobs.length > 0 ? (
                recentJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-[#BF3131]/30 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all duration-200"
                  >
                    <div className="mb-2 sm:mb-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#BF3131] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1 gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {job.applicantCount || 0} applicants
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No jobs posted yet</p>
                  <Button variant="link" asChild className="mt-2 text-[#BF3131]">
                    <Link href="/hr/jobs/new">Post your first job</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              Recent Applications
            </h2>
            <Link href="/hr/jobs" className="text-[#BF3131] text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((app: any, idx: number) => (
                  <div
                    key={idx}
                    className="group flex justify-between items-center p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-[#BF3131]/30 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-all duration-200"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {app.userName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#BF3131] transition-colors">
                        Applied for <span className="font-medium">{app.jobTitle}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, trend, trendUp, className }: any) {
  return (
    <div className={`p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${className || "bg-white dark:bg-[#121212] border-gray-200 dark:border-gray-800"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white dark:bg-[#121212] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">
        {title}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    draft: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    closed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    archived: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  };

  const statusKey = status.toLowerCase() as keyof typeof styles;
  const style = styles[statusKey] || styles.draft;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${style} capitalize`}>
      {status}
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900",
    reviewing: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900",
    interviewed: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900",
    offered: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900",
    rejected: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900",
  };

  const statusKey = status.toLowerCase() as keyof typeof styles;
  const style = styles[statusKey] || styles.pending;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${style} capitalize`}>
      {status}
    </span>
  );
}
