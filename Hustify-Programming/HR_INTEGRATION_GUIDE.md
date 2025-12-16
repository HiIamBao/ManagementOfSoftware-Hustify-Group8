# HR User Role - Integration Guide

## Integration Points

### 1. Authentication Integration

#### Sign-Up Flow
```typescript
// AuthForm.tsx - Role selection
const [selectedRole, setSelectedRole] = useState<"normal" | "hr">("normal");

// When submitting
const result = await signUp({
  uid: userCredential.user.uid,
  name: name!,
  email,
  password,
  userRole: selectedRole,
  companyName: selectedRole === "hr" ? companyName : undefined,
});
```

#### Server Action
```typescript
// lib/actions/auth.action.ts
export async function signUp(params: SignUpParams) {
  const { uid, name, email, userRole = "normal", companyName } = params;

  if (userRole === "hr" && companyName) {
    // Create company
    const companyRef = db.collection("companies").doc();
    await companyRef.set({
      name: companyName,
      hrAdmins: [uid],
      // ...
    });
    companyId = companyRef.id;
  }

  // Create user with role
  await db.collection("users").doc(uid).set({
    name, email, userRole, companyId,
  });
}
```

### 2. Job Management Integration

#### Create Job
```typescript
// lib/actions/hr-jobs.action.ts
export async function createJob(params: CreateJobParams) {
  const user = await getCurrentUser();
  if (user.userRole !== "hr") return error;

  const jobRef = db.collection("jobs").doc();
  await jobRef.set({
    ...params,
    postedBy: user.id,
    companyId: user.companyId,
    status: "draft",
    applicantCount: 0,
  });
}
```

#### Usage in Component
```typescript
// app/(hr)/jobs/JobForm.tsx
const result = await createJob({
  title, location, description,
  responsibilities, requirements, benefits,
  status: "draft" | "published"
});
```

### 3. Applicant Management Integration

#### Update Applicant Status
```typescript
// lib/actions/hr-applicants.action.ts
export async function updateApplicantStatus(
  jobId: string,
  userId: string,
  status: ApplicantStatus
) {
  const jobDoc = await db.collection("jobs").doc(jobId).get();
  const applicants = jobDoc.data().applicants;
  
  const applicantIndex = applicants.findIndex(a => a.userId === userId);
  applicants[applicantIndex].status = status;
  
  await db.collection("jobs").doc(jobId).update({ applicants });
}
```

#### Usage in Component
```typescript
// ApplicantsList.tsx
const handleStatusChange = async (userId: string, newStatus: string) => {
  const result = await updateApplicantStatus(jobId, userId, newStatus);
  if (result.success) toast.success("Status updated");
};
```

### 4. Analytics Integration

#### Get Metrics
```typescript
// lib/actions/hr-analytics.action.ts
export async function getJobMetrics(): Promise<JobMetrics | null> {
  const user = await getCurrentUser();
  const jobsSnapshot = await db
    .collection("jobs")
    .where("postedBy", "==", user.id)
    .get();

  return {
    totalJobsPosted: jobs.length,
    totalApplicants: sum(applicantCounts),
    openPositions: published.length,
    // ...
  };
}
```

#### Usage in Dashboard
```typescript
// app/(hr)/dashboard/page.tsx
const [jobMetrics] = await Promise.all([getJobMetrics()]);

return (
  <div>
    <div>Total Jobs: {jobMetrics?.totalJobsPosted}</div>
    <div>Applicants: {jobMetrics?.totalApplicants}</div>
  </div>
);
```

### 5. Route Protection Integration

#### Layout Protection
```typescript
// app/(hr)/layout.tsx
export default async function HRLayout({ children }) {
  const user = await getCurrentUser();
  
  if (!user || user.userRole !== "hr") {
    redirect("/");
  }

  return <div>{children}</div>;
}
```

#### Server Action Protection
```typescript
// All HR actions start with:
const user = await getCurrentUser();
if (!user || user.userRole !== "hr") {
  return { success: false, message: "Unauthorized" };
}
```

