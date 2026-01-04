import { getCurrentUser } from "@/lib/actions/auth.action";
import { getHRJobs } from "@/lib/actions/hr-jobs.action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock, Search } from "lucide-react";
import JobActions from "./JobActions";
import PaginationControls from "@/components/shared/PaginationControls";
import { Badge } from "@/components/ui/badge";

export default async function HRJobsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const allJobs = await getHRJobs();
  
  // Pagination Logic
  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = 10;
  const totalPages = Math.ceil((allJobs?.length || 0) / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = allJobs?.slice(startIndex, endIndex) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job postings and track applicant status.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/hr/jobs/new">+ Create New Job</Link>
        </Button>
      </div>

      {/* Stats/Filter Placeholder (Optional enhancement area) */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121212] p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
           <span>Showing <strong>{currentJobs.length}</strong> of <strong>{allJobs?.length || 0}</strong> jobs</span>
        </div>
        {/* We can add a search bar here in future */}
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {currentJobs && currentJobs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Applicants
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Posted Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {currentJobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{job.title}</span>
                          <div className="flex items-center gap-4 mt-1">
                             <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {job.location}
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <Badge variant="outline" className="capitalize font-normal text-xs">
                          {job.jobType?.replace("-", " ") || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                           variant={job.status === "published" ? "default" : job.status === "closed" ? "destructive" : "secondary"}
                           className={`${
                            job.status === "published" 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 hover:text-green-800 border-green-200" 
                              : job.status === "closed" 
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 border-red-200"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 border-yellow-200"
                           } border rounded-full px-2.5 py-0.5 text-xs font-medium shadow-none`}
                        >
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/hr/jobs/${job.id}/applicants`} className="group flex items-center gap-2 hover:text-primary transition-colors">
                           <span className="font-medium">{(job.applicantCount || 0)}</span>
                           <span className="text-muted-foreground group-hover:text-primary">Candidates</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {new Date(job.createdAt || job.postedDate || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <JobActions job={job} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <PaginationControls currentPage={currentPage} totalPages={totalPages} />
            </div>
          </>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#121212]">
            <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No jobs found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {allJobs && allJobs.length > 0 ? "No jobs match your current page." : "You haven’t posted any jobs yet. Start hiring by creating your first job post."}
            </p>
            {(!allJobs || allJobs.length === 0) && (
              <Button asChild>
                <Link href="/hr/jobs/new">+ Create New Job</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

