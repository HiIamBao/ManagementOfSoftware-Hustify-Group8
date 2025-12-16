import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// Validate URL by actually trying to access it
async function isValidUrl(url: string): Promise<boolean> {
  try {
    // First check format
    const urlObj = new URL(url);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return false;
    }

    // Try to fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: "HEAD", // Use HEAD to avoid downloading full content
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Consider 2xx and 3xx status codes as valid
    return response.ok || (response.status >= 300 && response.status < 400);
  } catch (error) {
    console.error(`URL validation failed for ${url}:`, error);
    return false;
  }
}

// Validate roadmap links
async function validateRoadmapLinks(roadmap: any): Promise<string[]> {
  const invalidLinks: string[] = [];
  
  if (roadmap.nodes && Array.isArray(roadmap.nodes)) {
    // Check all links in parallel
    const validationPromises = roadmap.nodes.map(async (node: any, index: number) => {
      if (node.links) {
        const isValid = await isValidUrl(node.links);
        if (!isValid) {
          return `Node ${index + 1} (${node.name}): ${node.links}`;
        }
      }
      return null;
    });

    const results = await Promise.all(validationPromises);
    invalidLinks.push(...results.filter((link): link is string => link !== null));
  }
  
  return invalidLinks;
}

export async function POST(request: Request) {
  const { role, experience, goals } = await request.json();

  try {
    let roadmap;
    let invalidLinks: string[] = [];
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      
      // Build prompt with feedback about invalid links
      let promptFeedback = "";
      if (invalidLinks.length > 0) {
        promptFeedback = `\n\n**IMPORTANT**: The previous generation contained invalid URLs. Please fix these:
${invalidLinks.map(link => `- ${link}`).join("\n")}

Make sure ALL links in the 'links' field are valid, working URLs that start with http:// or https://.`;
      }

      const { text: roadmapRaw } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `You're an expert career advisor and technical trainer. 
Generate a structured learning roadmap for someone who wants to become a ${role}.
Their experience level is ${experience}.
Their goals are: ${goals}.

Format the roadmap like this (JSON only, no extra explanation):

{
  "name": "Frontend",
  "tips": ["Design thinking enhances UI/UX."],
  "nodes": [
    {
      "name": "HTML",
      "content": "HTML structures the content of web pages.",
      "links": "https://udemy.com"
    },
    ...
  ]
}

- Generate 1 tip for the roadmap only.
- The 'nodes' array must contain a **maximum of 7** sequential steps toward becoming job-ready for that role.
- Use real, practical learning steps (e.g. "JavaScript", "React", "CI/CD", etc.)
- All 'links' must be valid URLs starting with http:// or https://
- Only return valid JSON.
${promptFeedback}
`,
      });

      const roadmapRaw2 = roadmapRaw
        .replace(/^`+|`+$/g, "")
        .replace(/^```json\n|```$/g, "")
        .split("\n")
        .slice(1)
        .join("\n");

      roadmap = JSON.parse(roadmapRaw2);

      // Validate links
      invalidLinks = await validateRoadmapLinks(roadmap);

      if (invalidLinks.length === 0) {
        // All links are valid, break the loop
        break;
      }

      console.log(`Attempt ${attempt}: Found ${invalidLinks.length} invalid link(s), retrying...`);
      
      if (attempt === maxRetries) {
        console.warn("Max retries reached. Returning roadmap with potentially invalid links.");
      }
    }

    return Response.json({ 
      success: true, 
      roadmap,
      warnings: invalidLinks.length > 0 ? invalidLinks : undefined 
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error generating roadmap:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
