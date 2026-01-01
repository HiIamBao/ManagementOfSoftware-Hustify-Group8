import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

interface ParsedCVExperience {
  title: string;
  company: string;
  duration?: string;
  description?: string;
}

interface ParsedCVEducation {
  school: string;
  degree?: string;
  year?: string;
  description?: string;
}

interface ParsedCVProject {
  title: string;
  description?: string;
  link?: string;
}

interface ParsedCV {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  summary?: string;
  skills?: string[];
  experiences?: ParsedCVExperience[];
  education?: ParsedCVEducation[];
  projects?: ParsedCVProject[];
}

interface CompareRequestBody {
  jobId?: string;
  jobDescription?: string;
  jobTitle?: string;
  jobRequirements?: string[];
  jobResponsibilities?: string[];
  cv: ParsedCV;
}


export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CompareRequestBody;

    if (!body || !body.cv) {
      return NextResponse.json(
        { success: false, error: "Missing CV data" },
        { status: 400 }
      );
    }

    let jobText = "";

    // If jobId is provided, load job from Firestore
    if (body.jobId) {
      const jobDoc = await db.collection("jobs").doc(body.jobId).get();
      if (!jobDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Job not found" },
          { status: 404 }
        );
      }

      const jobData: any = jobDoc.data() || {};
      jobText = `
Job title: ${jobData.title || body.jobTitle || ""}
Company: ${jobData.company?.name || jobData.companyName || ""}
Location: ${jobData.location || ""}

Description:
${jobData.description || body.jobDescription || ""}

Responsibilities:
${Array.isArray(jobData.responsibilities) ? jobData.responsibilities.join("\n- ") : ""}

Requirements:
${Array.isArray(jobData.requirements) ? jobData.requirements.join("\n- ") : ""}
`;
    } else if (body.jobDescription || body.jobTitle || body.jobRequirements) {
      jobText = `
Job title: ${body.jobTitle || ""}

Description:
${body.jobDescription || ""}

Requirements:
${Array.isArray(body.jobRequirements) ? body.jobRequirements.join("\n- ") : ""}

Responsibilities:
${Array.isArray(body.jobResponsibilities) ? body.jobResponsibilities.join("\n- ") : ""}
`;
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Provide either jobId or jobDescription/jobTitle/jobRequirements",
        },
        { status: 400 }
      );
    }

    const cvText = JSON.stringify(body.cv, null, 2);

    const { text: raw } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are an expert technical recruiter and career coach.
Compare the following candidate CV data against this job description (JD)
and return ONLY valid JSON (no markdown, no code fences).

JOB DESCRIPTION (JD):
${jobText}

CV DATA (structured JSON):
${cvText}

Analyze:
- overall match between CV and JD
- how well skills, experience, and projects align with requirements
- missing or weak skills
- suggestions to improve the CV for this JD

Return strictly this JSON shape:
{
  "matchScore": 0-100 (number),
  "summary": "2-4 sentence summary of the match",
  "strengths": [
    "bullet point about a strong match",
    "..."
  ],
  "gaps": [
    "bullet point about missing/weak requirement",
    "..."
  ],
  "recommendations": [
    "concrete advice to improve CV or skills",
    "..."
  ],
  "matchedSkills": [
    "skill from CV that matches JD",
    "..."
  ],
  "missingSkills": [
    "important skill in JD not clearly present in CV",
    "..."
  ]
}

Rules:
- matchScore must be a number between 0 and 100
- use concise, clear sentences
- if some fields are unknown, use an empty array [] or reasonable default`,
    });

    let cleaned = raw
      .replace(/^```json\n?/g, "")
      .replace(/^```\n?/g, "")
      .replace(/\n?```$/g, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("Failed to parse AI response as JSON");
      }
      parsed = JSON.parse(match[0]);
    }

    return NextResponse.json(
      {
        success: true,
        data: parsed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error comparing CV and JD:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}


