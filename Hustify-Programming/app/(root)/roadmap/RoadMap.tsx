"use client";

import { useState, useEffect, useRef } from "react";
import UserGeneratedRoadmap from "./UserGeneratedRoadmap";
import MermaidChart from "./MermaidChart";
// Types
interface RoadmapNode {
  name: string;
  content: string;
  links?: string; // Added optional links property
}

interface RoadmapRole {
  id: string;
  name: string;
  tips: string[];
  nodes: RoadmapNode[];
}

interface ApiResponse {
  success: boolean;
  data: RoadmapRole[];
}

const generateMermaidDiagram = (nodes: RoadmapNode[]): string => {
  if (!nodes || nodes.length === 0) return "";

  let diagram = "flowchart TD\n";

  nodes.forEach((node, index) => {
    const nodeId = `node${index}`;
    const nextNodeId = `node${index + 1}`;

    // Escape special characters in node names
    const safeName = node.name.replace(/["\[\]]/g, "");

    // Add node with yellow background and click functionality
    if (node.links) {
      diagram += `    ${nodeId}("${safeName}"):::clickable\n`;
      diagram += `    click ${nodeId} "${node.links}" _blank\n`;
    } else {
      diagram += `    ${nodeId}("${safeName}"):::yellow\n`;
    }

    // Add connection to next node if it exists
    if (index < nodes.length - 1) {
      diagram += `    ${nodeId} --> ${nextNodeId}\n`;
    }
  });

  // Add styling with black text and rounded corners
  diagram += ` classDef yellow fill:#E5D0AC,stroke:#333,stroke-width:2px,color:#000,font-size:14px\n`;
  diagram += ` classDef clickable fill:#E5D0AC,stroke:#333,stroke-width:2px,color:#000,font-size:14px,cursor:pointer\n`;

  return diagram;
};

export default function Roadmap() {
  const [selectedRole, setSelectedRole] = useState<string>("Frontend");
  const [roadmapData, setRoadmapData] = useState<RoadmapRole[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isCustomRoadmap, setIsCustomRoadmap] = useState<boolean>(false);

  // Fetch roadmap data
  useEffect(() => {
    const fetchRoadmapData = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch("/api/roadmap");
        const result: ApiResponse = await response.json();

        if (result.success) {
          setRoadmapData(result.data);
          setRoles(result.data.map((role) => role.name));
        } else {
          setError("Failed to load roadmap data");
        }
      } catch (err) {
        setError("Error fetching roadmap data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, []);

  // Get current role data
  const currentRoleData: RoadmapRole | undefined = roadmapData?.find(
    (role) => role.name === selectedRole
  );

  // Generate Mermaid diagram with click functionality

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-[#242222] shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
          Choose your role
        </h2>

        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => {
                setSelectedRole(role);
                setIsCustomRoadmap(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedRole === role && !isCustomRoadmap
                  ? "border-red-500 text-red-600 bg-red-50 dark:bg-[#bf3131] dark:text-white dark:border-white"
                  : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#3a3a3a] dark:text-gray-300 dark:hover:text-white"
              }`}>
              {role}
            </button>
          ))}

          {/* Custom Roadmap Button */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white dark:bg-[#242222] text-sm text-gray-500 dark:text-white">
                OR
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCustomRoadmap(true);
              setSelectedRole("");
            }}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              isCustomRoadmap
                ? "border-red-500 text-red-600 bg-red-50 dark:bg-[#bf3131] dark:text-white dark:border-white"
                : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#3a3a3a] dark:text-gray-300 dark:hover:text-white"
            }`}>
            Generate your own roadmap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {isCustomRoadmap ? (
          <UserGeneratedRoadmap />
        ) : (
          <>
            {/* Diagram Section */}
            <div className="flex-1 p-8">
              {loading ? (
                <div className="container mx-auto px-4 py-8">
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-lg text-red-600 dark:text-red-200">
                    {error}
                  </div>
                </div>
              ) : currentRoleData ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-white dark:bg-[#2c2c2c] rounded-lg shadow p-6 overflow-auto">
                    <MermaidChart
                      diagram={generateMermaidDiagram(currentRoleData.nodes)}
                      nodes={currentRoleData.nodes}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-lg text-gray-600">
                    No roadmap data available for {selectedRole}
                  </div>
                </div>
              )}
            </div>

            {/* Tips Section */}
            <div className="w-120 bg-white dark:bg-[#242222] shadow-lg p-6">
              <div className="mb-6">
                <span className="bg-[#E5D0AC] text-black px-3 py-1 rounded text-xl font-medium dark:bg-[#bf3131] dark:text-white">
                  Important Tip
                </span>
              </div>

              {currentRoleData && (
                <div className="space-y-6">
                  {/* Tips */}
                  {currentRoleData.tips.map((tip, index) => (
                    <div
                      key={index}
                      className="text-gray-700 dark:text-white text-lg leading-relaxed">
                      {tip}
                    </div>
                  ))}

                  {/* Node Details */}
                  <div className="space-y-4">
                    {currentRoleData.nodes.map((node, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-[#bf3131] pl-4">
                        <div className="font-medium text-gray-800 dark:text-gray-500 mb-1 flex items-center gap-2">
                          {node.name}
                          {node.links && (
                            <a
                              href={node.links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-sm dark:text-white">
                              🔗
                            </a>
                          )}
                        </div>
                        <div className="text-gray-900 dark:text-white text-lg">
                          {node.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!currentRoleData && !loading && (
                <div className="text-gray-500 text-sm">
                  Select a role to see tips and guidance.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
