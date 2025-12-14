"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { applyToJob } from "@/lib/actions/general.action";

interface ApplyFormClientProps {
  jobId: string;
  userPrefill?: { name?: string; email?: string; phone?: string };
}

export default function ApplyFormClient({ jobId, userPrefill }: ApplyFormClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(userPrefill?.name || "");
  const [email, setEmail] = useState(userPrefill?.email || "");
  const [phone, setPhone] = useState(userPrefill?.phone || "");
  const [cvLink, setCvLink] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast.error("Please enter your full name and email");
      return;
    }
    setSubmitting(true);
    try {
      const result = await applyToJob({ jobId, fullName, email, phone, cvLink, coverLetter });
      if (result.success) {
        toast.success("Application submitted");
        router.push(`/jobs/${jobId}`);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Full name</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(+84) ..." />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Resume / CV link</label>
        <Input value={cvLink} onChange={(e) => setCvLink(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm font-medium">Cover letter</label>
        <Textarea rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write a short message..." />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit application"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

