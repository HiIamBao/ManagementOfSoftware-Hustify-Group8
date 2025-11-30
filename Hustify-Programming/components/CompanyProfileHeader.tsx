'use client';
import React, { useState } from "react";

export default function CompanyProfileHeader({ company }: { company: Company }) {
  // Giả lập trạng thái follow, followers (bạn nên thay bằng API thực tế)
  const [followed, setFollowed] = useState(false);
  const [followers, setFollowers] = useState(company.followers ?? 0);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const handleFollow = () => {
    setFollowed(true);
    setFollowers(f => f + 1);
    // TODO: Gọi API follow ở đây nếu cần
  };

  const handleUnfollow = () => {
    setFollowed(false);
    setFollowers(f => (f > 0 ? f - 1 : 0));
    setShowUnfollowModal(false);
    // TODO: Gọi API unfollow ở đây nếu cần
  };

  return (
    <div className="w-full bg-white rounded-xl shadow mb-6 relative">
      {/* Cover image */}
      <div className="w-full h-[220px] bg-gray-200 rounded-t-xl overflow-hidden relative">
        <img
          src={company.coverimg || "/cover-company.jpg"}
          alt="cover"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Logo + Info */}
      <div className="flex items-center px-8 pb-6 pt-0 relative">
        {/* Logo chồng lên cover */}
        <div className="absolute -top-14 left-8">
          <img
            src={company.logo || "/profile.svg"}
            alt="company logo"
            className="w-36 h-36 rounded-full border-4 border-white bg-white object-cover"
          />
        </div>
        {/* Info */}
        <div className="ml-40 flex-1 flex flex-col justify-center pt-8">
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl">{company.name}</span>
          </div>
          <div className="text-gray-700 mt-1">{company.description}</div>
        </div>
        {/* Followers & Follow button */}
        <div className="flex flex-col items-end gap-2 ml-4 pt-8">
          <button
            className="btn-primary px-4 py-2 rounded-full font-semibold text-base"
            disabled
            tabIndex={-1}
          >
            {followers} Followers
          </button>
          {!followed ? (
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-base bg-white hover:bg-[#FFCCCC] transition"
              style={{ borderWidth: 1.5 }}
              onClick={handleFollow}
            >
              Follow
            </button>
          ) : (
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-white text-white font-semibold text-base bg-[#BF3131] hover:bg-[#a91f1f] transition"
              style={{ borderWidth: 1.5 }}
              onClick={() => setShowUnfollowModal(true)}
            >
              Followed
            </button>
          )}
        </div>
      </div>
      {/* Modal xác nhận unfollow */}
      {showUnfollowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 relative animate-fade-in flex flex-col items-center">
            <div className="font-bold text-lg mb-2 text-[#BF3131]">Are you sure to unfollow?</div>
            <div className="flex gap-4 mt-4">
              <button
                className="px-4 py-2 rounded-full bg-[#BF3131] text-white font-semibold hover:bg-[#a91f1f] transition"
                onClick={handleUnfollow}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold bg-white hover:bg-[#FFCCCC] transition"
                onClick={() => setShowUnfollowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}