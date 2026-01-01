# CV Compare API Testing Guide

## Overview
The CV Compare API (`/api/cv/compare`) compares a scanned CV against a job description and returns a match analysis.

## API Endpoint
**POST** `/api/cv/compare`

## Authentication
- Requires user to be logged in (uses session cookie)
- Returns 401 if not authenticated

## Request Body Format

### Option 1: With Job ID (from Firestore)
```json
{
  "jobId": "firestore-job-id-here",
  "cv": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "Node.js"],
    "experiences": [...],
    "education": [...],
    "projects": [...]
  }
}
```

### Option 2: With Job Description (manual)
```json
{
  "jobTitle": "Full Stack Developer",
  "jobDescription": "We are looking for...",
  "jobRequirements": [
    "5+ years experience",
    "React knowledge"
  ],
  "jobResponsibilities": [
    "Develop applications",
    "Code reviews"
  ],
  "cv": {
    "name": "John Doe",
    "skills": ["React", "Node.js"],
    "experiences": [...],
    "education": [...],
    "projects": [...]
  }
}
```

## Response Format
```json
{
  "success": true,
  "data": {
    "matchScore": 85,
    "summary": "Strong match with minor gaps...",
    "strengths": [
      "Strong React experience",
      "Relevant project portfolio"
    ],
    "gaps": [
      "Missing TypeScript experience",
      "No database design experience"
    ],
    "recommendations": [
      "Add TypeScript to your skills",
      "Highlight database projects"
    ],
    "matchedSkills": ["React", "Node.js", "JavaScript"],
    "missingSkills": ["TypeScript", "PostgreSQL"]
  }
}
```

## Testing Methods

### Method 1: Browser Console (Easiest)

1. **First, scan a CV** on `/user` page to get CV data
2. Open browser console (F12)
3. Copy and paste this code:

```javascript
// Get CV data from scanned CV (if you just scanned one)
const cvData = {
  name: "Your Name",
  email: "your@email.com",
  skills: ["React", "Node.js", "TypeScript"],
  experiences: [{
    title: "Software Engineer",
    company: "Company Name",
    duration: "2020 - Present"
  }],
  education: [{
    school: "University Name",
    degree: "Computer Science",
    year: "2020"
  }]
};

// Job description
const jobData = {
  jobTitle: "Full Stack Developer",
  jobDescription: "Looking for experienced developer with React and Node.js",
  jobRequirements: [
    "5+ years experience",
    "React and Node.js",
    "TypeScript"
  ]
};

// Test the API
fetch("/api/cv/compare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cv: cvData,
    ...jobData
  })
})
.then(r => r.json())
.then(data => {
  console.log("Match Score:", data.data?.matchScore);
  console.log("Full Response:", data);
})
.catch(err => console.error("Error:", err));
```

### Method 2: Using cURL

```bash
curl -X POST http://localhost:3000/api/cv/compare \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "jobTitle": "Full Stack Developer",
    "jobDescription": "Looking for React developer",
    "jobRequirements": ["React", "Node.js"],
    "cv": {
      "name": "John Doe",
      "skills": ["React", "Node.js"],
      "experiences": [{
        "title": "Developer",
        "company": "Tech Corp",
        "duration": "2020-Present"
      }]
    }
  }'
```

### Method 3: Using Postman

1. **Method**: POST
2. **URL**: `http://localhost:3000/api/cv/compare`
3. **Headers**:
   - `Content-Type: application/json`
   - `Cookie: your-session-cookie` (copy from browser)
4. **Body** (raw JSON):
```json
{
  "jobTitle": "Full Stack Developer",
  "jobDescription": "We need an experienced developer",
  "jobRequirements": ["React", "Node.js"],
  "cv": {
    "name": "John Doe",
    "skills": ["React", "Node.js"],
    "experiences": [{
      "title": "Software Engineer",
      "company": "Tech Corp",
      "duration": "2020-Present"
    }]
  }
}
```

### Method 4: Using Node.js Script

Create a file `test-compare.js`:

```javascript
const fetch = require('node-fetch'); // npm install node-fetch

async function testCompare() {
  const response = await fetch('http://localhost:3000/api/cv/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add your session cookie here
      'Cookie': 'your-session-cookie'
    },
    body: JSON.stringify({
      jobTitle: "Full Stack Developer",
      jobDescription: "Looking for React developer",
      jobRequirements: ["React", "Node.js"],
      cv: {
        name: "John Doe",
        skills: ["React", "Node.js"],
        experiences: [{
          title: "Developer",
          company: "Tech Corp",
          duration: "2020-Present"
        }]
      }
    })
  });
  
  const result = await response.json();
  console.log(result);
}

testCompare();
```

## Example Test Cases

### Test Case 1: Perfect Match
```json
{
  "jobTitle": "React Developer",
  "jobRequirements": ["React", "JavaScript", "5+ years"],
  "cv": {
    "skills": ["React", "JavaScript", "TypeScript"],
    "experiences": [{
      "title": "Senior React Developer",
      "duration": "2018 - Present"
    }]
  }
}
```

### Test Case 2: Partial Match
```json
{
  "jobTitle": "Full Stack Developer",
  "jobRequirements": ["React", "Node.js", "PostgreSQL", "AWS"],
  "cv": {
    "skills": ["React", "Node.js"],
    "experiences": [{
      "title": "Frontend Developer",
      "duration": "2020 - Present"
    }]
  }
}
```

### Test Case 3: Poor Match
```json
{
  "jobTitle": "Data Scientist",
  "jobRequirements": ["Python", "Machine Learning", "TensorFlow"],
  "cv": {
    "skills": ["JavaScript", "React"],
    "experiences": [{
      "title": "Web Developer",
      "duration": "2020 - Present"
    }]
  }
}
```

## Expected Response Fields

- **matchScore** (0-100): Overall compatibility score
- **summary**: Brief overview of the match
- **strengths**: Array of matching points
- **gaps**: Array of missing requirements
- **recommendations**: Suggestions to improve match
- **matchedSkills**: Skills from CV that match JD
- **missingSkills**: Required skills not in CV

## Troubleshooting

### Error: "Unauthorized"
- Make sure you're logged in
- Check that session cookie is included in request

### Error: "Missing CV data"
- Ensure `cv` field is present in request body
- CV should have at least some fields (skills, experiences, etc.)

### Error: "Provide either jobId or jobDescription..."
- Must provide either:
  - `jobId` (to load from Firestore), OR
  - `jobDescription` / `jobTitle` / `jobRequirements`

### Error: "Job not found"
- Check that `jobId` exists in Firestore `jobs` collection

## Integration with CV Scanner

To test with real scanned CV data:

1. Scan a CV using the CV Scanner component
2. Get the parsed CV data from the scan response
3. Use that data in the compare request:

```javascript
// After scanning CV, use the parsed data
const scannedCV = parsedData; // from CV Scanner

fetch("/api/cv/compare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cv: scannedCV,
    jobTitle: "Your Job Title",
    jobDescription: "Job description here",
    jobRequirements: ["Skill1", "Skill2"]
  })
})
.then(r => r.json())
.then(console.log);
```
