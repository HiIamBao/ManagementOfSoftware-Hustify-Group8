"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField as ShadcnFormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { createJob, updateJob, publishJob } from "@/lib/actions/hr-jobs.action";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  responsibilities: z.string().min(10, "Responsibilities are required"),
  requirements: z.string().min(10, "Requirements are required"),
  benefits: z.string().optional(),
  recruitmentUrl: z.string().url().optional().or(z.literal("")),
  jobType: z.enum(["full-time", "part-time", "remote"]).default("full-time"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: any;
  jobId?: string;
}

export default function JobForm({ initialData, jobId }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      location: initialData?.location || "",
      description: initialData?.description || "",
      responsibilities: initialData?.responsibilities?.join("\n") || "",
      requirements: initialData?.requirements?.join("\n") || "",
      benefits: initialData?.benefits?.join("\n") || "",
      recruitmentUrl: initialData?.recruitmentUrl || "",
      jobType: initialData?.jobType || "full-time",
    },
  });

  const onSubmit = async (data: JobFormData, andPublish = false) => {
    setIsSubmitting(true);
    try {
      const jobData = {
        title: data.title,
        location: data.location,
        description: data.description,
        responsibilities: data.responsibilities.split("\n").filter(r => r.trim()),
        requirements: data.requirements.split("\n").filter(r => r.trim()),
        benefits: data.benefits ? data.benefits.split("\n").filter(b => b.trim()) : [],
        recruitmentUrl: data.recruitmentUrl || "",
        jobType: data.jobType,
      };

      let result;
      let newJobId = jobId;

      if (jobId) {
        result = await updateJob(jobId, jobData);
      } else {
        result = await createJob(jobData);
        if (result.jobId) {
          newJobId = result.jobId;
        }
      }

      if (result.success && newJobId && andPublish) {
        const publishResult = await publishJob(newJobId);
        if (publishResult.success) {
          toast.success("Job saved and published successfully!");
        } else {
          toast.error(`Job saved, but failed to publish: ${publishResult.message}`);
        }
        router.push("/hr/jobs");
      } else if (result.success) {
        toast.success(result.message);
        router.push("/hr/jobs");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while saving the job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = () => {
    form.handleSubmit((data) => onSubmit(data, true))();
  };

  return (
    <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            label="Job Title"
            placeholder="e.g., Senior React Developer"
            type="text"
          />

          <FormField
            control={form.control}
            name="location"
            label="Location"
            placeholder="e.g., San Francisco, CA"
            type="text"
          />

          <FormField
            control={form.control}
            name="jobType"
            label="Job Type"
            placeholder="Select a job type"
            type="select"
            options={[
              { value: "full-time", label: "Full-time" },
              { value: "part-time", label: "Part-time" },
              { value: "remote", label: "Remote" },
            ]}
          />

          <FormField
            control={form.control}
            name="description"
            label="Job Description"
            placeholder="Describe the job in detail..."
            type="textarea"
          />

          <FormField
            control={form.control}
            name="responsibilities"
            label="Responsibilities (one per line)"
            placeholder="• Develop features&#10;• Code reviews&#10;• Team collaboration"
            type="textarea"
          />

          <FormField
            control={form.control}
            name="requirements"
            label="Requirements (one per line)"
            placeholder="• 5+ years experience&#10;• React expertise&#10;• TypeScript knowledge"
            type="textarea"
          />

          <FormField
            control={form.control}
            name="benefits"
            label="Benefits (one per line)"
            placeholder="• Competitive salary&#10;• Health insurance&#10;• Remote work"
            type="textarea"
          />

          <FormField
            control={form.control}
            name="recruitmentUrl"
            label="Recruitment URL (Optional)"
            placeholder="https://example.com/apply"
            type="text"
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="btn">
              {isSubmitting ? "Saving..." : jobId ? "Update Job" : "Create Job"}
            </Button>
            {jobId && initialData?.status === 'draft' && (
              <Button type="button" onClick={handlePublish} disabled={isSubmitting} className="btn-secondary">
                {isSubmitting ? "Publishing..." : "Save and Publish"}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

