import { getJobById } from "@/lib/actions/general.action";
import { notFound } from "next/navigation";
import JobDetailClient from "../JobDetailClient"; // Import the client component
import { Job } from "@/types";

interface JobDetailPageProps {
  params: { id: string };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job: Job | null = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  // Pass the job data to the client component
  return <JobDetailClient job={job} />;
}
