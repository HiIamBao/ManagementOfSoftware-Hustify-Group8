import { getCurrentUser } from "@/lib/actions/auth.action";
import { getJobById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import JobForm from "../../JobForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const { id } = await params;
  const job = await getJobById(id);

  if (!job || job.postedBy !== user.id) {
    redirect("/hr/jobs");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Job Posting</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update the job details below
        </p>
      </div>

      <JobForm initialData={job} jobId={id} />
    </div>
  );
}

