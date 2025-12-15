"use client";

import React, { useState, useEffect } from "react";
import AddJobForm from "./AddJobForm";
import JobList from "./JobList";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Job } from "@/types";

interface JobsPageClientProps {
  jobs: Job[];
}

export default function JobsPageClient({
  jobs: initialJobs,
}: JobsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredJobs = initialJobs.filter((job) => {
    const query = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(query) ||
      job.company?.name?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query)
    );
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create new URLSearchParams object with current params
    const params = new URLSearchParams(searchParams);

    // Update or delete the search param
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    // Update the URL with the new search param
    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-8">
      <div className="bg-gray-50 dark:bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-lg shadow p-6 mb-8">
        <h1 className="text-sm font-bold mb-4 text-black dark:text-white">
          YOUR DREAM JOB IS HERE
        </h1>

        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            placeholder="Search jobs"
            className="flex-1 border border-gray-200 rounded-l p-2 focus:outline-none text-black dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#bf3131] dark:bg-[#7d0a0a] text-white p-2 rounded-r"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => console.log("Suggest jobs clicked")}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-sparkles"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
            </svg>
            Suggest Jobs
          </button>
        </form>
      </div>

      <JobList jobs={filteredJobs} />
    </section>
  );
}
