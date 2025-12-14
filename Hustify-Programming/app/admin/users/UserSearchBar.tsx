"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserSearchBarProps {
  initialSearch?: string;
  role?: "normal" | "hr" | "admin";
  status?: "active" | "deactivated";
}

export default function UserSearchBar({ initialSearch = "", role, status }: UserSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    const query = params.toString();
    router.push(`/admin/users${query ? `?${query}` : ""}`);
  };

  const handleClear = () => {
    setSearch("");
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    const query = params.toString();
    router.push(`/admin/users${query ? `?${query}` : ""}`);
  };

  return (
    <div className="bg-white dark:bg-[#121212] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" size="default">
          Search
        </Button>
        {search && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </form>
    </div>
  );
}

