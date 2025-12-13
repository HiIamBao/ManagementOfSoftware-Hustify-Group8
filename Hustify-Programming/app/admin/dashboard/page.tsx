import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/actions/admin-users.action";
import { getAllBlogPosts, getBlogPostsStats } from "@/lib/actions/admin-blogs.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, FileText, TrendingUp, AlertCircle } from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "admin") {
    redirect("/");
  }

  // Fetch statistics
  const [usersResult, blogsResult, statsResult] = await Promise.all([
    getAllUsers({ page: 1, limit: 1 }),
    getAllBlogPosts({ page: 1, limit: 1 }),
    getBlogPostsStats(),
  ]);

  const totalUsers = usersResult.success && usersResult.pagination ? usersResult.pagination.total : 0;
  const totalBlogPosts = blogsResult.success && blogsResult.pagination ? blogsResult.pagination.total : 0;
  const blogStats = statsResult.success ? statsResult.stats : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview of system statistics and management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <Link href="/admin/users">
            <Button variant="link" className="p-0 mt-4 text-sm">
              View all users →
            </Button>
          </Link>
        </div>

        {/* Total Blog Posts */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Blog Posts
              </p>
              <p className="text-3xl font-bold">{totalBlogPosts}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <Link href="/admin/blogs">
            <Button variant="link" className="p-0 mt-4 text-sm">
              View all posts →
            </Button>
          </Link>
        </div>

        {/* Total Comments */}
        {blogStats && (
          <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Comments
                </p>
                <p className="text-3xl font-bold">{blogStats.totalComments}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Total Likes */}
        {blogStats && (
          <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Likes
                </p>
                <p className="text-3xl font-bold">{blogStats.totalLikes}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/users">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/blogs">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Manage Blog Posts
            </Button>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          System Status
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Database</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Authentication</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

