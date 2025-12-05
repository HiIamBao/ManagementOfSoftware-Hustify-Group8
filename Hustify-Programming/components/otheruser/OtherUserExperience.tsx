'use client';
import type { User } from "@/types";

export default function OtherUserExperience({ user }: { user: User }) {
  const experiences: string[] =
    (user.experiences?.map((exp: any) => exp.title) as string[]) || [];

  return (
    <article
      className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white relative"
      style={{ borderWidth: '1.5px' }}
    >
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">Experience</h3>
        {experiences.length === 0 ? (
          <p className="text-base text-gray-400 mb-4 italic">
            This user hasn't added any experience yet.
          </p>
        ) : (
          <ul className="list-disc pl-4 mb-4">
            {experiences.map((exp, idx) => (
              <li key={idx} className="text-black dark:text-white">{exp}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
