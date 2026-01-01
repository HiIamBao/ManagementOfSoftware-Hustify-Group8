// Test script for CV Compare API
// Run this in browser console after scanning a CV, or use as a Node.js script

// Example CV data (replace with your scanned CV data)
const sampleCV = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  summary: "Experienced software developer with 5 years in web development",
  skills: ["JavaScript", "React", "Node.js", "TypeScript", "Python"],
  experiences: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      duration: "2020 - Present",
      description: "Led development of web applications using React and Node.js"
    }
  ],
  education: [
    {
      school: "University of Technology",
      degree: "Bachelor of Computer Science",
      year: "2019"
    }
  ],
  projects: [
    {
      title: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform using React and Node.js"
    }
  ]
};

// Example Job Description
const jobDescription = {
  jobTitle: "Full Stack Developer",
  jobDescription: "We are looking for an experienced Full Stack Developer to join our team. The ideal candidate should have strong experience with React, Node.js, and TypeScript.",
  jobRequirements: [
    "5+ years of experience in web development",
    "Strong knowledge of React and Node.js",
    "Experience with TypeScript",
    "Familiarity with RESTful APIs",
    "Experience with database design"
  ],
  jobResponsibilities: [
    "Develop and maintain web applications",
    "Collaborate with cross-functional teams",
    "Write clean, maintainable code",
    "Participate in code reviews"
  ]
};

// Test function
async function testCVCompare() {
  try {
    const response = await fetch("/api/cv/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cv: sampleCV,
        ...jobDescription
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log("✅ Compare successful!");
      console.log("Match Score:", result.data.matchScore);
      console.log("Summary:", result.data.summary);
      console.log("Strengths:", result.data.strengths);
      console.log("Gaps:", result.data.gaps);
      console.log("Recommendations:", result.data.recommendations);
      console.log("Matched Skills:", result.data.matchedSkills);
      console.log("Missing Skills:", result.data.missingSkills);
      console.log("\nFull Response:", result.data);
    } else {
      console.error("❌ Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
  }
}

// Run the test
testCVCompare();
