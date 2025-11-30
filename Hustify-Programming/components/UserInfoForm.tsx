'use client';
import { useState } from "react";
import type { User } from "@/types";

export default function UserInfoBox({ user }: { user: User }) {
  const [showMore, setShowMore] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    birthday: user.birthday || "",
    address: user.address || "",
    description: user.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: user.id }),
    });
    setEditing(false);
  };

  return (
    <article className="card-interview flex items-start gap-4 w-full shadow p-4 relative transition-all duration-300">
      <div className="flex-1 w-full">
        <h3 className="font-bold text-lg mb-4">About</h3>
        {!editing ? (
          <>
            <p className="text-base text-gray-700 dark:text-white mb-4 italic min-h-[32px]">
              {form.description || "No description yet."}
            </p>
            {showMore && (
              <div className="space-y-2 text-base text-gray-700 dark:text-white">
                <div><span className="font-medium">Full Name: </span>{form.name}</div>
                <div><span className="font-medium">Email: </span>{user.email}</div>
                <div><span className="font-medium">Phone Number: </span>{form.phone || "Not updated"}</div>
                <div><span className="font-medium">Birthday: </span>{form.birthday || "Not updated"}</div>
                <div><span className="font-medium">Address: </span>{form.address || "Not updated"}</div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              className="input border-2 input-bordered p-2 min-h-[60px] w-full border border-gray-500 rounded-xl"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter your description..."
            />
            <label className="text-sm font-medium">Phone Number</label>
            <input
              name="phone"
              className="input border-2 input-bordered w-full border border-gray-500 rounded-xl py-2 px-3"
              value={form.phone}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">Birthday</label>
            <input
              name="birthday"
              type="date"
              className="input border-2 input-bordered w-full border border-gray-500 rounded-xl py-2 px-3"
              value={form.birthday}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">Address</label>
            <input
              name="address"
              className="input border-2 input-bordered w-full border border-gray-500 rounded-xl py-2 px-3"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        )}
        <div className="flex justify-end mt-4 gap-2">
          {!editing && (
            <>
              {showMore ? (
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#626f47] text-[#626f47] font-semibold text-sm bg-white hover:bg-[#e4ffdb] transition dark:bg-[#626f47] dark:text-white dark:border-white dark:hover:bg-[#4a5634]"
                  style={{ borderWidth: 1.5 }}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              ) : null}
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
                dark:hover:bg-[#d14343]"
                  style={{ borderWidth: 1.5 }}
                onClick={() => setShowMore((v) => !v)}
              >
                {showMore ? "Less" : "More"}
              </button>
            </>
          )}
          {editing && (
            <>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#626f47] text-[#626f47] font-semibold text-sm bg-white hover:bg-[#e4ffdb] transition"
                  style={{ borderWidth: 1.5 }}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition"
                style={{ borderWidth: 1.5 }}
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}