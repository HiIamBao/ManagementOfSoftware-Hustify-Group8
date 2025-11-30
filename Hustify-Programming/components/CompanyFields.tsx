'use client';
import React from "react";

export default function CompanyFields({ company }: { company: Company }) {
  const fields = company.fields || [];

  return (
    <article
      className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white relative"
      style={{ borderWidth: '1.5px' }}
    >
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">Fields</h3>
        {fields.length === 0 ? (
          <p className="text-base text-gray-400 mb-4 italic">
            No fields information available for this company.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fields.map((field, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-[#f3f4f6] text-[#626f47] font-semibold text-sm border border-[#e5e7eb]"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}