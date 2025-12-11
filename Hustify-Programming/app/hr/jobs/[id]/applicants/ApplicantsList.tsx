"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  updateApplicantStatus,
  addApplicantNotes,
  rateApplicant,
} from "@/lib/actions/hr-applicants.action";
import { Applicant } from "@/types";

interface ApplicantsListProps {
  jobId: string;
  applicants: (Applicant & { userName?: string; userEmail?: string })[];
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
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {applicant.userName || "Unknown"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {applicant.userEmail}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                </p>
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
              {/* Status Update */}
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

