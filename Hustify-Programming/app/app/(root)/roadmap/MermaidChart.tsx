import { useRef, useState, useEffect } from "react";

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

export default function MermaidChart({
  diagram,
  nodes,
}: {
  diagram: string;
  nodes: RoadmapNode[];
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const arrowColor = isDark ? "#fff" : "#333";
  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (typeof window === "undefined" || !diagram) return;

      setIsLoading(true);
      setError("");
      setSvgContent("");

      try {
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;

        // Initialize mermaid only once
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: "linear",
            nodeSpacing: 50,
            rankSpacing: 80,
          },
          themeVariables: {
            primaryColor: "#00f700",
            primaryTextColor: "#000000",
            primaryBorderColor: "#333",
            lineColor: arrowColor,
            sectionBkgColor: "#E5D0AC",
            altSectionBkgColor: "#E5D0AC",
            gridColor: "#333",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "14px",
            padding: "50px",
          },
          themeCSS: "p {color: black; font-size: 18px;}",
          securityLevel: "loose",
        });

        // Generate unique ID for this diagram
        const graphId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render the diagram
        const { svg } = await mermaid.render(graphId, diagram);

        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (isMounted) {
          setError("Failed to render diagram");
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [diagram]);

  // Add click handlers after SVG is rendered
  useEffect(() => {
    if (!svgContent || !chartRef.current) return;

    const addClickHandlers = () => {
      const svgElement = chartRef.current?.querySelector("svg");
      if (!svgElement) return;

      // Find all node groups and add click handlers
      nodes.forEach((node, index) => {
        const nodeId = `node${index}`;
        // Look for elements with the node ID or containing the node text
        const nodeElements = svgElement.querySelectorAll(
          `[id*="${nodeId}"], g`
        );

        nodeElements.forEach((element) => {
          // Check if this element contains the node text
          const textContent = element.textContent?.trim();
          if (textContent === node.name && node.links) {
            // Add click handler
            element.addEventListener("click", (e) => {
              e.preventDefault();
              if (node.links) {
                window.open(node.links, "_blank", "noopener,noreferrer");
              }
            });

            // Add cursor pointer style
            (element as HTMLElement).style.cursor = "pointer";

            // Add hover effect
            element.addEventListener("mouseenter", () => {
              (element as HTMLElement).style.opacity = "0.8";
            });

            element.addEventListener("mouseleave", () => {
              (element as HTMLElement).style.opacity = "1";
            });
          }
        });
      });
    };

    // Add a small delay to ensure SVG is fully rendered
    const timer = setTimeout(addClickHandlers, 100);

    return () => clearTimeout(timer);
  }, [svgContent, nodes]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-gray-900">Rendering diagram...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div
        ref={chartRef}
        className="mermaid-container w-full max-w-4xl"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "500px",
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
