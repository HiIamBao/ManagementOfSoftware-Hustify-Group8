"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserMenu({ user }: { user: any }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.image]);
  return (
    <div className="flex items-center gap-3">
      {/* Hiển thị name và email */}
      <div className="flex flex-col items-end mr-2">
        <span className="font-semibold text-sm">{user?.name}</span>
        <span className="text-xs text-gray-500">{user?.email}</span>
      </div>
      {/* Nhấn vào avatar link đến trang cá nhân */}
      <Link href="/user" className="focus:outline-none">
        <img
          src={imgError ? "/profile.svg" : user?.image || "/profile.svg"}
          alt="User Avatar"
          width={40}
          height={40}
          className="rounded-full border-2 border-[#316FF6] bg-white"
          onError={() => setImgError(true)}
        />
      </Link>
    </div>
  );
}
