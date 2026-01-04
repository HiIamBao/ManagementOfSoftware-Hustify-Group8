import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HRUserMenu from "@/components/hr/HRUserMenu";
import HRNavigation from "@/components/hr/HRNavigation";

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect non-HR users
  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* HR Navigation */}
      <nav className="bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/hr/dashboard" className="font-bold text-lg">
                HR Dashboard
              </Link>
              <HRNavigation userRole={user.userRole} />
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
              >
                Return to Main Site
              </Link>
              <HRUserMenu user={user as any} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

