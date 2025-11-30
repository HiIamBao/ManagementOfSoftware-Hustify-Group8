"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";
import { User } from "@/types";

interface HeaderProps {
  user: User | null;
  navLinks: {
    href: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

const Header = ({ user, navLinks }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in"); // Redirect to sign-in page after logout
      router.refresh(); // Refresh the page to update the authentication state
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-[#121212] border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Left side with Logo and Navigation */}
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <div className="w-11 h-11 rounded flex items-center justify-center bg-[#BF3131]">
                <span className="text-white font-bold text-xl">hu</span>
              </div>
            </div>
          </Link>

          {/* Vertical Divider */}
          <div className="h-10 w-px bg-gray-200 mx-4"></div>

          {/* Main Navigation */}
          <nav className="flex items-center">
            <ul className="flex space-x-6 list-none">
              {navLinks.map((link) => (
                <li key={link.href} className="list-none">
                  <Link
                    href={link.href}
                    className={`flex flex-col items-center px-2 py-1 text-xs font-medium 
                    ${
                      pathname === link.href
                        ? "text-[#BF3131] dark:text-white border-b-2 border-[#BF3131] dark:border-white"
                        : "text-gray-600 dark:text-gray-300 hover:text-[#BF3131] dark:hover:text-white"
                    }`}
                  >
                    <span className="mb-0.5">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search - moved closer to navigation */}
          <div className="relative flex items-center ml-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#BF3131] dark:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-3 py-2 w-64 border border-gray-200 rounded-md bg-gray-50 dark:bg-[#bf3131] focus:outline-none focus:ring-1 focus:ring-[#BF3131] focus:border-[#BF3131] text-sm"
            />
          </div>
        </div>

        {/* User Profile on the right */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{user?.name || "User"}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-[#BF3131] text-left hover:underline cursor-pointer"
            >
              LOG OUT
            </button>
          </div>
          <Link href="/user" className="focus:outline-none">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {user?.image ? (
                <img
                  src={user?.image || "/profile.svg"}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-[#bf3131] bg-white"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-600">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
