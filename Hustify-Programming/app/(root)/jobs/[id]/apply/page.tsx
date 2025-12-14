import { getCurrentUser } from "@/lib/actions/auth.action";
import { getJobById } from "@/lib/actions/general.action";
import ApplyFormClient from "../../ApplyFormClient";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Apply for {job.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{job.company?.name} · {job.location}</p>
        </div>
        <Link href={`/jobs/${job.id}`} className="text-[#BF3131] text-sm hover:underline">Back to job</Link>
      </div>

      <div className="bg-white dark:bg-[#121212] rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <ApplyFormClient jobId={job.id} userPrefill={{ name: user?.name, email: user?.email, phone: user?.phone }} />
      </div>
    </div>
  );
}

