import { Metadata } from "next";
import { BlogPageContent } from "@/components/blog/BlogPageContent";

export const metadata: Metadata = {
  title: "Blog Feed | Hustify",
  description: "Stay connected with your network and share your thoughts.",
};

export default function BlogPage() {
  return <BlogPageContent />;
}
