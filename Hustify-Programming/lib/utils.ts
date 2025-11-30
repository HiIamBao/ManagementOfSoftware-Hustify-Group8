import { interviewCovers, mappings } from "@/constants";
import { GenerateJobBasedQuestionsParams } from "@/types";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

export async function generateJobBasedQuestions(
  params: GenerateJobBasedQuestionsParams
) {
  const { role, company, description, responsibilities, requirements } = params;

  // Create prompt for job-specific question generation
  const prompt = `
    Generate relevant interview questions for a ${role} position at ${company}.
    
    Job Description:
    ${description}
    
    Responsibilities:
    ${responsibilities}
    
    Requirements:
    ${requirements}
    
    Create 8-10 interview questions that:
    1. Test the candidate's specific skills mentioned in the requirements
    2. Assess their experience with the listed responsibilities
    3. Include both technical and behavioral questions
    4. Check for cultural fit with ${company}
    5. Evaluate problem-solving abilities relevant to this role
    
    Format the questions as a valid JSON array of strings. Do not include any additional text or formatting.
  `;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
      system:
        "You are an expert technical interviewer creating job-specific interview questions based on real job descriptions.",
      maxTokens: 1500,
    });

    // Parse the JSON response
    let questions;
    try {
      questions = text
        .replace(/^`+|`+$/g, "")
        .replace(/^```json\n|```$/g, "")
        .split("\n")
        .slice(1)
        .join("\n");

      questions = JSON.parse(questions);
      // Ensure it's an array
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Extract questions from text if JSON parsing fails
      questions = text
        .replace(/[\[\]]/g, "")
        .split('","')
        .map((q) => q.replace(/^"|"$/g, "").trim())
        .filter((q) => q.length > 0);
    }

    return questions;
  } catch (error) {
    console.error("Error generating job-based questions:", error);

    // Fallback questions if AI generation fails
    return [
      `Tell me about your experience as a ${role}?`,
      "What relevant projects have you worked on in your previous roles?",
      "How do you stay updated with the latest developments in this field?",
      "Describe a challenging problem you solved that's relevant to this position.",
      "How would you handle [specific responsibility from the job]?",
      "What experience do you have with [key technology mentioned in requirements]?",
      "Why are you interested in working at our company specifically?",
      "How do you prioritize tasks when handling multiple responsibilities?",
    ];
  }
}

export function processUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return undefined;

  // Check if the URL already starts with a protocol
  if (trimmedUrl.match(/^(https?:\/\/|ftp:\/\/)/i)) {
    return trimmedUrl;
  }

  // Check if it's a valid domain-like string
  const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  if (domainRegex.test(trimmedUrl)) {
    return `https://${trimmedUrl}`;
  }

  // If it looks like a local path or doesn't match domain pattern, return as is
  return trimmedUrl;
}
