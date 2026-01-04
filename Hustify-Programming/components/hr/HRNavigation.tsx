"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { LayoutDashboard, Briefcase, BarChart3, Building2 } from "lucide-react";

type Props = {
  userRole?: string;
};

export default function HRNavigation({ userRole }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/hr/dashboard", label: "DASHBOARD", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/hr/jobs", label: "JOBS", icon: <Briefcase className="w-5 h-5" /> },
    { href: "/hr/analytics", label: "ANALYTICS", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  if (userRole === "company-admin") {
    links.push({ href: "/hr/company/edit", label: "PROFILE", icon: <Building2 className="w-5 h-5" /> });
  }

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
