import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  const { role, experience, goals } = await request.json();

  try {
    const { text: roadmapRaw } = await generateText({
      model: google("gemini-2.0-flash-001"),
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
- Only return valid JSON.

`,
    });
    const roadmapRaw2 = roadmapRaw
      .replace(/^`+|`+$/g, "")
      .replace(/^```json\n|```$/g, "")
      .split("\n")
      .slice(1)
      .join("\n");

    const roadmap = JSON.parse(roadmapRaw2);

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
