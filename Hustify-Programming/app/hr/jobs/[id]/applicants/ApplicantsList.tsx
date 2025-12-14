"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  updateApplicantStatus,
  addApplicantNotes,
  rateApplicant,
} from "@/lib/actions/hr-applicants.action";
import { Applicant } from "@/types";

interface ApplicantsListProps {
  jobId: string;
  applicants: (Applicant & { userName?: string; userEmail?: string; user?: any })[];
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  reviewing:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
  interviewed:
    "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  offered: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
};

export default function ApplicantsList({
  jobId,
  applicants,
}: ApplicantsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleStatusChange = async (
    userId: string,
    newStatus: "pending" | "reviewing" | "interviewed" | "rejected" | "offered"
  ) => {
    const result = await updateApplicantStatus(jobId, userId, newStatus);
    if (result.success) {
      toast.success("Status updated");
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveNotes = async (userId: string) => {
    const result = await addApplicantNotes(jobId, userId, notes[userId] || "");
    if (result.success) {
      toast.success("Notes saved");
    } else {
      toast.error(result.message);
    }
  };

  const handleRating = async (userId: string, rating: number) => {
    const result = await rateApplicant(jobId, userId, rating);
    if (result.success) {
      setRatings({ ...ratings, [userId]: rating });
      toast.success("Rating saved");
    } else {
      toast.error(result.message);
    }
  };

  if (!applicants || applicants.length === 0) {
    return (
      <div className="bg-white dark:bg-[#121212] p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No applicants yet for this job
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applicants.map((applicant) => (
        <div
          key={applicant.userId}
          className="bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div
            className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
            onClick={() =>
              setExpandedId(
                expandedId === applicant.userId ? null : applicant.userId
              )
            }
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={applicant.user?.image} alt={applicant.userName || applicant.user?.name || "User"} />
                  <AvatarFallback>{(applicant.userName?.charAt(0) || applicant.user?.name?.charAt(0) || "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {applicant.userName || applicant.user?.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {applicant.userEmail}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    statusColors[applicant.status]
                  }`}
                >
                  {applicant.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  {expandedId === applicant.userId ? "▼" : "▶"}
                </button>
              </div>
            </div>
          </div>

          {expandedId === applicant.userId && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 space-y-6">
              {/* Applicant Profile */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Applicant Profile</label>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href={`/user/${applicant.userId}`}>View full profile</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p><span className="text-gray-500">Email:</span> {applicant.user?.email || applicant.userEmail || "N/A"}</p>
                    <p><span className="text-gray-500">Phone:</span> {applicant.user?.phone || "N/A"}</p>
                    <p><span className="text-gray-500">Address:</span> {applicant.user?.address || "N/A"}</p>
                    <p><span className="text-gray-500">Birthday:</span> {applicant.user?.birthday || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">About</p>
                    <p className="text-sm leading-relaxed line-clamp-3">
                      {applicant.user?.description || "No description provided."}
                    </p>
                  </div>
                </div>
                {Array.isArray(applicant.user?.skills) && applicant.user!.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {applicant.user!.skills.slice(0, 10).map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full border text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(applicant.user?.experiences) && applicant.user!.experiences.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm mb-1">Experience</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {applicant.user!.experiences.slice(0, 3).map((e: string, idx: number) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(applicant.user?.projects) && applicant.user!.projects.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm mb-1">Projects</p>
                    <ul className="space-y-1">
                      {applicant.user!.projects.slice(0, 2).map((p: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="font-medium">{p.title}</span>
                          {p.link && (
                            <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-[#BF3131] hover:underline">Visit</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Status Update */}
              {/* Application Details */}
              <div>
                <label className="text-sm font-medium block mb-3">Application</label>
                <div className="space-y-3 text-sm">
                  {(applicant.resumeUrl || (applicant as any).cvLink) && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Resume/CV:</span>
                      <a
                        href={(applicant as any).resumeUrl || (applicant as any).cvLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#BF3131] hover:underline"
                      >
                        Open resume
                      </a>
                    </div>
                  )}
                  {applicant.coverLetter && (
                    <div>
                      <p className="text-gray-500 mb-1">Cover letter</p>
                      <div className="p-3 border rounded bg-white dark:bg-[#0a0a0a] whitespace-pre-wrap">
                        {applicant.coverLetter}
                      </div>
                    </div>
                  )}
                  {Array.isArray((applicant as any).answers) && (applicant as any).answers.length > 0 && (
                    <div>
                      <p className="text-gray-500 mb-1">Form answers</p>
                      <ul className="space-y-2">
                        {(applicant as any).answers.map((qa: any, idx: number) => (
                          <li key={idx}>
                            <p className="font-medium">Q: {qa.question}</p>
                            <p className="text-gray-700 dark:text-gray-300">A: {qa.answer}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray((applicant as any).attachments) && (applicant as any).attachments.length > 0 && (
                    <div>
                      <p className="text-gray-500 mb-1">Attachments</p>
                      <ul className="space-y-1">
                        {(applicant as any).attachments.map((att: any, idx: number) => (
                          <li key={idx}>
                            <a href={att.url} target="_blank" rel="noreferrer" className="text-[#BF3131] hover:underline">
                              {att.name || att.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-3">
                  Change Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "pending",
                    "reviewing",
                    "interviewed",
                    "rejected",
                    "offered",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusChange(
                          applicant.userId,
                          status as any
                        )
                      }
                      className={`px-3 py-1 text-sm rounded border ${
                        applicant.status === status
                          ? "bg-gray-200 dark:bg-gray-700 border-gray-400"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-medium block mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(applicant.userId, star)}
                      className={`text-2xl ${
                        (ratings[applicant.userId] || applicant.rating || 0) >=
                        star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium block mb-2">Notes</label>
                <textarea
                  value={notes[applicant.userId] || applicant.notes || ""}
                  onChange={(e) =>
                    setNotes({
                      ...notes,
                      [applicant.userId]: e.target.value,
                    })
                  }
                  placeholder="Add your notes about this applicant..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
                  rows={4}
                />
                <button
                  onClick={() => handleSaveNotes(applicant.userId)}
                  className="mt-2 btn-secondary text-sm"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

