"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Target,
  XCircle,
  Lightbulb,
  CheckCircle,
  X
} from "lucide-react";
import { toast } from "sonner";

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

interface CompareResult {
  matchScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

interface CVCompareProps {
  cvData?: ParsedCV | null;
  jobId?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobRequirements?: string[];
  jobResponsibilities?: string[];
  onCompareComplete?: (result: CompareResult) => void;
}

export default function CVCompare({
  cvData,
  jobId,
  jobTitle: initialJobTitle,
  jobDescription: initialJobDescription,
  jobRequirements: initialJobRequirements,
  jobResponsibilities: initialJobResponsibilities,
  onCompareComplete,
}: CVCompareProps) {
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useJobId] = useState(!!jobId);
  
  // Manual job description inputs
  const [jobTitle, setJobTitle] = useState(initialJobTitle || "");
  const [jobDescription, setJobDescription] = useState(initialJobDescription || "");
  const [jobRequirements, setJobRequirements] = useState<string[]>(
    initialJobRequirements || []
  );
  const [jobResponsibilities, setJobResponsibilities] = useState<string[]>(
    initialJobResponsibilities || []
  );
  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");

  const handleCompare = async () => {
    if (!cvData) {
      setError("Please scan a CV first");
      toast.error("No CV data available");
      return;
    }

    setIsComparing(true);
    setError(null);
    setCompareResult(null);

    try {
      const requestBody: any = {
        cv: cvData,
      };

      if (useJobId && jobId) {
        requestBody.jobId = jobId;
      } else {
        if (!jobTitle && !jobDescription && jobRequirements.length === 0) {
          setError("Please provide job title, description, or requirements");
          toast.error("Job information required");
          setIsComparing(false);
          return;
        }
        requestBody.jobTitle = jobTitle;
        requestBody.jobDescription = jobDescription;
        requestBody.jobRequirements = jobRequirements;
        requestBody.jobResponsibilities = jobResponsibilities;
      }

      const response = await fetch("/api/cv/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to compare CV");
      }

      setCompareResult(result.data);
      toast.success("CV comparison completed!");
      
      if (onCompareComplete) {
        onCompareComplete(result.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to compare CV";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsComparing(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setJobRequirements([...jobRequirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setJobRequirements(jobRequirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setJobResponsibilities([...jobResponsibilities, newResponsibility.trim()]);
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (index: number) => {
    setJobResponsibilities(jobResponsibilities.filter((_, i) => i !== index));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-[#BF3131]" />
        <h3 className="text-xl font-bold">Compare CV with Job</h3>
      </div>

      {!cvData && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div className="flex-1">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">
              Please scan a CV first to compare it with a job description.
            </p>
            <a
              href="/user"
              className="text-sm text-yellow-800 dark:text-yellow-300 underline font-medium"
            >
              Go to Profile to Scan CV →
            </a>
          </div>
        </div>
      )}

      {/* Job Input Section */}
      {!useJobId && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Full Stack Developer"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter the job description..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Requirements
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addRequirement()}
                placeholder="Add a requirement..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
              <Button
                type="button"
                onClick={addRequirement}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {jobRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                >
                  {req}
                  <button
                    onClick={() => removeRequirement(idx)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Responsibilities (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addResponsibility()}
                placeholder="Add a responsibility..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
              <Button
                type="button"
                onClick={addResponsibility}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {jobResponsibilities.map((resp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm"
                >
                  {resp}
                  <button
                    onClick={() => removeResponsibility(idx)}
                    className="hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {useJobId && jobId && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Comparing against job ID: <strong>{jobId}</strong>
          </p>
        </div>
      )}

      {/* Compare Button */}
      <Button
        onClick={handleCompare}
        disabled={isComparing || !cvData}
        className="w-full btn-primary"
      >
        {isComparing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Comparing...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 mr-2" />
            Compare CV
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {compareResult && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              Comparison completed!
            </p>
          </div>

          {/* Match Score */}
          <div
            className={`p-6 rounded-lg ${getScoreBgColor(compareResult.matchScore)} border-2`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold">Match Score</h4>
              <span
                className={`text-4xl font-bold ${getScoreColor(compareResult.matchScore)}`}
              >
                {compareResult.matchScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full ${
                  compareResult.matchScore >= 80
                    ? "bg-green-500"
                    : compareResult.matchScore >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${compareResult.matchScore}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          {compareResult.summary && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Summary
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {compareResult.summary}
              </p>
            </div>
          )}

          {/* Strengths */}
          {compareResult.strengths && compareResult.strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {compareResult.strengths.map((strength, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {compareResult.gaps && compareResult.gaps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Gaps & Missing Requirements
              </h4>
              <ul className="space-y-1">
                {compareResult.gaps.map((gap, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                  >
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {compareResult.recommendations &&
            compareResult.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {compareResult.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded"
                    >
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Matched Skills */}
          {compareResult.matchedSkills &&
            compareResult.matchedSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {compareResult.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Missing Skills */}
          {compareResult.missingSkills &&
            compareResult.missingSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {compareResult.missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </Card>
  );
}
