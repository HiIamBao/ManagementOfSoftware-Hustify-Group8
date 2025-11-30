import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";

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

    const { text: roadmapRaw } = await generateText({
      model: google("gemini-2.0-flash-001"),
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
