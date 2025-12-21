import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getCurrentUser } from "@/lib/actions/auth.action";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Supported file types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

interface ParsedCV {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  summary?: string;
  skills?: string[];
  experiences?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    year: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
}

// Extract text from PDF
// Note: For full PDF support, install: npm install pdf-parse
// For now, we'll use a workaround with Gemini's text extraction capabilities
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Check if pdf-parse is available (optional dependency)
    try {
      // Dynamic import to check if pdf-parse is installed
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text;
    } catch (requireError) {
      // pdf-parse not installed - use alternative method
      // Convert to base64 and let Gemini extract text
      // This is a fallback - recommend installing pdf-parse for better results
      const base64 = buffer.toString("base64");
      // Return a marker that this needs special handling
      return `PDF_BASE64:${base64}`;
    }
  } catch (error) {
    throw new Error("Failed to process PDF file");
  }
}

// Extract text from plain text file
async function extractTextFromTxt(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

// Extract text from DOCX (simplified - would need mammoth library in production)
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  // For DOCX, we'd typically use mammoth library
  // For now, return a placeholder - in production add: npm install mammoth
  throw new Error("DOCX parsing requires mammoth library. Please convert to PDF or TXT.");
}

async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    // For PDF, we'll use AI vision capabilities if available
    // Otherwise, we need pdf-parse library
    return await extractTextFromPDF(buffer);
  } else if (mimeType === "text/plain") {
    return await extractTextFromTxt(buffer);
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return await extractTextFromDocx(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload PDF, DOCX, or TXT file.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from file
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(buffer, file.type);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to extract text from file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    // Handle PDF base64 case (when pdf-parse is not installed)
    let cvText: string;
    if (extractedText.startsWith("PDF_BASE64:")) {
      // For PDF without pdf-parse, we need to use Gemini's vision or text extraction
      // Extract the base64 part
      const base64Data = extractedText.replace("PDF_BASE64:", "");
      
      // Use Gemini to extract text from PDF using vision API
      // Note: This requires Gemini 1.5 Pro or Flash with vision capabilities
      // For now, we'll try to extract text using a prompt
      cvText = "PDF file detected. Please ensure pdf-parse is installed (npm install pdf-parse) for better PDF text extraction. Currently using AI-based extraction.";
      
      // Try to use Gemini to extract text (if vision API is available)
      // This is a fallback - recommend installing pdf-parse
      return NextResponse.json(
        {
          success: false,
          error: "PDF parsing requires pdf-parse library. Please install it: npm install pdf-parse. Alternatively, convert your PDF to TXT format.",
        },
        { status: 400 }
      );
    } else {
      cvText = extractedText;
    }

    // Parse CV using Gemini AI (using free tier model)
    const { text: parsedCVJson } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are an expert CV/resume parser. Extract structured information from this CV/resume text.

CV Content:
${cvText.length > 5000 ? cvText.substring(0, 5000) + "..." : cvText}

Extract the following information and return ONLY valid JSON (no markdown, no code blocks, just JSON):
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "address": "Address",
  "summary": "Professional summary or objective",
  "skills": ["skill1", "skill2", ...],
  "experiences": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Start date - End date",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "school": "School/University name",
      "degree": "Degree name",
      "year": "Graduation year",
      "description": "Additional details"
    }
  ],
  "projects": [
    {
      "title": "Project title",
      "description": "Project description",
      "link": "Project URL (if available)"
    }
  ]
}

Rules:
- Only include fields that are present in the CV
- For missing fields, use null or empty array/string
- Extract dates in readable format (e.g., "2020 - 2023" or "Jan 2020 - Present")
- Skills should be an array of strings
- Return ONLY the JSON object, no explanations or markdown formatting`,
    });

    // Clean up the response (remove markdown code blocks if present)
    let cleanedJson = parsedCVJson
      .replace(/^```json\n?/g, "")
      .replace(/^```\n?/g, "")
      .replace(/\n?```$/g, "")
      .trim();

    // Try to parse the JSON
    let parsedCV: ParsedCV;
    try {
      parsedCV = JSON.parse(cleanedJson);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCV = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: parsedCV,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error scanning CV:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

