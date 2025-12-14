import { getCurrentUser } from "@/lib/actions/auth.action";
import { getCompanyById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import CompanyForm from "../CompanyForm";

export default async function EditCompanyPage() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "company-admin" || !user.companyId) {
    redirect("/hr/dashboard");
  }

  const company = await getCompanyById(user.companyId);

  if (!company) {
    return <div className="p-8">Company not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Company Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your company's public profile information
        </p>
      </div>

      <CompanyForm company={company} />
    </div>
  );
}

