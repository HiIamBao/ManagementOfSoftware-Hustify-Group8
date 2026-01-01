# CV Scanning Feature

## Overview
The CV scanning feature allows users to upload their CV/resume and automatically extract structured information to populate their profile.

## Supported File Formats
- **TXT** - Fully supported ✅
- **PDF** - Requires optional dependency (see below)
- **DOCX** - Requires optional dependency (see below)

## Setup

### Basic Setup (TXT files only)
The feature works out of the box for TXT files. No additional dependencies needed.

### Full PDF Support (Optional)
To enable PDF parsing, install the `pdf-parse` package:

```bash
npm install pdf-parse
```

### DOCX Support (Optional)
To enable DOCX parsing, install the `mammoth` package:

```bash
npm install mammoth
```

## Usage

1. Navigate to your profile page (`/user`)
2. You'll see the "Scan Your CV" card at the top
3. Upload your CV file (drag & drop or click to browse)
4. Click "Scan CV" to extract information
5. Review the extracted data
6. Click "Apply to Profile" to automatically fill your profile

## How It Works

1. **File Upload**: User uploads a CV file (PDF, DOCX, or TXT)
2. **Text Extraction**: The system extracts text from the file
3. **AI Parsing**: Google Gemini AI analyzes the text and extracts structured data:
   - Personal information (name, email, phone, address)
   - Professional summary
   - Skills
   - Work experience
   - Education
   - Projects
4. **Profile Update**: User can review and apply the extracted data to their profile

## API Endpoint

**POST** `/api/cv/scan`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (File object)

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["React", "Node.js", "TypeScript"],
    "experiences": [...],
    "education": [...],
    "projects": [...]
  }
}
```

## Error Handling

- **401 Unauthorized**: User not logged in
- **400 Bad Request**: Invalid file type or size (>5MB)
- **500 Internal Server Error**: Server-side processing error

## Future Enhancements

- Support for image-based CVs (using OCR)
- Batch CV processing
- CV template suggestions
- Export scanned CV data to different formats








