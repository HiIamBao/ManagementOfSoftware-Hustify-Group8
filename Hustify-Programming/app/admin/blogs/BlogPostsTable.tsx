"use client";

import { useState } from "react";
import { BlogPost } from "@/types/blog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreVertical, Trash2 } from "lucide-react";
import { deleteBlogPost } from "@/lib/actions/admin-blogs.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BlogPostsTableProps {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentPage: number;
}

export default function BlogPostsTable({
  posts,
  pagination,
  currentPage,
}: BlogPostsTableProps) {
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedPost) return;

    setIsDeleting(true);
    try {
      const result = await deleteBlogPost(selectedPost.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setDeleteDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Post</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Likes</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Comments</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="font-medium line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {post.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {post.author.image && (
                        <img
                          src={post.author.image}
                          alt={post.author.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium">{post.author.name}</div>
                        <div className="text-xs text-gray-500">{post.author.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {post.likes?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {post.comments?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(post.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPost(post);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} posts
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={`/admin/blogs?page=${currentPage - 1}`}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {currentPage < pagination.totalPages && (
                <Link href={`/admin/blogs?page=${currentPage + 1}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

