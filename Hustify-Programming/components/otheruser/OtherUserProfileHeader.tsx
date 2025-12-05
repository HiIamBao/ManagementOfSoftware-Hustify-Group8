'use client';
import React, { useState } from "react";
import type { User } from "@/types";

export default function OtherUserProfileHeader({ user }: { user: User }) {
  const [imgError, setImgError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-[#7D0A0A] rounded-xl shadow mb-6 relative">
      {/* Cover image */}
      <div className="w-full h-[280px] bg-gray-200 rounded-t-xl overflow-hidden relative">
        <img
          src={coverError ? "/cover.jpg" : user.coverimg || "/cover.jpg"}
          alt="cover"
          className="w-full h-full object-cover"
          onError={() => setCoverError(true)}
        />
      </div>
      {/* Avatar + Info */}
      <div className="flex items-center px-8 pb-6 pt-0 relative">
        {/* Avatar chồng lên cover */}
        <div className="absolute -top-14 left-8">
          <img
            src={imgError ? "/profile.svg" : user.image || "/profile.svg"}
            alt="avatar"
            className="w-36 h-36 rounded-full border-4 border-white bg-white object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        {/* Info */}
        <div className="ml-40 flex-1 flex flex-col justify-center pt-8">
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl">{user.name}</span>
          </div>
          <div className="text-gray-700 dark:text-white">{user.email}</div>
        </div>
      </div>
    </div>
  );
}
