import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { getAllJobsAdmin } from "@/lib/actions/admin-jobs.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import JobManagementTable from "./JobManagementTable";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; sortBy?: string; order?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.userRole !== "admin") redirect("/");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status as "draft" | "published" | "closed" | undefined;
  const sortBy = (params.sortBy as any) || "createdAt";
  const order = (params.order as any) || "desc";

  const result = await getAllJobsAdmin({ page, limit: 50, status, sortBy, order });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all jobs</p>
        </div>
      </div>

      {/* Sort + Status (combined) */}
      <div className="bg-white dark:bg-[#121212] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex gap-6 items-center flex-wrap">
          <Filter className="h-5 w-5 text-gray-500" />

          {/* Sort group */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
            <Link href={!status ? "/admin/jobs?sortBy=title&order=asc" : `/admin/jobs?status=${status}&sortBy=title&order=asc`}>
              <Button variant={sortBy === "title" && order === "asc" ? "default" : "outline"} size="sm">A → Z</Button>
            </Link>
            <Link href={!status ? "/admin/jobs?sortBy=title&order=desc" : `/admin/jobs?status=${status}&sortBy=title&order=desc`}>
              <Button variant={sortBy === "title" && order === "desc" ? "default" : "outline"} size="sm">Z → A</Button>
            </Link>
            <Link href={!status ? "/admin/jobs?sortBy=applicantCount&order=asc" : `/admin/jobs?status=${status}&sortBy=applicantCount&order=asc`}>
              <Button variant={sortBy === "applicantCount" && order === "asc" ? "default" : "outline"} size="sm">Applicants ↑</Button>
            </Link>
            <Link href={!status ? "/admin/jobs?sortBy=applicantCount&order=desc" : `/admin/jobs?status=${status}&sortBy=applicantCount&order=desc`}>
              <Button variant={sortBy === "applicantCount" && order === "desc" ? "default" : "outline"} size="sm">Applicants ↓</Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />

          {/* Status group */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <Link href={!sortBy ? "/admin/jobs" : `/admin/jobs?sortBy=${sortBy}&order=${order}`}>
              <Button variant={!status ? "default" : "outline"} size="sm">All</Button>
            </Link>
            <Link href={!sortBy ? "/admin/jobs?status=draft" : `/admin/jobs?status=draft&sortBy=${sortBy}&order=${order}`}>
              <Button variant={status === "draft" ? "default" : "outline"} size="sm">Draft</Button>
            </Link>
            <Link href={!sortBy ? "/admin/jobs?status=published" : `/admin/jobs?status=published&sortBy=${sortBy}&order=${order}`}>
              <Button variant={status === "published" ? "default" : "outline"} size="sm">Published</Button>
            </Link>
            <Link href={!sortBy ? "/admin/jobs?status=closed" : `/admin/jobs?status=closed&sortBy=${sortBy}&order=${order}`}>
              <Button variant={status === "closed" ? "default" : "outline"} size="sm">Closed</Button>
            </Link>
          </div>
        </div>
      </div>

      {result.success && result.jobs && result.pagination ? (
        <JobManagementTable jobs={result.jobs as any} pagination={result.pagination as any} currentPage={page} />
      ) : (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">{(result as any).message || "Failed to load jobs"}</p>
        </div>
      )}
    </div>
  );
}

