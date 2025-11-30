'use client';
import { useState } from "react";
import type { User } from "@/types";

type EducationItem = {
  school: string;
  className: string;
  year: string;
  description?: string;
  image?: string;
};

export default function UserEducation({ user }: { user: User }) {
  const [educations, setEducations] = useState<EducationItem[]>(user.education || []);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EducationItem>({
    school: "",
    className: "",
    year: "",
    description: "",
    image: "",
  });
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null); //add

  // Thêm education mới
  const handleSave = async () => {
    if (!form.school || !form.className || !form.year) return;
    const newEducations = [...educations, form];
    setEducations(newEducations);
    setForm({ school: "", className: "", year: "", description: "", image: "" });
    setEditing(false);

    // Gọi API lưu education mới lên Firestore
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, education: newEducations }),
    });
  };

  // Xóa education
  const handleRemove = async (idx: number) => {
    const newEducations = educations.filter((_, i) => i !== idx);
    setEducations(newEducations);
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, education: newEducations }),
    });
  };

  return (
    <article className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white relative"
      style={{ borderWidth: '1.5px' }}>
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">Education</h3>
        {!editing ? (
          <>
            {educations.length === 0 ? (
              <>
                <p className="text-base text-gray-400 mb-4 italic">
                  Please provide additional educational background information to help employers better understand your academic qualifications and professional foundation.
                </p>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
                dark:hover:bg-[#d14343]"
                  style={{ borderWidth: 1.5 }}
                  onClick={() => setEditing(true)}
                >
                  Add Education
                </button>
              </>
            ) : (
              <>
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
                      {/* Nút xóa (icon) đặt ngang hàng, nổi bên phải */}
                      <button
  className="ml-2 mt-1 text-[#BF3131] hover:bg-[#FFCCCC] rounded-full p-1 transition flex items-center justify-center"
  title="Remove"
  onClick={() => setConfirmIndex(idx)}
>
  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <path d="M6 6l8 8M6 14L14 6" stroke="#BF3131" strokeWidth="2" strokeLinecap="round" />
  </svg>
</button>
                      {confirmIndex === idx && (
                        <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-80 dark:dark-gradient flex items-center justify-center z-10">
                          <div className="bg-white dark:bg-[#2c2c2c] p-4 rounded-lg shadow-lg text-center">
                            <p className="text-sm mb-4">Are you sure you want to remove this education?</p>
                            <div className="flex justify-center gap-2">
                              <button
                                className="px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
                dark:hover:bg-[#d14343]"
                                onClick={() => {
                                  handleRemove(idx);
                                  setConfirmIndex(null);
                                }}
                              >
                                Yes
                              </button>
                              <button
                                className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm bg-white hover:bg-gray-100 transition dark:bg-[#3a3a3a] dark:text-white dark:border-white 
                dark:hover:bg-[#4a4a4a]"
                                onClick={() => setConfirmIndex(null)}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition mt-4 dark:bg-[#bf3131] dark:text-white dark:border-white 
                  dark:hover:bg-[#d14343]"
                  style={{ borderWidth: 1.5 }}
                  onClick={() => setEditing(true)}
                >
                  Add Education
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <input
              className="input border-2 rounded-xl input-bordered p-2"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
            />
            <input
              className="input border-2 rounded-xl input-bordered p-2"
              placeholder="University/School Name* (example: HUST University)"
              value={form.school}
              onChange={e => setForm({ ...form, school: e.target.value })}
              required
            />
            <input
              className="input border-2 rounded-xl input-bordered p-2"
              placeholder="Major/Class Name* (example: ICT02 - K67)"
              value={form.className}
              onChange={e => setForm({ ...form, className: e.target.value })}
              required
            />
            <input
              className="input border-2 rounded-xl input-bordered p-2"
              placeholder="Year of admission* (example: 2022-2026)"
              value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
              required
            />
            <textarea
              className="input border-2 rounded-xl input-bordered p-2 min-h-[60px]"
              placeholder="Description (Optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#626f47] text-[#626f47] font-semibold text-sm bg-white hover:bg-[#e4ffdb] transition dark:bg-[#626f47] dark:text-white dark:border-white 
                dark:hover:bg-[#4a5634]"
                style={{ borderWidth: 1.5 }}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
                dark:hover:bg-[#d14343]"
                style={{ borderWidth: 1.5 }}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}