import { getCurrentUser } from "@/lib/actions/auth.action";
import { getJobById } from "@/lib/actions/general.action";
import { getJobApplicants } from "@/lib/actions/hr-applicants.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import ApplicantsList from "./ApplicantsList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicantsPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  const { id } = await params;
  const job = await getJobById(id);

  if (!job || job.postedBy !== user.id) {
    redirect("/hr/jobs");
  }

  const applicantsData = await getJobApplicants(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Applicants for {job.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {job.location} • {applicantsData.applicants?.length || 0} applicants
          </p>
        </div>
        <Link href="/hr/jobs" className="btn-secondary">
          Back to Jobs
        </Link>
      </div>

      {/* Applicants List */}
      <ApplicantsList
        jobId={id}
        applicants={applicantsData.applicants || []}
      />
    </div>
  );
}

