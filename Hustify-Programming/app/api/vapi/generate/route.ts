// import { generateText } from "ai";
// import { google } from "@ai-sdk/google";

// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";

// export async function POST(request: Request) {
//   const { type, role, level, techstack, amount, userid } = await request.json();

//   try {
//     const { text: questions } = await generateText({
//       model: google("gemini-2.0-flash-001"),
//       prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]
        
//         Thank you! <3
//     `,
//     });

//     const interview = {
//       role: role,
//       type: type,
//       level: level,
//       techstack: techstack.split(","),
//       questions: JSON.parse(questions),
//       userId: userid,
//       finalized: true,
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(),
//     };

//     await db.collection("interviews").add(interview);

//     return Response.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error:", error);
//     return Response.json({ success: false, error: error }, { status: 500 });
//   }
// }

// export async function GET() {
//   return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
// }

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// Hàm làm sạch chuỗi JSON từ AI
const cleanJson = (text: string) => {
  if (!text) return "[]";
  // Xóa markdown code blocks (```json và ```)
  let clean = text.replace(/```json/g, "").replace(/```/g, "");
  return clean.trim();
};

export async function POST(request: Request) {
  try {
    const { type, role, level, techstack, amount = 5, userid } = await request.json();

    const prompt = `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        
        CRITICAL INSTRUCTION: Return ONLY a raw JSON array of strings. 
        Do not use Markdown formatting. Do not wrap in \`\`\`. 
        Example: ["Question 1", "Question 2"]
        
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters.
    `;

    const { text: rawResponse } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: prompt,
    });

    console.log("Raw Gemini response:", rawResponse); // Log để debug nếu cần

    // Làm sạch và parse JSON
    let questions;
    try {
      questions = JSON.parse(cleanJson(rawResponse));
    } catch (e) {
      console.error("JSON Parse Error:", e);
      // Fallback nếu AI trả về lỗi format
      questions = [
        `Tell me about your experience with ${techstack}.`,
        `What are your strengths as a ${role}?`,
        "Describe a challenging technical problem you solved.",
      ];
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: Array.isArray(techstack) ? techstack : techstack.split(",").map((t: string) => t.trim()),
      questions: questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Lưu vào Firestore và lấy ID
    const docRef = await db.collection("interviews").add(interview);

    return Response.json({ success: true, interviewId: docRef.id }, { status: 200 });

  } catch (error: any) {
    console.error("Server Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}