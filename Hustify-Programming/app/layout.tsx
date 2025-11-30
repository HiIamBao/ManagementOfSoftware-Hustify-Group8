import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getCurrentUser } from "@/lib/actions/auth.action"; // <-- import hàm lấy user


const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hustify",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser(); // <-- lấy user từ server

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${monaSans.className} antialiased pattern`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
          {/* {user && <ChatDialog currentUser={user} />} */}
        </Providers>
      </body>
    </html>
  );
}