import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NetworkNavIndicator from "@/components/network/NetworkNavIndicator";

const baseNavLinks = [
  {
    href: "/",
    label: "FEED",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 11a9 9 0 0 1 9 9"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4a16 16 0 0 1 16 16"
        />
        <circle cx="5" cy="19" r="1" />
      </svg>
    ),
  },
  {
    href: "/network",
    label: "NETWORK",
    icon: (
      <span className="relative inline-flex">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <NetworkNavIndicator />
      </span>
    ),
  },
  {
    href: "/jobs",
    label: "JOBS",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7V5a3 3 0 00-6 0v2M3 9a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
      </svg>
    ),
  },
  {
    href: "/interviewentry",
    label: "INTERVIEW",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
  {
    href: "/notices",
    label: "NOTICES",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    href: "/roadmap",
    label: "ROADMAP",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.946l6-1.5a2 2 0 01.894 0l6 1.5A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.946L15 20m-6 0V4m6 16V4"
        />
      </svg>
    ),
  },
  {
    href: "/outer-jobs",
    label: "OUTER JOBS",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.946l6-1.5a2 2 0 01.894 0l6 1.5A2 2 0 0121 5.618v9.764a2 2 0 01-1.553 1.946L15 20m-6 0V4m6 16V4"
        />
      </svg>
    ),
  },
];

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  // Build nav links, append HR link if user is HR, append Admin link if user is admin
  const navLinks = [
    ...baseNavLinks,
    ...(user?.userRole === "hr"
      ? [
          {
            href: "/hr/dashboard",
            label: "HR",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7V5a3 3 0 016 0v2M4 9h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"
                />
              </svg>
            ),
          },
        ]
      : []),
    ...(user?.userRole === "admin"
      ? [
          {
            href: "/admin/dashboard",
            label: "ADMIN",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header user={user} navLinks={navLinks} />

      {/* Add padding to the top to account for fixed header */}
      <main className="flex-1 bg-gray-100 pt-16 dark:bg-[#2c2c2c]">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
