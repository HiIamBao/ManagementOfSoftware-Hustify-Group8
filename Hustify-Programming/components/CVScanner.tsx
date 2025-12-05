"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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

interface CVScannerProps {
  user: User;
  onScanComplete?: (data: ParsedCV) => void;
}

export default function CVScanner({ user, onScanComplete }: CVScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCV | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOCX, or TXT file");
      toast.error("Unsupported file type");
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      toast.error("File too large");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParsedData(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cv/scan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to scan CV");
      }

      setParsedData(result.data);
      toast.success("CV scanned successfully!");
      
      if (onScanComplete) {
        onScanComplete(result.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to scan CV";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyToProfile = async () => {
    if (!parsedData) return;

    try {
      // Update user profile with parsed CV data
      const updateData: any = {};

      if (parsedData.name) updateData.name = parsedData.name;
      if (parsedData.phone) updateData.phone = parsedData.phone;
      if (parsedData.address) updateData.address = parsedData.address;
      if (parsedData.summary) updateData.description = parsedData.summary;
      if (parsedData.skills && parsedData.skills.length > 0) {
        updateData.skills = parsedData.skills;
      }
      if (parsedData.education && parsedData.education.length > 0) {
        updateData.education = parsedData.education.map((edu) => ({
          school: edu.school,
          className: edu.degree,
          year: edu.year,
          description: edu.description || "",
        }));
      }
      if (parsedData.projects && parsedData.projects.length > 0) {
        updateData.projects = parsedData.projects.map((proj) => ({
          title: proj.title,
          description: proj.description,
          link: proj.link || "",
        }));
      }

      // Convert experiences to the format expected by the app
      if (parsedData.experiences && parsedData.experiences.length > 0) {
        updateData.experiences = parsedData.experiences.map((exp) =>
          `${exp.title} at ${exp.company} (${exp.duration})${exp.description ? ` - ${exp.description}` : ""}`
        );
      }

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updateData, id: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      // Reload page to show updated data
      window.location.reload();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-[#BF3131]" />
        <h3 className="text-xl font-bold">Scan Your CV</h3>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-[#BF3131] bg-[#FFCCCC]/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop your CV here, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Supported formats: PDF, DOCX, TXT (Max 5MB)
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#BF3131]" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Scan Button */}
      {file && !parsedData && (
        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full btn-primary"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning CV...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Scan CV
            </>
          )}
        </Button>
      )}

      {/* Parsed Results */}
      {parsedData && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              CV scanned successfully!
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parsedData.name && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Name:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {parsedData.name}
                </p>
              </div>
            )}

            {parsedData.email && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {parsedData.email}
                </p>
              </div>
            )}

            {parsedData.phone && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {parsedData.phone}
                </p>
              </div>
            )}

            {parsedData.skills && parsedData.skills.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Skills:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {parsedData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsedData.experiences && parsedData.experiences.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Experience:
                </p>
                <div className="space-y-2">
                  {parsedData.experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <p className="text-sm font-medium">
                        {exp.title} at {exp.company}
                      </p>
                      <p className="text-xs text-gray-500">{exp.duration}</p>
                      {exp.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedData.education && parsedData.education.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Education:
                </p>
                <div className="space-y-2">
                  {parsedData.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <p className="text-sm font-medium">
                        {edu.degree} from {edu.school}
                      </p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Apply to Profile Button */}
          <Button
            onClick={handleApplyToProfile}
            className="w-full btn-primary mt-4"
          >
            Apply to Profile
          </Button>
        </div>
      )}
    </Card>
  );
}







