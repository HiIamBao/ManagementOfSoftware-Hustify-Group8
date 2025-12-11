# HR User Role Implementation Plan

## Overview
This document outlines the implementation strategy for adding an HR user role to the Hustify application. HR users will be able to create, manage, and track job postings, as well as manage applicant applications with statistics and analytics.

## Current Architecture Analysis

### Technology Stack
- **Frontend**: Next.js 15.2.2, React 18.2.0, TypeScript
- **Backend**: Next.js Server Actions, Firebase Admin SDK
- **Database**: Firestore
- **UI Components**: Radix UI, TailwindCSS
- **Form Handling**: React Hook Form + Zod validation
- **Authentication**: Firebase Auth with session cookies

### Current User Model
```typescript
interface User {
  image: string;
  coverimg: string;
  phone: string;
  birthday: string;
  address: string;
  name: string;
  email: string;
  id: string;
  darkmode: boolean;
  description?: string;
  skills?: string[];
  experiences?: string[];
  education?: Array<...>;
  projects?: Array<...>;
}
```

### Current Job Model
```typescript
type Job = {
  id: string;
  title: string;
  location: string;
  company: Company;
  logoUrl?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  postedDate: string;
  applicants?: Applicant[];
  applicantCount: number;
  recruitmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

## Implementation Strategy

### Phase 1: Database & Type Updates

#### 1.1 Update User Type
Add `userRole` field to distinguish between normal users and HR users:
```typescript
interface User {
  // ... existing fields
  userRole: "normal" | "hr"; // Default: "normal"
  companyId?: string; // For HR users, reference to their company
}
```

#### 1.2 Update Job Model
Add HR-specific fields:
```typescript
type Job = {
  // ... existing fields
  postedBy: string; // User ID of HR who posted
  companyId: string; // Company ID
  status: "draft" | "published" | "closed"; // Job status
  viewCount: number; // Number of views
  createdAt: string;
  updatedAt: string;
};
```

#### 1.3 Create Company Model (Enhanced)
```typescript
type Company = {
  id: string;
  name: string;
  logo?: string;
  coverimg?: string;
  description: string;
  followers: number;
  createdAt?: string;
  updatedAt?: string;
  hrAdmins: string[]; // Array of HR user IDs
  leaders?: Array<...>;
  spotlightJobs?: Job[];
  fields?: string[];
};
```

#### 1.4 Create Applicant Model (Enhanced)
```typescript
type Applicant = {
  userId: string;
  appliedAt: string;
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "offered";
  rating?: number; // HR can rate applicants
  notes?: string; // HR notes about applicant
  updatedAt?: string;
};
```

### Phase 2: Authentication Flow Updates

#### 2.1 Update AuthForm Component
- Add role selection toggle/radio buttons during sign-up
- Show company name field for HR users
- Validate company information

#### 2.2 Update SignUp Action
- Accept `userRole` parameter
- Create company document if HR user
- Set HR user as company admin

#### 2.3 Add Role Verification Middleware
- Create utility function to check user role
- Protect HR routes with role-based access control

### Phase 3: HR Dashboard

#### 3.1 Dashboard Layout
```
/hr/dashboard
├── Overview Statistics
│   ├── Total Jobs Posted
│   ├── Total Applicants
│   ├── Open Positions
│   └── Pending Applications
├── Recent Jobs
├── Recent Applications
└── Quick Actions
```

#### 3.2 Components
- `HRDashboard.tsx` - Main dashboard component
- `DashboardStats.tsx` - Statistics cards
- `RecentJobsList.tsx` - List of recent jobs
- `RecentApplicationsList.tsx` - List of recent applications

### Phase 4: Job Management UI

#### 4.1 Job List Page
```
/hr/jobs
├── Search & Filter
├── Job List with Actions
│   ├── Edit
│   ├── View Applicants
│   ├── Close/Publish
│   └── Delete
└── Create New Job Button
```

#### 4.2 Create/Edit Job Page
```
/hr/jobs/new
/hr/jobs/[id]/edit
├── Job Title
├── Location
├── Description
├── Responsibilities
├── Requirements
├── Benefits
├── Recruitment URL
└── Save/Publish
```

#### 4.3 Components
- `JobManagementList.tsx` - List of HR's jobs
- `JobForm.tsx` - Create/Edit job form
- `JobPreview.tsx` - Preview before publishing

### Phase 5: Applicant Management UI

#### 5.1 Applicants Page
```
/hr/jobs/[id]/applicants
├── Filter by Status
├── Applicant List
│   ├── Applicant Info
│   ├── Applied Date
│   ├── Current Status
│   ├── Rating
│   └── Actions (View Profile, Change Status, Add Notes)
└── Bulk Actions
```

#### 5.2 Applicant Detail View
```
/hr/applicants/[applicantId]
├── Applicant Profile
├── Application Timeline
├── Status History
├── HR Notes
├── Rating & Feedback
└── Action Buttons
```

#### 5.3 Components
- `ApplicantsList.tsx` - List of applicants for a job
- `ApplicantCard.tsx` - Individual applicant card
- `ApplicantDetail.tsx` - Detailed applicant view
- `StatusUpdateModal.tsx` - Change applicant status
- `NotesModal.tsx` - Add/edit HR notes

### Phase 6: Statistics & Analytics

#### 6.1 Analytics Dashboard
```
/hr/analytics
├── Job Posting Metrics
│   ├── Jobs Posted (Timeline)
│   ├── Average Applicants per Job
│   ├── Most Popular Jobs
│   └── View Trends
├── Applicant Metrics
│   ├── Application Status Distribution
│   ├── Conversion Funnel
│   ├── Time to Hire
│   └── Applicant Source
└── Export Reports
```

#### 6.2 Components
- `AnalyticsDashboard.tsx` - Main analytics page
- `JobMetrics.tsx` - Job-related charts
- `ApplicantMetrics.tsx` - Applicant-related charts
- `ConversionFunnel.tsx` - Applicant status funnel

### Phase 7: Server Actions

#### 7.1 Job Management Actions
```typescript
// lib/actions/hr-jobs.action.ts
- createJob(params: CreateJobParams)
- updateJob(jobId: string, params: UpdateJobParams)
- deleteJob(jobId: string)
- getHRJobs(hrUserId: string)
- publishJob(jobId: string)
- closeJob(jobId: string)
```

#### 7.2 Applicant Management Actions
```typescript
// lib/actions/hr-applicants.action.ts
- getJobApplicants(jobId: string)
- updateApplicantStatus(jobId: string, userId: string, status: ApplicantStatus)
- addApplicantNotes(jobId: string, userId: string, notes: string)
- rateApplicant(jobId: string, userId: string, rating: number)
- getApplicantDetail(jobId: string, userId: string)
```

#### 7.3 Analytics Actions
```typescript
// lib/actions/hr-analytics.action.ts
- getJobMetrics(hrUserId: string)
- getApplicantMetrics(hrUserId: string)
- getConversionFunnel(hrUserId: string)
- generateReport(hrUserId: string, dateRange: DateRange)
```

### Phase 8: Route Protection

#### 8.1 Middleware
- Create middleware to check user role
- Redirect non-HR users from HR routes
- Verify HR user owns the job/company

#### 8.2 Protected Routes
```
/hr/* - All HR routes
/hr/dashboard - HR Dashboard
/hr/jobs - Job Management
/hr/jobs/[id]/applicants - Applicant Management
/hr/analytics - Analytics
```

## Database Schema (Firestore)

### Collections

#### users
```
{
  name: string
  email: string
  userRole: "normal" | "hr"
  companyId?: string (for HR users)
  image?: string
  coverimg?: string
  phone?: string
  birthday?: string
  address?: string
  darkmode: boolean
  description?: string
  skills?: string[]
  experiences?: string[]
  education?: array
  projects?: array
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### companies
```
{
  name: string
  logo?: string
  coverimg?: string
  description: string
  followers: number
  hrAdmins: string[] (user IDs)
  fields?: string[]
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### jobs
```
{
  title: string
  location: string
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  companyId: string
  postedBy: string (HR user ID)
  status: "draft" | "published" | "closed"
  applicantCount: number
  viewCount: number
  applicants: Applicant[]
  recruitmentUrl?: string
  logoUrl?: string
  postedDate: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### applicants (subcollection under jobs)
```
{
  userId: string
  appliedAt: string
  status: "pending" | "reviewing" | "interviewed" | "rejected" | "offered"
  rating?: number
  notes?: string
  updatedAt: timestamp
}
```

## File Structure

```
Hustify-Programming/
├── app/
│   ├── (auth)/
│   │   └── sign-up/page.tsx (updated)
│   ├── (root)/
│   │   ├── jobs/ (existing)
│   │   └── user/ (existing)
│   └── (hr)/
│       ├── layout.tsx (new)
│       ├── dashboard/
│       │   └── page.tsx (new)
│       ├── jobs/
│       │   ├── page.tsx (new)
│       │   ├── new/page.tsx (new)
│       │   ├── [id]/
│       │   │   ├── edit/page.tsx (new)
│       │   │   └── applicants/page.tsx (new)
│       │   └── JobForm.tsx (new)
│       ├── applicants/
│       │   └── [id]/page.tsx (new)
│       └── analytics/
│           └── page.tsx (new)
├── components/
│   ├── AuthForm.tsx (updated)
│   ├── hr/
│   │   ├── HRDashboard.tsx (new)
│   │   ├── DashboardStats.tsx (new)
│   │   ├── JobManagementList.tsx (new)
│   │   ├── ApplicantsList.tsx (new)
│   │   ├── ApplicantCard.tsx (new)
│   │   ├── ApplicantDetail.tsx (new)
│   │   ├── AnalyticsDashboard.tsx (new)
│   │   └── ... (other HR components)
│   └── ... (existing)
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts (updated)
│   │   ├── hr-jobs.action.ts (new)
│   │   ├── hr-applicants.action.ts (new)
│   │   └── hr-analytics.action.ts (new)
│   └── ... (existing)
├── types/
│   └── index.d.ts (updated)
└── ... (existing)
```

## Implementation Order

1. **Update Types** - Add userRole and related fields
2. **Update Auth Flow** - Modify sign-up to support role selection
3. **Create HR Layout** - Set up route group and layout
4. **Build Dashboard** - Create main HR dashboard
5. **Build Job Management** - CRUD for jobs
6. **Build Applicant Management** - View and manage applicants
7. **Add Analytics** - Statistics and reporting
8. **Add Middleware** - Role-based access control
9. **Testing & Refinement** - Test all features

## Security Considerations

1. **Role Verification**: Always verify user role on server actions
2. **Company Ownership**: Verify HR user owns the company/job
3. **Data Access**: Ensure users can only access their own data
4. **Audit Trail**: Log all HR actions for compliance
5. **Input Validation**: Validate all inputs with Zod schemas

## Future Enhancements

1. Multiple HR admins per company
2. Interview scheduling integration
3. Email notifications for applicants
4. Resume parsing and screening
5. Bulk import/export of jobs
6. Integration with ATS systems
7. Applicant communication templates
8. Advanced filtering and search
9. Custom job templates
10. Team collaboration features

