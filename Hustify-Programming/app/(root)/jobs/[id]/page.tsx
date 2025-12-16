import { getJobById } from "@/lib/actions/general.action";
import { notFound } from "next/navigation";
import JobDetailClient from "../JobDetailClient";
import { Job } from "@/types";

// 1. Cập nhật Interface: params là Promise
interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage(props: JobDetailPageProps) {
  // 2. Await params trước khi sử dụng
  const params = await props.params;
  
  // Bây giờ mới được dùng params.id
  const job: Job | null = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} />;
}