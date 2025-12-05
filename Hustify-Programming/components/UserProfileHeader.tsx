'use client';
import DarkModeToggle from "@/components/DarkModeToggle";
import { useState } from "react";
import type { User } from "@/types";

export default function UserProfileHeader({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState(user.name || "");
  const [displayImage, setDisplayImage] = useState(user.image || "");
  const [displayCover, setDisplayCover] = useState(user.coverimg || "/cover.jpg");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [coverimg, setCoverimg] = useState(user.coverimg || "/cover.jpg");
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-[#7D0A0A] rounded-xl shadow mb-6 relative">
      {/* Cover image */}
      <div className="w-full h-[280px] bg-gray-200 rounded-t-xl overflow-hidden relative">
        <img
          src={coverError ? "/cover.jpg" : displayCover}
          alt="cover"
          className="w-full h-full object-cover"
          onError={() => setCoverError(true)}
        />
        {/* Nút edit profile*/}
        <button
          className="absolute top-4 right-4 bg-white dark:bg-black rounded-full p-2 shadow"
          onClick={() => setOpen(true)}
          title="Edit Profile"
        >
          <svg width={20} height={20} fill="#bf3131" viewBox="0 0 20 20"><path d="M2 14.5V18h3.5l10.06-10.06-3.5-3.5L2 14.5zm15.71-9.21a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.5 3.5 1.83-1.83z"/></svg>
        </button>
      </div>
      {/* Avatar + Info */}
      <div className="flex items-center px-8 pb-6 pt-0 relative">
        {/* Avatar chồng lên cover */}
        <div className="absolute -top-14 left-8">
          <img
            src={imgError ? "/profile.svg" : displayImage || "/profile.svg"}
            alt="avatar"
            className="w-36 h-36 rounded-full border-4 border-white bg-white object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        {/* Info */}
        <div className="ml-40 flex-1 flex flex-col justify-center pt-8">
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl">{displayName}</span>
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#BF3131] dark:text-white dark:hover:bg-[#7D0A0A]"
              style={{ borderWidth: 1.5 }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" className="fill-[#BF3131] dark:fill-white"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8c0 4.41-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              Verify
            </button>
          </div>
          <div className="text-gray-700 dark:text-white">{user.email}</div>
        </div>
        <DarkModeToggle user={user}/>
      </div>
      {/* Modal edit */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[400px] shadow-lg flex flex-col gap-4">
            <h2 className="font-bold text-lg mb-2">Edit Your Profile</h2>
            <label className="text-base font-medium italic">New Name</label>
            <input
              className="input input-bordered w-full mb-2 border-2 border-gray-400 rounded-xl py-3 px-4 text-base"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <label className="text-base font-medium italic">New Avatar URL</label>
            <input
              className="input input-bordered w-full mb-2 border-2 border-gray-400 rounded-xl py-3 px-4 text-base"
              value={image}
              onChange={e => {
                setImage(e.target.value);
                setImgError(false);
              }}
            />
            <label className="text-base font-medium italic">New Cover Image URL</label>
            <input
              className="input input-bordered w-full mb-2 border-2 border-gray-400 rounded-xl py-3 px-4 text-base"
              value={coverimg}
              onChange={e => {
                setCoverimg(e.target.value);
                setCoverError(false);
              }}
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition"
                style={{ borderWidth: 1.5 }}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#626f47] text-[#626f47] font-semibold text-sm bg-white hover:bg-[#e4ffdb] transition"
                style={{ borderWidth: 1.5 }}
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await fetch("/api/user/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id, name, image, coverimg }),
                  });
                  setDisplayName(name);
                  setDisplayImage(image);
                  setDisplayCover(coverimg);
                  setLoading(false);
                  setOpen(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
