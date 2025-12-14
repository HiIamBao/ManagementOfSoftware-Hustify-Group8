"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { applyToJob } from "@/lib/actions/general.action";

/* =========================
   Validation schema
========================= */
const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  cvLink: z.string().url("Please enter a valid public URL."),
  coverLetter: z.string().optional(),
});

interface ApplyJobDialogProps {
  jobTitle: string;
  jobId: string;
  trigger?: React.ReactNode;
}

/* =========================
   Component
========================= */
export function ApplyJobDialog({
  jobTitle,
  jobId,
  trigger,
}: ApplyJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      cvLink: "",
      coverLetter: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!jobId) {
        toast.error("Job ID not found.");
        return;
      }

      const result = await applyToJob({
        jobId,
        ...values,
      });

      if (result.success) {
        toast.success("Application submitted successfully.");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Apply</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        {/* ===== Header ===== */}
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold">
            Apply for {jobTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please fill out the information below.
          </DialogDescription>
        </DialogHeader>

        {/* ===== Form ===== */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-5"
          >
            {/* Full name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nguyen Van A"
                      className="text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@email.com"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+84 9xx xxx xxx"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CV link */}
            <FormField
              control={form.control}
              name="cvLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CV / Resume</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Public PDF link (Google Drive, Dropbox…)"
                      className="text-sm"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    PDF file shared via a public link
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover letter */}
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover letter</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[110px] text-sm leading-relaxed"
                      placeholder="Briefly explain why you are interested in this role."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
