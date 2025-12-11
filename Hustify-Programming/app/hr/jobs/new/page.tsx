import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import JobForm from "../JobForm";

export default async function NewJobPage() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Job Posting</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Fill in the details below to create a new job posting
        </p>
      </div>

      <JobForm />
    </div>
  );
}

