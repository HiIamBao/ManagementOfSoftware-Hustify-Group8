'use client';
import type { User } from "@/types";

export default function OtherUserSkills({ user }: { user: User }) {
  const skills = user.skills || [];

  return (
    <article
      className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white"
      style={{ borderWidth: '1.5px' }}
    >
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">Skills & Endorsements</h3>
        {skills.length === 0 ? (
          <p className="text-base text-gray-400 mb-4 italic">
            This user hasn't added any skills yet.
          </p>
        ) : (
          <ul className="list-disc pl-4 mb-4">
            {skills.map((skill, idx) => (
              <li key={idx} className="text-black dark:text-white">{skill}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
