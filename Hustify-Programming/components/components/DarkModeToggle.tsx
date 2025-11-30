'use client';
import { User } from "@/types";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DarkModeToggle({ user }: { user: User }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);

  // Only show the toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Initialize currentTheme from localStorage or user preference
    const savedTheme = localStorage.getItem('theme') || (user?.darkmode ? 'dark' : 'light');
    setCurrentTheme(savedTheme);
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      setCurrentTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const handleToggle = async () => {
    try {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Update local state first
      setCurrentTheme(newTheme);
      setTheme(newTheme);
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Update user preference in the database
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, darkmode: newTheme === 'dark' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme preference');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert changes if update fails
      setCurrentTheme(currentTheme);
      setTheme(currentTheme || 'light');
      localStorage.setItem('theme', currentTheme || 'light');
    }
  };

  // Return empty div with same dimensions during SSR to avoid layout shift
  if (!mounted) {
    return <div className="w-[104px] h-6" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-700 text-sm dark:text-white">
        {currentTheme === 'dark' ? "Dark Mode" : "Light Mode"}
      </span>
      <button
        className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ease-in-out ${
          currentTheme === 'dark' ? "bg-black" : "bg-gray-300"
        }`}
        onClick={handleToggle}
        aria-label="Toggle dark mode"
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transform transition-all duration-300 ease-in-out ${
            currentTheme === 'dark' ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}