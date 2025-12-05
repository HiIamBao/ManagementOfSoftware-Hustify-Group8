'use client';
import { useState } from "react";
import type { User } from "@/types";
type ProjectItem = {
  image?: string;
  title: string;
  description: string;
  link: string;
};

export default function UserProjects({ user }: { user: User }) {
  const [projects, setProjects] = useState<ProjectItem[]>(user.projects || []);
  const [editing, setEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectItem>({
    image: "",
    title: "",
    description: "",
    link: "",
  });
  
  const [showAll, setShowAll] = useState(false);
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  const handleSave = async () => {
    if (!form.title || !form.description || !form.link) return;

    let newProjects: ProjectItem[] = [];

    if (editingIndex !== null) {
      // Case Edit: cập nhật vào vị trí editingIndex
      newProjects = projects.map((p, i) =>
        i === editingIndex ? { ...form } : p
      );
    } else {
      // Case Add mới:
      newProjects = [...projects, form];
    }

    // Cập nhật state
    setProjects(newProjects);
    // Reset form, trạng thái edit
    setForm({ image: "", title: "", description: "", link: "" });
    setEditing(false);
    setEditingIndex(null);

    // Gửi API lên fire sì to
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, projects: newProjects }),
    });
  };

  const handleDelete = async (idx: number) => {
    const newProjects = projects.filter((_, i) => i !== idx);
    setProjects(newProjects);
    setModalIdx(null);
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, projects: newProjects }),
    });
  };

  // Số project hiển thị trên 1 dòng
  const projectsToShow = showAll ? projects : projects.slice(0, 3);

  return (
    <article className="card-interview w-full p-4 border-black dark:border-white relative" style={{ borderWidth: '1.5px' }}>
      <div className="w-full">
        <div className="flex items-end justify-between mb-2">
          <h3 className="font-bold text-lg">Projects <span className="text-gray-400 font-normal text-base ml-2">{projects.length > 0 && `${Math.min(3, projects.length)} of ${projects.length}`}</span></h3>
        </div>
        {!editing ? (
          <>
            {projects.length === 0 ? (
              <>
                <p className="text-base text-gray-400 mb-4 italic">
                  No projects yet. Add your projects to showcase your work!
                </p>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
                  dark:hover:bg-[#d14343]"
                  style={{ borderWidth: 1.5 }}
                  onClick={() => setEditing(true)}
                >
                  Add Project
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-2">
                  {projectsToShow.map((proj, idx) => (
                    <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => setModalIdx(idx + (showAll ? 0 : 0))}>
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
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition mt-4 dark:bg-[#bf3131] dark:text-white dark:border-white 
                  dark:hover:bg-[#d14343]"
                  style={{ borderWidth: 1.5 }}
                  onClick={() => setEditing(true)}
                >
                  Add Project
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
              placeholder="Project Title*"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="input border-2 rounded-xl input-bordered p-2 min-h-[60px]"
              placeholder="Project Description*"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
            <input
              className="input border-2 rounded-xl input-bordered p-2"
              placeholder="Project Link*"
              value={form.link}
              onChange={e => setForm({ ...form, link: e.target.value })}
              required
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
          <path d="M6 6l8 8M6 14L14 6" stroke="#BF3131" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      <div className="flex flex-col items-center gap-3">
        <img
          src={projects[modalIdx].image?.trim() ? projects[modalIdx].image : "/github-icon.png"}
          alt={projects[modalIdx].title}
          className="w-32 h-32 object-cover rounded-xl mb-2"
        />
        <div className="font-bold text-xl mb-1 text-center">{projects[modalIdx].title}</div>
        <div className="text-gray-700 dark:text-white text-base mb-2 text-center">
          {projects[modalIdx].description}
        </div>
        <a
          href={projects[modalIdx].link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4DA8DA] underline text-sm break-all mb-3"
        >
          {projects[modalIdx].link}
        </a>

        {/*nút Edit Project và Delete */}
        <div className="flex gap-2">
  <button
    className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#626f47] text-[#626f47] font-semibold text-sm bg-white hover:bg-[#e4ffdb] transition dark:bg-[#626f47] dark:text-white dark:border-white 
    dark:hover:bg-[#4a5634]"
    style={{ borderWidth: 1.5 }}
    onClick={() => {
      // Đóng modal, load dữ liệu vào form và chuyển qua chế độ edit
      setModalIdx(null);
      setForm(projects[modalIdx]);
      setEditing(true);
      setEditingIndex(modalIdx);
    }}
  >
    Edit Project
  </button>

  <button
    className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
    dark:hover:bg-[#d14343]"
    style={{ borderWidth: 1.5 }}
    onClick={() => handleDelete(modalIdx)}
  >
    Delete Project
  </button>
</div>
      </div>
    </div>
  </div>
)}
      </div>
    </article>
  );
}
