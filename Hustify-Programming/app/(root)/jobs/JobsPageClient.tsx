"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import JobList from "./JobList";
import { Job } from "@/types";

export default function JobsPageClient({ jobs }: { jobs: any[] }) {
  
  // 1. CHUẨN HÓA DỮ LIỆU (Thêm đoạn này để fix lỗi màn hình trắng)
  const safeJobs: Job[] = jobs.map((job) => ({
    ...job,
    benefits: job.benefits || [],
    responsibilities: job.responsibilities || [],
    requirements: job.requirements || [],
    company:
      job.company || {
        id: job.companyId || "unknown",
        name: job.companyName || "Unknown Company",
        logo: (job as any).companyLogo || undefined,
        description: (job as any).companyDescription || "",
        followers: (job as any).companyFollowers || 0,
      },
    applicantCount: job.applicantCount || (Array.isArray((job as any).applicants) ? (job as any).applicants.length : 0) || 0,
    postedDate: job.postedDate || (job as any).createdAt || new Date().toISOString(),
  }));
  // 2. States cho bộ lọc mới
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // 3. Logic Lọc Nâng Cao (Search + Location + Type)
  const filteredJobs = safeJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      locationFilter === "all" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    const jobType = job.jobType || "";
    const matchesType =
      typeFilter === "all" ||
      jobType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesLocation && matchesType;
  });

  const uniqueLocations = Array.from(new Set(safeJobs.map((j) => j.location).filter(Boolean)));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* THANH SEARCH & FILTER MỚI */}
      <div className="bg-white dark:bg-[#1A1C20] p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 space-y-4 md:space-y-0 md:flex md:gap-4 items-end">
        
        {/* Input Search */}
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by job title, company..."
              className="pl-9 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Select Location */}
        <div className="w-full md:w-[200px] space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="bg-transparent"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select Type */}
        <div className="w-full md:w-[200px] space-y-2">
          <label className="text-sm font-medium">Job Type</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-transparent"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={() => { setSearchQuery(""); setLocationFilter("all"); setTypeFilter("all"); }}>
          Clear
        </Button>
      </div>

      {/* DANH SÁCH KẾT QUẢ */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Found {filteredJobs.length} jobs</h2>
        <JobList jobs={filteredJobs} />
      </div>
    </div>
  );
}