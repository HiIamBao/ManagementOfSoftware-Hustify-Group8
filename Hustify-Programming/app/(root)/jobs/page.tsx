import JobDetailPageClient from "./JobsPageClient";
import { getAllJobs } from "@/lib/actions/general.action";

export default async function JobsPage() {
  const jobs = await getAllJobs();

  return <JobDetailPageClient jobs={jobs} />;
}
