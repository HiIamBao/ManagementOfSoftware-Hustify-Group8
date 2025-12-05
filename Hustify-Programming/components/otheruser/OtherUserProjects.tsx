'use client';
import { useState } from "react";
import type { User } from "@/types";

type ProjectItem = {
  image?: string;
  title: string;
  description: string;
  link: string;
};

export default function OtherUserProjects({ user }: { user: User }) {
  const [showAll, setShowAll] = useState(false);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const projects: ProjectItem[] = user.projects || [];
  const projectsToShow = showAll ? projects : projects.slice(0, 3);

  return (
    <article className="card-interview w-full p-4 border-black dark:border-white relative" style={{ borderWidth: '1.5px' }}>
      <div className="w-full">
        <div className="flex items-end justify-between mb-2">
          <h3 className="font-bold text-lg">
            Projects{" "}
            <span className="text-gray-400 font-normal text-base ml-2">
              {projects.length > 0 && `${Math.min(3, projects.length)} of ${projects.length}`}
            </span>
          </h3>
        </div>
        {projects.length === 0 ? (
          <p className="text-base text-gray-400 mb-4 italic">
            No projects to display.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-2">
              {projectsToShow.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => setModalIdx(idx + (showAll ? 0 : 0))}
                >
                  <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow hover:scale-105 transition">
                    <img
                      src={proj.image?.trim() ? proj.image : "/github-icon.png"}
                      alt={proj.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 font-semibold text-base text-center w-full truncate">{proj.title}</div>
                </div>
              ))}
            </div>
            {projects.length > 3 && !showAll && (
              <button
                className="text-[#bf3131] font-semibold text-sm mt-2 hover:underline"
                onClick={() => setShowAll(true)}
              >
                SHOW ALL ({projects.length})
              </button>
            )}
            {showAll && projects.length > 3 && (
              <button
                className="text-[#bf3131] font-semibold text-sm mt-2 hover:underline"
                onClick={() => setShowAll(false)}
              >
                SHOW LESS
              </button>
            )}
          </>
        )}

        {/* Modal hiển thị chi tiết project */}
        {modalIdx !== null && projects[modalIdx] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-[#2c2c2c] rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-[#BF3131] hover:bg-[#FFCCCC] rounded-full p-1 transition"
                onClick={() => setModalIdx(null)}
                title="Close"
              >
                <svg width={22} height={22} viewBox="0 0 20 20" fill="none">
                  <path d="M6 6l8 8M6 14L14 6" stroke="#BF3131" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="flex flex-col items-center gap-3">
                <img
                  src={projects[modalIdx].image?.trim() ? projects[modalIdx].image : "/github-icon.png"}
                  alt={projects[modalIdx].title}
                  className="w-32 h-32 object-cover rounded-xl mb-2"
                />
                <div className="font-bold text-xl mb-1 text-center">{projects[modalIdx].title}</div>
                <div className="text-gray-700 dark:text-white text-base mb-2 text-center">{projects[modalIdx].description}</div>
                <a
                  href={projects[modalIdx].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm break-all mb-3"
                >
                  {projects[modalIdx].link}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
