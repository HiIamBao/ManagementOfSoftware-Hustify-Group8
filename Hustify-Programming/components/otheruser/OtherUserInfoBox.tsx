'use client';
import { useState } from "react";
import type { User } from "@/types";

export default function OtherUserInfoBox({ user }: { user: User }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <article className="card-interview flex items-start gap-4 w-full shadow p-4 relative transition-all duration-300">
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">About</h3>
        <p className="text-base text-gray-700 dark:text-white mb-4 italic min-h-[32px]">
          {user.description || "No description yet."}
        </p>
        {showMore && (
          <div className="space-y-2 text-base text-gray-700 dark:text-white">
            <div><span className="font-medium">Full Name: </span>{user.name}</div>
            <div><span className="font-medium">Email: </span>{user.email}</div>
            <div><span className="font-medium">Phone Number: </span>{user.phone || "Not updated"}</div>
            <div><span className="font-medium">Birthday: </span>{user.birthday || "Not updated"}</div>
            <div><span className="font-medium">Address: </span>{user.address || "Not updated"}</div>
          </div>
        )}
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white dark:hover:bg-[#d14343]"
            style={{ borderWidth: 1.5 }}
            onClick={() => setShowMore((v) => !v)}
          >
            {showMore ? "Less" : "More"}
          </button>
        </div>
      </div>
    </article>
  );
}
