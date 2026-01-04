"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shield, LayoutDashboard, Users, FileText, Briefcase, Mic } from "lucide-react";

export default function AdminNavigation() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "DASHBOARD", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/admin/users", label: "USERS", icon: <Users className="w-5 h-5" /> },
    { href: "/admin/jobs", label: "JOBS", icon: <Briefcase className="w-5 h-5" /> },
    { href: "/admin/interviews", label: "INTERVIEWS", icon: <Mic className="w-5 h-5" /> },
    { href: "/admin/blogs", label: "BLOGS", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="hidden md:flex space-x-6">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center px-2 py-1 text-xs font-medium transition-colors",
              isActive
                ? "text-[#BF3131] dark:text-white border-b-2 border-[#BF3131] dark:border-white"
                : "text-gray-600 dark:text-gray-400 hover:text-[#BF3131] dark:hover:text-white"
            )}
          >
            <span className="mb-0.5">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
