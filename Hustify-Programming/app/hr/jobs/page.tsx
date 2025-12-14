import { getCurrentUser } from "@/lib/actions/auth.action";
import { getHRJobs, deleteJob, publishJob, closeJob } from "@/lib/actions/hr-jobs.action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pencil, CheckCircle2, XCircle, Users, MoreVertical, Trash2 } from "lucide-react";
import JobActions from "./JobActions";

export default async function HRJobsPage() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const jobs = await getHRJobs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your job postings and applicants
          </p>
        </div>
        <Button asChild>
          <Link href="/hr/jobs/new">+ Create New Job</Link>
        </Button>
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {jobs && jobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Job Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold w-[200px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="capitalize">
                        {job.jobType?.replace("-", " ") || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          job.status === "published"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : job.status === "closed"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button asChild size="sm" variant="outline" className="rounded-full px-3">
                        <Link href={`/hr/jobs/${job.id}/applicants`}>
                          {(job.applicantCount || 0) + " applicants"}
                        </Link>
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(job.createdAt || job.postedDate || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <JobActions job={job} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#121212]">
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              You haven’t posted any jobs yet.
            </p>
            <Button asChild>
              <Link href="/hr/jobs/new">Create your first job</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

