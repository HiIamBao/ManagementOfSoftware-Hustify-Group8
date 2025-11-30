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
    return <div className="p-8">You need to log in to view your profile page. Or please check your internet connection.</div>;
  }

  return (
    <section className="bg-gray-100 dark:bg-[#2C2C2C] flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-7xl flex flex-row gap-8">
        {/* Cột trái: thông tin user */}
        <div className="flex-1 min-w-0 pl-10">
          <div className="flex flex-col gap-1">
            <UserProfileHeader user={user} />
            {/* Tabs điều hướng profile */}
            <div className="w-full flex justify-start mt-1 mb-4">
              <div className="flex w-full max-w-4xl">
                <button
                  className="px-8 py-3 font-semibold text-white bg-[#BF3131] rounded-t-lg shadow-sm dark:bg-[#7d0a0a]"
                  style={{ minWidth: 160 }}
                  disabled
                >
                  PROFILE
                </button>
                <button
                  className="px-8 py-3 font-semibold text-[#333] bg-white rounded-t-lg  border-l-0 border border-[gray-200] border-[#E5E7EB] dark:dark-gradient dark:border-[white] dark:text-white"
                  style={{ minWidth: 160 }}
                  disabled
                >
                  ACTIVITY & INTERESTS
                </button>
                <button
                  className="px-8 py-3 font-semibold text-[#333] bg-white rounded-t-lg  border-l-0 border border-[gray-200] border-[#E5E7EB] dark:dark-gradient dark:border-[white] dark:text-white"
                  style={{ minWidth: 160 }}
                  disabled
                >
                  ARTICLES (3)
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <UserInfoForm user={user} />
          </div>
          <div className="w-full flex flex-col gap-6 mt-10">
            <UserProjects user={user} />
            <UserSkills user={user} />
            <UserExperience user={user} />
            <UserEducation user={user} />
          </div>
        </div>
        {/* Cột phải: quảng cáo doanh nghiệp */}
<div className="w-[340px] flex flex-col gap-6 pt-2">
  {/* Premium Upsell */}
  <div className="bg-gradient-to-tr from-[#BF3131] to-[#ff6b6b] rounded-2xl p-5 shadow-xl flex flex-col items-center text-white relative overflow-hidden animate-pulse">
    <div className="absolute -top-8 -right-8 opacity-30 text-[120px] pointer-events-none select-none">★</div>
    <div className="flex items-center gap-2 mb-2">
      <svg width={32} height={32} viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2l2.39 7.19H22l-5.8 4.21L17.59 22 12 17.27 6.41 22l1.39-8.6L2 9.19h7.61z"/>
      </svg>
      <span className="font-bold text-xl tracking-wide drop-shadow">Go Premium!</span>
    </div>
    <div className="text-base mb-3 text-center">
      Unlock all features, boost your visibility, and connect with top employers. <br />
      <span className="font-semibold">Try Premium for free today!</span>
    </div>
    <a
      href="https://www.facebook.com/haianhant/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition"
      style={{ borderWidth: 1.5 }}
    >
      Start Free Trial
    </a>
  </div>

  {/* Quảng cáo doanh nghiệp 1 */}
  <a
    href="https://www.linkedin.com/company/example"
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-xl overflow-hidden shadow-lg hover:scale-105 transition border-2 bg-white dark:bg-gradient-to-b from-[#1A1C20] to-[#08090D]"
  >
    <img
      src="https://media.istockphoto.com/id/1472905256/photo/technology-background-microchip-on-a-circuit-board-with-a-red-data-rays-hacking-attack-concept.jpg?s=612x612&w=0&k=20&c=CLnWmjq1nzykSEM7ajyWU-KlwFJmSPfm7Ny-TAPk19w="
      alt="See who's hiring on Hustify"
      className="w-full h-auto object-cover"
    />
    <div className="p-3">
      <div className="font-bold text-[#BF3131] text-lg">See who's hiring!</div>
      <div className="text-sm text-gray-700 dark: text-white">Discover new opportunities at top companies. Click to learn more.</div>
    </div>
  </a>

  {/* Quảng cáo doanh nghiệp 2 */}
  <a
    href="https://openai.com/careers"
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-xl overflow-hidden shadow-lg hover:scale-105 transition border-2 bg-white dark:bg-gradient-to-b from-[#1A1C20] to-[#08090D]"
  >
    <img
      src="https://i.pinimg.com/736x/01/8e/22/018e220499e7548612cfbbc3997bc152.jpg"
      alt="Work at OpenAI"
      className="w-full h-auto object-cover bg-white"
    />
    <div className="p-3">
      <div className="font-bold text-[#BF3131] text-lg">Careers at OpenAI</div>
      <div className="text-sm text-gray-700 dark:text-white">Help build safe and beneficial AI. Explore OpenAI job openings!</div>
    </div>
  </a>

  {/* Quảng cáo doanh nghiệp 3 */}
  <a
    href="https://www.google.com/careers"
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-xl overflow-hidden shadow-lg hover:scale-105 transition border-2  bg-white dark:bg-gradient-to-b from-[#1A1C20] to-[#08090D]"
  >
    <img
      src="https://i.pinimg.com/736x/90/91/6c/90916c7db7f95db8837be5a51314231e.jpg"
      alt="Work at Google"
      className="w-full h-auto object-cover"
    />
    <div className="p-3">
      <div className="font-bold text-[#BF3131] text-lg">Careers at Google</div>
      <div className="text-sm text-gray-700 dark:text-white">Innovate, create, and grow. Explore Google jobs today.</div>
    </div>
  </a>
</div>
      </div>
    </section>
  );
}