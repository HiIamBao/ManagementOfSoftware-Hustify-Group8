'use client';
import React from "react";

export default function CompanySpotlight({ company }: { company: Company }) {
  const spotlightJobs = company.spotlightJobs || [];

  return (
    <article
      className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white"
      style={{ borderWidth: '1.5px' }}
    >
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">Spotlight Jobs</h3>
        {spotlightJobs.length === 0 ? (
          <p className="text-base text-gray-400 mb-4 italic">
            No spotlight jobs available at the moment.
          </p>
        ) : (
          <ul className="list-disc pl-4 mb-4">
            {spotlightJobs.map((job, idx) => (
              <li key={job.id || idx} className="text-black dark:text-white">
                <span className="font-semibold">{job.title}</span>
                {job.location && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({job.location})
                  </span>
                )}
                {job.recruitmentUrl && (
                  <a
                    href={job.recruitmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-[#BF3131] underline text-sm"
                  >
                    Apply
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}