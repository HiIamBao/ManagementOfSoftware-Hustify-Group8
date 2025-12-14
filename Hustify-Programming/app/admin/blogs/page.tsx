import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAllBlogPosts } from "@/lib/actions/admin-blogs.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import BlogPostsTable from "./BlogPostsTable";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; authorId?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const authorId = params.authorId;

  const result = await getAllBlogPosts({ page, limit: 50, authorId });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all blog posts in the system
          </p>
        </div>
      </div>

      {/* Blog Posts Table */}
      {result.success && result.posts && result.pagination ? (
        <BlogPostsTable
          posts={result.posts}
          pagination={result.pagination}
          currentPage={page}
        />
      ) : (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">{result.message || "Failed to load blog posts"}</p>
        </div>
      )}
    </div>
  );
}

