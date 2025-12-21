# HR User Role - Quick Start Guide

## Getting Started as an HR User

### Step 1: Register as HR User
1. Go to `/sign-up`
2. Fill in your name and email
3. Select **"HR Recruiter"** as account type
4. Enter your **Company Name**
5. Create password and sign up
6. Sign in with your credentials

### Step 2: Access HR Dashboard
After sign-in, navigate to `/hr/dashboard` to see:
- Total jobs posted
- Open positions
- Total applicants
- Pending applications
- Recent jobs and applications

### Step 3: Create Your First Job

#### Option A: From Dashboard
1. Click **"+ Create New Job"** button on dashboard
2. Fill in job details:
   - Job Title (e.g., "Senior React Developer")
   - Location (e.g., "San Francisco, CA")
   - Job Description
   - Responsibilities (one per line)
   - Requirements (one per line)
   - Benefits (optional)
   - Recruitment URL (optional)
3. Choose status:
   - **Draft**: Save for later
   - **Publish Now**: Make visible to applicants
4. Click **"Create Job"**

#### Option B: From Jobs Page
1. Go to `/hr/jobs`
2. Click **"+ Create New Job"**
3. Follow same steps as above

### Step 4: Manage Job Applicants

1. Go to `/hr/jobs`
2. Click on applicant count for any job
3. View all applicants for that job
4. For each applicant, you can:
   - **Change Status**: pending → reviewing → interviewed → offered/rejected
   - **Add Notes**: Write notes about the applicant
   - **Rate**: Give 1-5 star rating

### Step 5: View Analytics

1. Go to `/hr/analytics`
2. See:
   - Job posting metrics
   - Applicant status distribution
   - Conversion funnel (applied → offered)
   - Average applicants per job

## Common Tasks

### Publish a Draft Job
1. Go to `/hr/jobs`
2. Find draft job in list
3. Click **"Publish"** button
4. Job is now visible to applicants

### Close a Job
1. Go to `/hr/jobs`
2. Find published job
3. Click **"Close"** button
4. Job no longer accepts applications

### Edit a Job
1. Go to `/hr/jobs`
2. Click **"Edit"** on any job
3. Update details
4. Click **"Update Job"**

### Track Applicant Progress
1. Go to `/hr/jobs`
2. Click applicant count
3. Click on applicant to expand
4. Update status as they progress through hiring

### Export Applicant Data
- Currently: View in applicants list
- Future: Export to CSV/PDF

## Navigation Menu

**HR Dashboard Navigation:**
```
HR Dashboard
├── Dashboard    → Overview & recent activity
├── Jobs         → Manage job postings
└── Analytics    → View recruitment metrics
```

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick navigation (if implemented)
- `Escape` - Close modals/expanded cards

## Tips & Best Practices

1. **Job Descriptions**: Be detailed and specific about requirements
2. **Status Tracking**: Regularly update applicant status for accurate funnel
3. **Notes**: Add notes for future reference on applicants
4. **Ratings**: Use ratings to quickly identify top candidates
5. **Analytics**: Check analytics weekly to track hiring progress

## Troubleshooting

### Can't access HR dashboard?
- Ensure you registered as "HR Recruiter"
- Check that you're logged in
- Clear browser cache and try again

### Job not appearing in list?
- Refresh the page
- Check if job status is "draft" (only published jobs show to applicants)
- Verify you're viewing your own company's jobs

### Applicant not showing up?
- Job must be published for applicants to apply
- Applicants must be logged in to apply
- Check job's recruitment URL is correct

### Can't update applicant status?
- Ensure you're the job poster (HR who created the job)
- Refresh page and try again
- Check browser console for errors

## Account Settings

### Update Profile
1. Click your name in top right
2. Go to **"Profile"**
3. Update information
4. Save changes

### Change Company Info
- Currently: Contact support
- Future: Self-service company settings

### Manage Team Members
- Currently: Single HR user per company
- Future: Add multiple HR admins

## Support

For issues or questions:
1. Check this guide first
2. Review HR_IMPLEMENTATION_PLAN.md for detailed info
3. Contact development team

## API Reference

### Job Management
```typescript
// Create job
POST /api/hr/jobs
{ title, location, description, responsibilities, requirements, benefits }

// Update job
PUT /api/hr/jobs/[id]
{ title, location, description, ... }

// Delete job
DELETE /api/hr/jobs/[id]

// Publish job
POST /api/hr/jobs/[id]/publish

// Close job
POST /api/hr/jobs/[id]/close
```

### Applicant Management
```typescript
// Get applicants
GET /api/hr/jobs/[id]/applicants

// Update status
PUT /api/hr/jobs/[id]/applicants/[userId]
{ status: "pending|reviewing|interviewed|rejected|offered" }

// Add notes
PUT /api/hr/jobs/[id]/applicants/[userId]/notes
{ notes: "string" }

// Rate applicant
PUT /api/hr/jobs/[id]/applicants/[userId]/rating
{ rating: 1-5 }
```

### Analytics
```typescript
// Get metrics
GET /api/hr/analytics/metrics

// Get funnel
GET /api/hr/analytics/funnel

// Get recent jobs
GET /api/hr/analytics/recent-jobs

// Get recent applications
GET /api/hr/analytics/recent-applications
```

