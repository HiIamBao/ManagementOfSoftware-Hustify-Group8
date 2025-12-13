import { getCurrentUser } from "@/lib/actions/auth.action";
import { getAllUsers } from "@/lib/actions/admin-users.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Filter } from "lucide-react";
import UserManagementTable from "./UserManagementTable";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; status?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.userRole !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const role = params.role as "normal" | "hr" | "admin" | undefined;
  const status = params.status as "active" | "deactivated" | undefined;

  const result = await getAllUsers({ page, limit: 50, role, status });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all users in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#121212] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex gap-4 items-center flex-wrap">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex gap-2">
            <Link href={status ? `/admin/users?status=${status}` : "/admin/users"}>
              <Button variant={!role ? "default" : "outline"} size="sm">
                All Roles
              </Button>
            </Link>
            <Link href={status ? `/admin/users?role=normal&status=${status}` : "/admin/users?role=normal"}>
              <Button variant={role === "normal" ? "default" : "outline"} size="sm">
                Normal
              </Button>
            </Link>
            <Link href={status ? `/admin/users?role=hr&status=${status}` : "/admin/users?role=hr"}>
              <Button variant={role === "hr" ? "default" : "outline"} size="sm">
                HR
              </Button>
            </Link>
            <Link href={status ? `/admin/users?role=admin&status=${status}` : "/admin/users?role=admin"}>
              <Button variant={role === "admin" ? "default" : "outline"} size="sm">
                Admin
              </Button>
            </Link>
          </div>
          <div className="flex gap-2 ml-auto">
            <Link href={role ? `/admin/users?role=${role}&status=active` : "/admin/users?status=active"}>
              <Button variant={status === "active" ? "default" : "outline"} size="sm">
                Active
              </Button>
            </Link>
            <Link href={role ? `/admin/users?role=${role}&status=deactivated` : "/admin/users?status=deactivated"}>
              <Button variant={status === "deactivated" ? "default" : "outline"} size="sm">
                Deactivated
              </Button>
            </Link>
            {(role || status) && (
              <Link href="/admin/users">
                <Button variant="outline" size="sm">
                  Clear Filters
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {result.success && result.users && result.pagination ? (
        <UserManagementTable
          users={result.users}
          pagination={result.pagination}
          currentPage={page}
        />
      ) : (
        <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">{result.message || "Failed to load users"}</p>
        </div>
      )}
    </div>
  );
}

