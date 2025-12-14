"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job } from "@/types";
import JobList from "@/app/(root)/jobs/JobList";

interface CompanyProfileTabsProps {
  description: string;
  jobs: Job[];
}

export default function CompanyProfileTabs({ description, jobs }: CompanyProfileTabsProps) {
  return (
    <Tabs defaultValue="about" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="about" className="mt-4">
        <div className="bg-white dark:bg-[#121212] rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">About Us</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{description}</p>
        </div>
      </TabsContent>
      <TabsContent value="jobs" className="mt-4">
        {jobs.length > 0 ? (
          <JobList jobs={jobs} />
        ) : (
          <div className="bg-white dark:bg-[#121212] rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">This company has no open job positions at the moment.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

