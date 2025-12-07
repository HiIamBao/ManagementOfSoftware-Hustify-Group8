'use client';
import type { User } from "@/types";

type EducationItem = {
  school: string;
  className: string;
  year: string;
  description?: string;
  image?: string;
};

export default function OtherUserEducation({ user }: { user: User }) {
  const educations: EducationItem[] = user.education || [];

  return (
    <article
      className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white relative"
      style={{ borderWidth: '1.5px' }}
    >
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">Education</h3>
        {educations.length === 0 ? (
          <p className="text-base text-gray-400 mb-4 italic">
            This user hasn't added any education information yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {educations.map((edu, idx) => (
              <div key={idx} className="flex gap-4 items-start relative group">
                <img
                  src={
                    edu.image ||
                    "https://giaoduc247.vn/uploads/082021/images/bkhn.png"
                  }
                  alt="school"
                  className="h-24 max-w-[128px] object-contain"
                  style={{ borderRadius: 0 }}
                />
                <div className="flex-1">
                  <div className="font-semibold">{edu.school}</div>
                  <div className="text-sm text-gray-500">{edu.className}</div>
                  <div className="text-sm text-gray-500">{edu.year}</div>
                  {edu.description && (
                    <div className="text-sm mt-1">{edu.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