## Database Queries

### Get HR User's Jobs
```typescript
const jobs = await db
  .collection("jobs")
  .where("postedBy", "==", userId)
  .orderBy("createdAt", "desc")
  .get();
```

### Get Job Applicants
```typescript
const jobDoc = await db.collection("jobs").doc(jobId).get();
const applicants = jobDoc.data().applicants;
```

### Get Applicant Metrics
```typescript
const jobs = await db
  .collection("jobs")
  .where("postedBy", "==", userId)
  .get();

jobs.forEach(job => {
  const applicants = job.data().applicants;
  applicants.forEach(app => {
    // Count by status
  });
});
```

## Component Integration Examples

### Using Job Form
```typescript
import JobForm from "@/app/(hr)/jobs/JobForm";

// Create new job
<JobForm />

// Edit existing job
<JobForm initialData={job} jobId={jobId} />
```

### Using Applicants List
```typescript
import ApplicantsList from "@/app/(hr)/jobs/[id]/applicants/ApplicantsList";

const applicantsData = await getJobApplicants(jobId);
<ApplicantsList jobId={jobId} applicants={applicantsData.applicants} />
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Companies - only HR admins can write
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid in resource.data.hrAdmins;
    }

    // Jobs - HR can write their own, all can read published
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.postedBy;
      allow create: if request.auth.uid in 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userRole == 'hr';
    }
  }
}
```

## Environment Variables

No additional environment variables needed. Uses existing:
- `NEXT_PUBLIC_FIREBASE_*` - Firebase config
- `FIREBASE_ADMIN_*` - Admin SDK credentials

## Testing Examples

### Test HR Registration
```typescript
// Test creating HR user
const result = await signUp({
  uid: "test-user",
  name: "Test HR",
  email: "hr@test.com",
  password: "password",
  userRole: "hr",
  companyName: "Test Company"
});

expect(result.success).toBe(true);
```

### Test Job Creation
```typescript
// Test creating job
const result = await createJob({
  title: "Developer",
  location: "NYC",
  description: "Test job",
  responsibilities: ["Task 1"],
  requirements: ["Skill 1"],
  benefits: ["Benefit 1"]
});

expect(result.success).toBe(true);
expect(result.jobId).toBeDefined();
```

### Test Applicant Status Update
```typescript
// Test updating applicant
const result = await updateApplicantStatus(
  jobId,
  userId,
  "reviewing"
);

expect(result.success).toBe(true);
```

## Performance Considerations

### Query Optimization
```typescript
// Good - indexed query
.where("postedBy", "==", userId)
.orderBy("createdAt", "desc")

// Avoid - multiple where clauses without index
.where("postedBy", "==", userId)
.where("status", "==", "published")
.where("companyId", "==", companyId)
```

### Caching Strategy
```typescript
// Use Next.js revalidatePath for cache invalidation
revalidatePath("/hr/jobs");
revalidatePath(`/hr/jobs/${jobId}`);
```

## Error Handling

### Common Errors
```typescript
// Unauthorized access
if (!user || user.userRole !== "hr") {
  return { success: false, message: "Only HR users can perform this action" };
}

// Job not found
if (!jobDoc.exists) {
  return { success: false, message: "Job not found" };
}

// Permission denied
if (jobData.postedBy !== user.id) {
  return { success: false, message: "You don't have permission" };
}
```

## Monitoring & Logging

### Add Logging
```typescript
console.log(`HR User ${user.id} created job ${jobId}`);
console.log(`Job ${jobId} applicant status updated to ${status}`);
```

### Track Metrics
- Jobs created per HR user
- Applicants per job
- Status conversion rates
- Time to hire

## Future Integration Points

1. **Email Notifications**
   - Notify on new applications
   - Notify applicants of status changes

2. **Webhooks**
   - Trigger external systems on job creation
   - Sync with ATS systems

3. **API Endpoints**
   - REST API for job management
   - GraphQL for complex queries

4. **Third-party Services**
   - LinkedIn integration
   - Job board posting
   - Email service integration

