"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OuterJobWithId extends OuterJob {
  id: string;
}

export default function OuterJobsPage() {
  const [jobs, setJobs] = useState<OuterJobWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/outer-jobs");
        const data = await response.json();
        
        if (data.success) {
          setJobs(data.jobs);
        } else {
          console.error("Failed to fetch jobs:", data.error);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(
    (job) =>
      job.detail_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof job.general_info === 'string' && job.general_info.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Outer Jobs</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Khám phá các cơ hội việc làm từ các công ty hàng đầu
        </p>

        {/* Search Bar */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên công việc, công ty hoặc tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Jobs List */}
          <div className="grid gap-6">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "Không tìm thấy công việc phù hợp"
                    : "Chưa có công việc nào"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredJobs.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  « First
                </Button>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  ‹ Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={currentPage === pageNum 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  Next ›
                </Button>
                <Button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  Last »
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} - {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Job Card Component
function JobCard({ job }: { job: OuterJobWithId }) {
  const [showDetail, setShowDetail] = useState(false);
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  // Extract company name from general_info or use a default
  const getCompanyName = () => {
    if (job.general_info && typeof job.general_info === 'string') {
      const lines = job.general_info.split("\n");
      return lines[0] || "Unknown Company";
    }
    return "Unknown Company";
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold dark:text-white mb-2">
            {job.detail_title || "No Title"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {getCompanyName()}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>📍 {job.detail_location || "N/A"}</span>
            <span>💼 {job.detail_experience || "N/A"}</span>
            {job.deadline && <span>⏰ Deadline: {formatDate(job.deadline)}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {job.detail_salary || "Thỏa thuận"}
          </p>
        </div>
      </div>

      {/* Job Description */}
      {job.desc_mota && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Mô tả công việc:
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
            {job.desc_mota}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowDetail((prev) => !prev)}
        >
          {showDetail ? "Ẩn chi tiết" : "Xem chi tiết"}
        </Button>
        {job.job_url && (
          <Link href={"http://topcv.vn/"+ job.job_url} target="_blank" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Ứng tuyển
            </Button>
          </Link>
        )}
        {/* {job.company_url_from_job && (
          <Link href={job.company_url_from_job} target="_blank" className="flex-1">
            <Button
              variant="outline"
              className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
            >
              Xem công ty
            </Button>
          </Link>
        )} */}
      </div>

      {/* Chi tiết công việc */}
      {showDetail && (
        <div className="mt-6 border-t pt-4">
          {job.desc_yeucau && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Yêu cầu:
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {job.desc_yeucau}
              </p>
            </div>
          )}
          {job.desc_quyenloi && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quyền lợi:
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {job.desc_quyenloi}
              </p>
            </div>
          )}
          {/* Tags */}
          {job.tags && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kỹ năng:
              </p>
              <div className="flex flex-wrap gap-3">
                {job.tags
                  .split(";")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {/* Working Info */}
          {(job.working_addresses || job.working_times) && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {job.working_addresses && (
                <p>📍 Địa chỉ làm việc: {job.working_addresses}</p>
              )}
              {job.working_times && (
                <p>🕐 Thời gian làm việc: {job.working_times}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
