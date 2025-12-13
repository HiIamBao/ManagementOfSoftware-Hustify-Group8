"use client";

import { useState } from "react";
import MermaidChart from "./MermaidChart";
import { Roadmap, RoadmapNode, RoadmapRole } from "@/types";

const generateMermaidDiagram = (nodes: RoadmapNode[]): string => {
  if (!nodes || nodes.length === 0) return "";

  let diagram = "flowchart TD\n";

  nodes.forEach((node, index) => {
    const nodeId = `node${index}`;
    const nextNodeId = `node${index + 1}`;
    const safeName = node.name.replace(/["\[\]]/g, "");
    if (node.links) {
      diagram += `    ${nodeId}(\"${safeName}\"):::clickable\n`;
      diagram += `    click ${nodeId} \"${node.links}\" _blank\n`;
    } else {
      diagram += `    ${nodeId}(\"${safeName}\"):::yellow\n`;
    }
    if (index < nodes.length - 1) {
      diagram += `    ${nodeId} --> ${nextNodeId}\n`;
    }
  });
  diagram += ` classDef yellow fill:#ffd700,stroke:#333,stroke-width:2px,color:#000,font-size:24px\n`;
  diagram += ` classDef clickable fill:#ffd700,stroke:#333,stroke-width:2px,color:#000,font-size:24px,cursor:pointer\n`;
  return diagram;
};

export default function UserGeneratedRoadmap() {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    goals: "",
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(() => {
    if (typeof window !== "undefined") {
      const savedRoadmap = localStorage.getItem("userRoadmap");
      return savedRoadmap ? JSON.parse(savedRoadmap) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRoadmap(null);
    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to generate roadmap");
      }
      const data = await response.json();
      if (data.success && data.roadmap) {
        setRoadmap(data.roadmap);
      } else {
        throw new Error(data.error || "Failed to generate roadmap");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full">
      {!roadmap && (
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto p-0">
            {!roadmap && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
                  Generate Your Custom Roadmap
                </h1>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 bg-white p-6 rounded-lg shadow dark:bg-[#242222]">
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300 ">
                      Desired Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder="e.g., Frontend Developer, Data Scientist"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Current Experience Level
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., Beginner, Intermediate"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="goals"
                      className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                      Your Goals
                    </label>
                    <textarea
                      id="goals"
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      placeholder="Describe your career goals and what you want to achieve"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#bf3131] text-white py-3 px-6 rounded-md hover:bg-[#7d0a0a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Generating..." : "Generate Roadmap"}
                  </button>
                </form>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="">
        {roadmap && (
          <div className="flex w-full">
            {/* Diagram Section */}
            <div className="flex-1 bg-white dark:bg-[#121212] rounded-lg shadow p-6 overflow-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                {roadmap.name}
              </h2>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  Visual Roadmap
                </h3>
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-white dark:bg-[#2c2c2c] rounded-lg shadow p-6 overflow-auto">
                    <MermaidChart
                      diagram={generateMermaidDiagram(roadmap.nodes)}
                      nodes={roadmap.nodes}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Tips Section */}
            <div className="w-120 bg-white dark:bg-[#2c2c2c] shadow-lg p-6">
              <div className="mb-6">
                <span className="bg-[#bf3131] text-black px-3 py-1 rounded text-xl font-medium">
                  Important Tip
                </span>
              </div>

              {roadmap && (
                <div className="space-y-6">
                  {/* Tips */}
                  {roadmap.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="text-gray-700 text-lg dark:text-white leading-relaxed">
                      {tip}
                    </div>
                  ))}

                  {/* Node Details */}
                  <div className="space-y-4">
                    {roadmap.nodes.map((node, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-400 pl-4">
                        <div className="font-medium text-gray-800 dark:text-gray-500 mb-1 flex items-center gap-2">
                          {node.name}
                          {node.links && (
                            <a
                              href={node.links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 dark:text-white text-sm">
                              🔗
                            </a>
                          )}
                        </div>
                        <div className="text-gray-900 text-lg dark:text-white">
                          {node.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!roadmap && !loading && (
                <div className="text-gray-500 dark:text-gray-300 text-sm">
                  Select a role to see tips and guidance.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
