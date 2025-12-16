"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MoreVertical, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { updateJobStatusAdmin, deleteJobAdmin } from "@/lib/actions/admin-jobs.action";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface JobRow {
  id: string;
  title: string;
  company?: { id?: string; name?: string };
  applicantCount: number;
  status?: "draft" | "published" | "closed";
  createdAt?: string;
}

export default function JobManagementTable({
  jobs,
  pagination,
  currentPage,
}: {
  jobs: JobRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  currentPage: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const statusFilter = sp.get("status");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const badge = (s?: string) => {
    const cls = s === "published" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : s === "closed" ? "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    const label = s ? s[0].toUpperCase() + s.slice(1) : "Draft";
    return <Badge className={cls}>{label}</Badge>;
  };

  const updateStatus = async (id: string, s: "draft" | "published" | "closed") => {
    setBusyId(id);
    const res = await updateJobStatusAdmin(id, s);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else toast.error(res.message);
    setBusyId(null);
  };

  const del = async () => {
    if (!confirmId) return;
    setBusyId(confirmId);
    const res = await deleteJobAdmin(confirmId);
    if (res.success) {
      toast.success(res.message);
      router.refresh();
    } else toast.error(res.message);
    setBusyId(null);
    setConfirmId(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Applicants</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                  <td className="px-6 py-4 text-sm font-medium">{j.title}</td>
                  <td className="px-6 py-4 text-sm">{j.company?.name || "—"}</td>
                  <td className="px-6 py-4 text-sm">{j.applicantCount || 0}</td>
                  <td className="px-6 py-4">{badge(j.status)}</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          {busyId === j.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => updateStatus(j.id, "draft")}>Set Draft</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(j.id, "published")}>Publish</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(j.id, "closed")}>Close</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setConfirmId(j.id)} className="text-red-600">
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
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} jobs
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={`/admin/jobs?page=${currentPage - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {currentPage < pagination.totalPages && (
                <Link href={`/admin/jobs?page=${currentPage + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
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

