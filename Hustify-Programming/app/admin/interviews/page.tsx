import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { getAllInterviewsAdmin } from "@/lib/actions/admin-interviews.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import InterviewManagementTable from "./InterviewManagementTable";

export default async function AdminInterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.userRole !== "admin") redirect("/");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const type = params.type as string | undefined;

  const result = await getAllInterviewsAdmin({ page, limit: 50, type });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interviews Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Review and manage generated interviews</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex gap-4 items-center flex-wrap">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex gap-2">
            <Link href={"/admin/interviews"}>
              <Button variant={!type ? "default" : "outline"} size="sm">All</Button>
            </Link>
            <Link href={"/admin/interviews?type=job-specific"}>
              <Button variant={type === "job-specific" ? "default" : "outline"} size="sm">Job-specific</Button>
            </Link>
            <Link href={"/admin/interviews?type=general"}>
              <Button variant={type === "general" ? "default" : "outline"} size="sm">General</Button>
            </Link>
          </div>
        </div>
      </div>

      {result.success && (result as any).interviews && (result as any).pagination ? (
        <InterviewManagementTable interviews={(result as any).interviews} pagination={(result as any).pagination} currentPage={page} />
      ) : (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">{(result as any).message || "Failed to load interviews"}</p>
        </div>
      )}
    </div>
  );
}

