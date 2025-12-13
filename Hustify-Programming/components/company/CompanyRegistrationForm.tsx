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
import { registerCompanyAndAdmin } from "@/lib/actions/company.action";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyIndustry: z.string().optional(),
  companyDescription: z.string().optional(),
  userName: z.string().min(2, "Your name is required"),
  userEmail: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function CompanyRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyIndustry: "",
      companyDescription: "",
      userName: "",
      userEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await registerCompanyAndAdmin(data);
      if (result.success) {
        toast.success(result.message);
        router.push("/sign-in");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Company Details</h3>
          <FormField control={form.control} name="companyName" label="Company Name" />
          <FormField control={form.control} name="companyIndustry" label="Industry" placeholder="e.g., Technology" />
          <FormField control={form.control} name="companyDescription" label="Company Description" type="textarea" />
        </div>

        <div className="space-y-4 p-6 border rounded-lg">
          <h3 className="text-lg font-semibold">Your Admin Account</h3>
          <FormField control={form.control} name="userName" label="Full Name" />
          <FormField control={form.control} name="userEmail" label="Email Address" type="email" />
          <FormField control={form.control} name="password" label="Password" type="password" />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Create Company and Account"}
        </Button>
      </form>
    </Form>
  );
}

