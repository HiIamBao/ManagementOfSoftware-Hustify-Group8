"use client";

import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical, UserX, UserCheck, Shield, User as UserIcon } from "lucide-react";
import { updateUserRole, updateUserStatus } from "@/lib/actions/admin-users.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserManagementTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentPage: number;
}

export default function UserManagementTable({
  users,
  pagination,
  currentPage,
}: UserManagementTableProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"normal" | "hr" | "admin">("normal");
  const [newStatus, setNewStatus] = useState<"active" | "deactivated">("active");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const result = await updateUserRole(selectedUser.id, newRole);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setRoleDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const result = await updateUserStatus(selectedUser.id, newStatus);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setStatusDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Admin</Badge>;
      case "hr":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">HR</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">Normal</Badge>;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === "deactivated") {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Deactivated</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Active</Badge>;
  };

  return (
    <>
      <div className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.userRole)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
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
                            setSelectedUser(user);
                            setNewRole(user.userRole || "normal");
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setNewStatus(user.status || "active");
                            setStatusDialogOpen(true);
                          }}
                        >
                          {user.status === "deactivated" ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          )}
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
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={`/admin/users?page=${currentPage - 1}`}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {currentPage < pagination.totalPages && (
                <Link href={`/admin/users?page=${currentPage + 1}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(value) => setNewRole(value as "normal" | "hr" | "admin")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal User</SelectItem>
                <SelectItem value="hr">HR Recruiter</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === "deactivated" ? "Activate" : "Deactivate"} User
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === "deactivated"
                ? `Activate ${selectedUser?.name}'s account?`
                : `Deactivate ${selectedUser?.name}'s account? They will not be able to sign in.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as "active" | "deactivated")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

