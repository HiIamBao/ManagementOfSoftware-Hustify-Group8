import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";

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
  const { interviewId } = await request.json();

  try {
    // Get interview document
    const interviewDoc = await db
      .collection("interviews")
      .doc(interviewId)
      .get();
    if (!interviewDoc.exists) {
      return Response.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }
    const interview = interviewDoc.data();

    // Get feedback document
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    if (feedbackSnapshot.empty) {
      return Response.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }
    const feedback = feedbackSnapshot.docs[0].data();

    // Format documents as strings for the prompt
    const interviewStr = JSON.stringify(interview, null, 2);
    const feedbackStr = JSON.stringify(feedback, null, 2);

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
Generate a structured learning roadmap based on this interview and feedback data. 
Focus on the feedback and generate a roadmap that can help the user improve their skills and weaknesses regarding to the interview.

Interview Data:
${interviewStr}

Feedback Data:
${feedbackStr}

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
