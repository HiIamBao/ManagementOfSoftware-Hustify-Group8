"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getRecommendedJobs } from "@/lib/actions/general.action";

import JobList from "./JobList";
import { Job } from "@/types";

// Số lượng job hiển thị trên mỗi trang
const ITEMS_PER_PAGE = 5;

export default function JobsPageClient({ jobs }: { jobs: any[] }) {

  // 1. CHUẨN HÓA DỮ LIỆU
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

  // 2. States cho bộ lọc và phân trang
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // States for job recommendations
  const [isRecommendationMode, setIsRecommendationMode] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter, typeFilter]);

  // Determine which jobs to filter based on recommendation mode
  const jobsToFilter = isRecommendationMode ? recommendedJobs : safeJobs;

  // 3. Logic Lọc Nâng Cao
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

  // Filter recommended jobs with the same logic when in recommendation mode
  const filteredRecommendedJobs = isRecommendationMode
    ? jobsToFilter.filter((job) => {
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
      })
    : [];

  // Use recommended jobs when in recommendation mode, otherwise use existing filteredJobs
  const finalFilteredJobs = isRecommendationMode ? filteredRecommendedJobs : filteredJobs;

  // 4. Logic Phân Trang
  const totalPages = Math.ceil(finalFilteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedJobs = finalFilteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const uniqueLocations = Array.from(new Set(safeJobs.map((j) => j.location).filter(Boolean)));

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler for getting job recommendations
  const handleGetRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const recommendations = await getRecommendedJobs(10);
      if (recommendations.length === 0) {
        toast.info("No recommendations found. Please update your profile with skills and experiences.");
        setIsLoadingRecommendations(false);
        return;
      }
      setRecommendedJobs(recommendations);
      setIsRecommendationMode(true);
      setCurrentPage(1);
      toast.success(`Found ${recommendations.length} recommended jobs for you!`);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast.error("Failed to get job recommendations. Please try again.");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Handler for showing all jobs (exit recommendation mode)
  const handleShowAllJobs = () => {
    setIsRecommendationMode(false);
    setCurrentPage(1);
    setSearchQuery("");
    setLocationFilter("all");
    setTypeFilter("all");
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* THANH SEARCH & FILTER */}
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
        {isRecommendationMode ? (
          <Button
            variant="outline"
            onClick={handleShowAllJobs}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Show All Jobs
          </Button>
        ) : (
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
            onClick={handleGetRecommendations}
            disabled={isLoadingRecommendations}
          >
            {isLoadingRecommendations ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Recomend Jobs
              </>
            )}
          </Button>
        )}
      </div>

      {/* DANH SÁCH KẾT QUẢ */}
      <div className="mt-6">
        {/* Đã xóa đoạn thẻ h2 hiển thị chữ Found jobs ở đây */}

        {/* Recommendation Banner */}
        {isRecommendationMode && (
          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Recommended Jobs for You
                </h3>
              </div>
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                {recommendedJobs.length} jobs found
              </span>
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
              These jobs match your skills, experiences, and profile.
            </p>
          </div>
        )}

        {/* Empty State Message */}
        {finalFilteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {isRecommendationMode
                ? "No recommended jobs found. Try updating your profile with more skills and experiences."
                : "No jobs found matching your criteria."}
            </p>
          </div>
        ) : (
          <JobList jobs={paginatedJobs} />
        )}

        {/* UI PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="text-sm font-medium mx-4">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}