"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFollowCompany } from "@/lib/actions/company.action";

interface FollowButtonProps {
  companyId: string;
  isFollowing: boolean;
  isLoggedIn: boolean;
}

export default function FollowButton({ companyId, isFollowing, isLoggedIn }: FollowButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFollow = async () => {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await toggleFollowCompany(companyId);
      if (result.success) {
        toast.success(result.message);
        router.refresh(); // Refreshes the page to update follower count and button state
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error following company:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button onClick={handleFollow} disabled={isSubmitting}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

