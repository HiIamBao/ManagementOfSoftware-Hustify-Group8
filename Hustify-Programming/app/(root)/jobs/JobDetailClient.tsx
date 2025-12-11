"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createJobBasedInterview } from "@/lib/actions/general.action";
import { Job } from "@/types";

// Client component that receives job data as props
export default function JobDetailClient({ job }: { job: Job }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const formatPostedDate = (dateString: string) => {
    const postedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  };

  const handleInterview = async () => {
    setIsGenerating(true);
    try {
      const result = await createJobBasedInterview({
        jobId: job.id,
        role: job.title,
        company: job.company.name,
        description: job.description,
        responsibilities: job.responsibilities || [],
        requirements: job.requirements || [],
      });

      if (result.success && result.interviewId) {
        toast.success("Interview created successfully!");
        router.push(`/interview/${result.interviewId}`);
      } else {
        toast.error(result.message || "Failed to create interview");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Job Header Section */}
      <section className="bg-gray-50 dark:bg-[#121212] rounded-lg p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between">
        {/* Rest of your component code */}
        <div className="flex flex-col lg:flex-row items-start gap-4">
          <div className="w-16 h-16 bg-white dark:bg-[#121212] flex-shrink-0 rounded shadow-sm overflow-hidden flex items-center justify-center">
            {job.logoUrl ? (
              <Image
                src={job.logoUrl}
                alt={`${job.company.name} logo`}
                width={56}
                height={56}
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#2c2c2c] text-gray-500 font-bold dark:text-white">
                {job.company.name?.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
            <div className="text-gray-600 text-sm mb-2">
              <span>{job.company.name}</span>
              <span className="mx-2">•</span>
              <span>{job.location}</span>
              <span className="mx-2">•</span>
              <span>
                {job.postedDate
                  ? formatPostedDate(job.postedDate)
                  : "Recently posted"}
              </span>
              <span className="mx-2">•</span>
              <span>{job.applicantCount || 0} people applied</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white">
              {job.company.description}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => handleInterview()}
            disabled={isGenerating}
            className="btn-third"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                CREATING
              </span>
            ) : (
              "INTERVIEW"
            )}
          </button>
          <Link
            href={job.recruitmentUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center"
          >
            APPLY
          </Link>
          <Link
            href="/jobs"
            className="btn-primary flex items-center justify-center"
          >
            BACK
          </Link>
        </div>
      </section>

      {/* Job Details Section */}
      <section className="mb-10">
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 uppercase">ABOUT THE JOBS</h2>
          <h3 className="text-lg font-medium mb-4">Job Purpose</h3>
          <ul className="list-disc pl-5 space-y-2">
            {job.responsibilities?.map((responsibility, index) => (
              <li key={index} className="text-gray-700 dark:text-white">
                {responsibility}
              </li>
            )) || (
              <>
                <li className="text-gray-700 dark:text-white">
                  Manage and monitor TDRM to ensure technology and digital risks
                  are managed and mitigated within risk limit
                </li>
                <li className="text-gray-700 dark:text-white">
                  Implement and monitor TDRM programs and activities to manage
                  technology and digital risks
                </li>
                <li className="text-gray-700 dark:text-white">
                  Develop TDRM policies, standards, regulations, procedures and
                  methodologies, risk taxonomies and respective mitigation
                  controls
                </li>
                <li className="text-gray-700 dark:text-white">
                  Support and participate in Technology via Digital innovation
                  and implementation
                </li>
                <li className="text-gray-700 dark:text-white">
                  Improve bankwide TDRM awareness and culture
                </li>
              </>
            )}
          </ul>
          <button className="text-[#BF3131] font-medium mt-4 hover:underline">
            SEE MORE
          </button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-10">
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 uppercase">
            BENEFITS FOUND IN JOB POST
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            {job.benefits?.map((benefit, index) => (
              <li key={index} className="text-gray-700 dark:text-white">
                {benefit}
              </li>
            )) || (
              <>
                <li className="text-gray-700 dark:text-white">
                  Medical insurance
                </li>
                <li className="text-gray-700 dark:text-white">High salary</li>
                <li className="text-gray-700 dark:text-white">
                  Vacation per year
                </li>
              </>
            )}
          </ul>
        </div>
      </section>

      {/* Company Section */}
      <section>
        <div className="bg-white dark:bg-[#121212] p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 uppercase">
            ABOUT THE COMPANY
          </h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white dark:bg-[#2c2c2c] flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
              {job.company.logo ? (
                <Image
                  src={job.company.logo}
                  alt={`${job.company.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#121212] text-gray-500 font-bold">
                  {job.company.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-bold">{job.company.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {job.company.followers || 3636} followers
              </p>
              <p className="text-sm text-gray-700 dark:text-white mb-4">
                About us:{" "}
                {job.company.description ||
                  "On Upwork you'll find a range of top freelancers and agencies, from developers and development agencies to designers and creative agencies, copywriters..."}
              </p>
              <button
                onClick={() => router.push(`/company/${job.company.id}`)}
                className="text-[#BF3131] font-medium hover:underline"
              >
                SEE MORE
              </button>

              <div className="mt-6">
                <Link
                  href={`/company/${job.company.id}`}
                  className="inline-block"
                >
                  <button className="border border-[#BF3131] text-[#BF3131] px-4 py-1 rounded flex items-center gap-1 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <span>+</span> FOLLOW
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
