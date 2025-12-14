import CompanyRegistrationForm from "@/components/company/CompanyRegistrationForm";
import Link from "next/link";

export default function CompanyRegisterPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Register Your Company</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create a profile for your company and an admin account to manage it.
        </p>
      </div>

      <CompanyRegistrationForm />

      <div className="mt-6 text-center text-sm">
        <p>Already have an account? <Link href="/sign-in" className="text-[#BF3131] hover:underline">Sign In</Link></p>
        <p>Are you an HR professional looking to join an existing company? <Link href="/sign-up" className="text-[#BF3131] hover:underline">Sign up here</Link></p>
      </div>
    </div>
  );
}

