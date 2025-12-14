import { Metadata } from "next";
import Link from "next/link";
import { BlogPageContent } from "@/components/blog/BlogPageContent";
import { getCurrentUser } from "@/lib/actions/auth.action";

export const metadata: Metadata = {
  title: "Blog Feed | Hustify",
  description: "Stay connected with your network and share your thoughts.",
};

export default async function BlogPage() {
  const user = await getCurrentUser();
  const isHR = user?.userRole === "hr";

  return (
    <div className="space-y-6">
      {isHR && (
        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-red-100 text-[#BF3131] flex items-center justify-center dark:bg-red-900/20 dark:text-red-300">
                {/* Briefcase Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">HR tools are available</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Go to your HR dashboard to manage jobs and applicants.</p>
              </div>
            </div>
            <Link href="/hr/dashboard" className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-[#BF3131] text-[#BF3131] hover:bg-red-50 dark:hover:bg-red-900/20">
              Open HR Dashboard
            </Link>
          </div>
        </div>
      )}

      <BlogPageContent />
    </div>
  );
}
