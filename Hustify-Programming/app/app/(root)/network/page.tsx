import { Metadata } from "next";
import NetworkPageContent from "@/components/network/NetworkPageContent";

export const metadata: Metadata = {
  title: "Network | Hustify",
  description: "Connect with other professionals and grow your network.",
};

export default function NetworkPage() {
  return <NetworkPageContent />;
} 