"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { updateCompanyProfile } from "@/lib/actions/hr-company.action";
import { Company } from "@/types";

const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companyProfileSchema>;

interface CompanyFormProps {
  company: Company;
}

export default function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: company.name || "",
      description: company.description || "",
      website: company.website || "",
      industry: company.industry || "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateCompanyProfile(data);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while updating the profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="name" label="Company Name" />
          <FormField control={form.control} name="industry" label="Industry" placeholder="e.g., Technology, Finance" />
          <FormField control={form.control} name="website" label="Website URL" placeholder="https://example.com" />
          <FormField control={form.control} name="description" label="Company Description" type="textarea" />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

