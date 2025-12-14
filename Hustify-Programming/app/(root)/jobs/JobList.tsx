"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createJobBasedInterview } from "@/lib/actions/general.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Job } from "@/types";

interface JobListProps {
  jobs: Job[];
}

const JobList = ({ jobs }: JobListProps) => {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  const openJobModal = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleInterview = async (job: Job) => {
    setProcessingJobId(job.id);
    try {
      const result = await createJobBasedInterview({
        jobId: job.id,
        role: job.title,
        company: job.company?.name || "Unknown Company",
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
      setProcessingJobId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {/* Phần tiêu đề JOBS FOR YOU - Nếu muốn bỏ luôn dòng này để giao diện sạch hơn, bạn có thể xóa khối div này */}
        <div className="flex items-center justify-center space-x-4 mb-8 mt-4">
          <div className="h-px bg-gray-300 flex-1"></div>
          <h2 className="text-center font-medium text-black dark:text-white text-sm px-2">
            JOBS FOR YOU
          </h2>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        {/* Danh sách Job chính */}
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 bg-white dark:bg-gradient-to-b from-[#1A1C20] to-[#08090D] rounded-lg border border-gray-100 shadow-sm flex items-start relative"
          >
            <div className="mr-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {job.company?.logo ? (
                  <Image
                    src={job.company.logo}
                    alt={job.company.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-400 dark:text-[#1212]">
                    {job?.company?.name?.charAt(0) || "J"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-sm text-gray-600 dark:text-white">
                {job.company?.name} · {job.location}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                <span>•</span>
                <span>{job.applicantCount || 0} applicants</span>
                {job.jobType && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{job.jobType.replace("-", " ")}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-white line-clamp-2 mt-1">
                {job.description}
              </p>
            </div>

            <div className="absolute right-4 top-1/3 -translate-y-1/2 flex flex-row gap-2">
              <Button
                className="btn-third"
                size="sm"
                onClick={() => handleInterview(job)}
                disabled={processingJobId === job.id}
              >
                {processingJobId === job.id ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3"
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
              </Button>
              <Button asChild className="btn-secondary" size="sm">
                <Link href={`/jobs/${job.id}/apply`}>APPLY</Link>
              </Button>
              <Button
                onClick={() => openJobModal(job)}
                className="btn-primary"
                size="sm"
              >
                MORE
              </Button>
            </div>
          </div>
        ))}
        
        {/* ĐÃ XÓA PHẦN NEW JOBS Ở ĐÂY */}
      </div>

      {/* Job Description Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedJob?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {selectedJob?.company?.logo ? (
                  <Image
                    src={selectedJob.company.logo}
                    alt={selectedJob.company.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {selectedJob?.company?.name?.charAt(0) || "J"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedJob?.company?.name}
                </h3>
                <p className="text-gray-600 dark:text-white">{selectedJob?.location}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-white">
                  <span>
                    Posted:{" "}
                    {selectedJob?.postedDate &&
                      new Date(selectedJob.postedDate).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{selectedJob?.applicantCount || 0} applicants</span>
                  {selectedJob?.jobType && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{selectedJob.jobType.replace("-", " ")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-lg mb-2">About the job</h4>
              <p className="whitespace-pre-line text-black dark:text-white">
                {selectedJob?.description}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-lg mb-2">Requirements</h4>
              <ul className="list-disc pl-5 space-y-1 text-black dark:text-white">
                {selectedJob?.requirements.map((req, idx) => (
                  <li className="text-black dark:text-white" key={idx}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                asChild
                className="btn-secondary"
              >
                <Link href={`/jobs/${selectedJob?.id}`}>APPLY</Link>
              </Button>
              <Button className="btn-third">
                INTERVIEW
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="ml-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobList;