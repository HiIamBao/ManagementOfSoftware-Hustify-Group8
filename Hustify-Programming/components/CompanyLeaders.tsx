'use client';
import React from "react";

export default function CompanyLeaders({ company }: { company: Company }) {
  const leaders = company.leaders || [];

  if (!leaders.length) {
    return (
      <article className="card-interview w-full p-4 border-black dark:border-white relative" style={{ borderWidth: '1.5px' }}>
        <h3 className="font-bold text-lg mb-4">Leaders</h3>
        <p className="text-base text-gray-400 italic">No leaders information available.</p>
      </article>
    );
  }

  return (
    <article className="card-interview w-full p-4 border-black dark:border-white relative" style={{ borderWidth: '1.5px' }}>
      <h3 className="font-bold text-lg mb-4">Leaders</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {leaders.map((leader, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow">
              <img
                src={leader.image?.trim() ? leader.image : "/user-avatar.jpg"}
                alt={leader.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 font-semibold text-base text-center w-full truncate">{leader.name}</div>
            <div className="text-sm text-gray-500 text-center w-full truncate">{leader.major}</div>
            {leader.description && (
              <div className="text-xs text-gray-400 text-center mt-1 w-full line-clamp-2">{leader.description}</div>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}