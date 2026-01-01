"use client";

import { useState } from "react";
import CVScanner from "./CVScanner";
import CVCompare from "./CVCompare";
import type { User } from "@/types";

interface ParsedCV {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  summary?: string;
  skills?: string[];
  experiences?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    year: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
}

interface CVToolsProps {
  user: User;
}

export default function CVTools({ user }: CVToolsProps) {
  const [scannedCV, setScannedCV] = useState<ParsedCV | null>(null);

  const handleScanComplete = (cvData: ParsedCV) => {
    setScannedCV(cvData);
  };

  return (
    <div className="space-y-6">
      <CVScanner user={user} onScanComplete={handleScanComplete} />
      {scannedCV && (
        <CVCompare cvData={scannedCV} />
      )}
    </div>
  );
}
