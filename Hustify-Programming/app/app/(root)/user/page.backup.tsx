import { getCurrentUser } from "@/lib/actions/auth.action";
import UserInfoForm from "@/components/UserInfoForm";
import UserSkills from "@/components/UserSkills";
import UserExperience from "@/components/UserExperience";
import UserEducation from "@/components/UserEducation";
import UserProfileHeader from "@/components/UserProfileHeader";
import UserProjects from "@/components/UserProjects";

import React from "react";

export default async function UserPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div className="p-8">You need to log in to view your profile page.</div>;
  }

  return (
    <section className="card-cta blue-gradient dark:red-gradient-dark flex flex-col items-center">
      {/* Thông tin cá nhân */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col gap-6">
          {/* Anh nền avatar + tên + email */}
          <UserProfileHeader user={user} />
          </div>
          {/* Thông tin cá nhân chi tiết */}
          <div className="space-y-2">
            
            <UserInfoForm user={user} />
          </div>
      </div>

      {/* 3 article nằm dưới, luôn full width và responsive */}
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10">
        {/* Skills */}
        <UserSkills user={user} />
        {/* Experience */}
        <UserExperience user={user} />
        {/* Education */}
        <UserEducation user={user} />
        {/* Projects */}
        <UserProjects user={user} />
      </div>
    </section>
  );
}