"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { deleteInterviewAdmin } from "@/lib/actions/admin-interviews.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InterviewRow {
  id: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  user?: { id?: string; name?: string; image?: string };
}

export default function InterviewManagementTable({
  interviews,
  pagination,
  currentPage,
}: {
  interviews: InterviewRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  currentPage: number;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const del = async () => {
    if (!confirmId) return;
    setBusyId(confirmId);
    const res = await deleteInterviewAdmin(confirmId);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else toast.error(res.message);
    setBusyId(null);
    setConfirmId(null);
  };

  const typeBadge = (t: string) => {
    const cls = t === "job-specific" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    const label = t.replace(/-/g, " ");
    return <Badge className={cls}>{label}</Badge>;
  };

  return (
    <>
      <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Topics</th>
                <th className="px-6 py-3 text-left text-sm font-semibold w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {interviews.map((iv) => (
                <tr key={iv.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                  <td className="px-6 py-4 text-sm font-medium">{iv.role || "—"}</td>
                  <td className="px-6 py-4">{typeBadge(iv.type || "general")}</td>
                  {/* User */}
                  <td className="px-6 py-4">
                    <Link href={`/user/${iv.user?.id || ""}`} className="flex items-center gap-3 hover:underline">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={iv.user?.image || ""} alt={iv.user?.name || "User"} />
                        <AvatarFallback>{(iv.user?.name || "U").slice(0,1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{iv.user?.name || iv.user?.id || "—"}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1 max-w-[480px]">
                      {(iv.techstack || []).slice(0, 5).map((t, i) => (
                        <Badge key={i} variant="secondary">{t}</Badge>
                      ))}
                      {(iv.techstack?.length || 0) > 5 && <span className="text-xs text-gray-500">+{(iv.techstack!.length - 5)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          {busyId === iv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setConfirmId(iv.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} interviews
            </div>
            <div className="flex gap-2">
              {/* Links built by the page via query params */}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interview</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={del} disabled={busyId === confirmId}>
              {busyId === confirmId ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Deleting...</> : <><CheckCircle2 className="h-4 w-4 mr-2"/>Confirm</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

