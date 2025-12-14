import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";

// Validate if URL is accessible and valid
async function validateUrl(url: string): Promise<boolean> {
  try {
    // Check if URL format is valid
    const urlObj = new URL(url);
    if (!urlObj.protocol.startsWith("http")) {
      return false;
    }

    // Try to fetch the URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);
    return response.ok; // Returns true if status is 200-299
  } catch {
    return false;
  }
}

// Validate all links in roadmap
async function validateRoadmapLinks(
  roadmap: any
): Promise<{ valid: boolean; invalidLinks: string[] }> {
  const invalidLinks: string[] = [];

  if (roadmap.nodes && Array.isArray(roadmap.nodes)) {
    for (const node of roadmap.nodes) {
      if (node.links) {
        const isValid = await validateUrl(node.links);
        if (!isValid) {
          invalidLinks.push(node.links);
        }
      }
    }
  }

  return {
    valid: invalidLinks.length === 0,
    invalidLinks,
  };
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

    const maxRetries = 3;
    let attempt = 0;
    let roadmap: any = null;
    let invalidLinksInfo = "";

    while (attempt < maxRetries) {
      attempt++;

      const basePrompt = `You're an expert career advisor and technical trainer. 
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
- **IMPORTANT: All links must be valid, accessible URLs. Use well-known educational platforms like:**
  - https://www.udemy.com
  - https://www.coursera.org
  - https://www.freecodecamp.org
  - https://developer.mozilla.org
  - https://www.youtube.com
  - https://www.w3schools.com
${invalidLinksInfo}
- Only return valid JSON.
`;

      const { text: roadmapRaw } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: basePrompt,
      });

      const roadmapRaw2 = roadmapRaw
        .replace(/^`+|`+$/g, "")
        .replace(/^```json\n|```$/g, "")
        .split("\n")
        .slice(1)
        .join("\n");

      roadmap = JSON.parse(roadmapRaw2);

      // Validate all links in the roadmap
      const validationResult = await validateRoadmapLinks(roadmap);

      if (validationResult.valid) {
        console.log(`Roadmap generated successfully on attempt ${attempt}`);
        break;
      } else {
        console.log(
          `Attempt ${attempt}: Found invalid links:`,
          validationResult.invalidLinks
        );
        invalidLinksInfo = `\n- **PREVIOUS ATTEMPT HAD INVALID LINKS**: ${validationResult.invalidLinks.join(
          ", "
        )}\n- DO NOT use these invalid links again. Replace them with valid, accessible URLs from trusted platforms.`;

        if (attempt === maxRetries) {
          console.warn(
            "Max retries reached. Returning roadmap with potentially invalid links."
          );
        }
      }
    }

    return Response.json({ success: true, roadmap }, { status: 200 });
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
