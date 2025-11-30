'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";

const SignOutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Đăng xuất khỏi Firebase
    signOut(auth).then(() => {
      router.replace("/sign-in");
    });
  }, [router]);

  return <div>Signing out...</div>;
};

export default SignOutPage;