'use client';
import React from "react";

export default function CompanyInfoBox({ company }: { company: Company }) {
  return (
    <article className="card-interview flex items-start gap-4 w-full shadow p-4 relative transition-all duration-300">
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">About Company</h3>
        <div className="text-base text-gray-700 dark:text-white mb-4 italic min-h-[32px]">
          {company.description || "No description yet."}
        </div>
        <div className="space-y-2 text-base text-gray-700 dark:text-white">
          <div>
            <span className="font-medium">Name: </span>
            {company.name}
          </div>
          <div>
            <span className="font-medium">Followers: </span>
            {company.followers ?? 0}
          </div>
          <div>
            <span className="font-medium">Created At: </span>
            {company.createdAt
              ? new Date(company.createdAt).toLocaleDateString()
              : "N/A"}
          </div>
          <div>
            <span className="font-medium">Updated At: </span>
            {company.updatedAt
              ? new Date(company.updatedAt).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>
    </article>
  );
}