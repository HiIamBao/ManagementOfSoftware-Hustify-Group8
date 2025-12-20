# Job Recommendation Feature - Implementation Pipeline

## Overview
Implement a feature where clicking "Gợi ý việc làm" button shows 10 most suitable jobs based on user's profile (skills, experiences, education).

---

## Step-by-Step Pipeline

### **STEP 1: Create Backend Server Action**

**File to modify:** `lib/actions/general.action.ts`

**What to do:**
1. Create a new function called `getRecommendedJobs(limit: number = 10): Promise<Job[]>`
2. Inside this function:
   - Get current authenticated user using `getCurrentUser()` from `auth.action.ts`
   - If no user, return empty array
   - Fetch all published jobs from Firestore (`jobs` collection where `status == "published"`)
   - Enrich jobs with company data (similar to how `getAllJobs()` does it)
   - For each job, calculate a match score based on:
     - **Skills Match (40%)**: Check how many user skills appear in job requirements/description
     - **Experience Match (30%)**: Check how many experience keywords match job responsibilities/description
     - **Education Match (10%)**: Check education keywords against job content
     - **Job Title Match (10%)**: Check if user skills match job title
     - **Company Following Bonus (5%)**: Add bonus if user follows the company
     - **Recency Bonus (5%)**: Add bonus for recently posted jobs (< 7 days = 5pts, < 30 days = 2pts)
   - Sort all jobs by score (highest first)
   - Return top 10 jobs
   - Handle errors gracefully (return empty array on error)

---

### **STEP 2: Add State Management to Frontend**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Add three new state variables:
   - `isRecommendationMode` (boolean) - tracks if user is viewing recommendations
   - `recommendedJobs` (Job[]) - stores the recommended jobs
   - `isLoadingRecommendations` (boolean) - tracks loading state

---

### **STEP 3: Create Recommendation Handler Function**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Create `handleGetRecommendations()` async function:
   - Set loading state to true
   - Call `getRecommendedJobs(10)` server action
   - If empty results: Show info toast message
   - If success: Store results in state, enable recommendation mode, reset page to 1, show success toast
   - If error: Show error toast
   - Always set loading state to false

---

### **STEP 4: Create "Show All Jobs" Handler**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Create `handleShowAllJobs()` function:
   - Disable recommendation mode
   - Reset page to 1
   - Clear all filters (search, location, type)

---

### **STEP 5: Update Filter Logic**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Modify the `filteredJobs` calculation:
   - Create a variable `jobsToFilter` that uses `recommendedJobs` if in recommendation mode, otherwise `safeJobs`
   - Apply existing filters (search, location, type) to `jobsToFilter`

---

### **STEP 6: Update Button UI**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Replace the current button's `onClick` handler
2. Add conditional rendering:
   - **If NOT in recommendation mode:**
     - Show "Gợi ý việc làm" button with Sparkles icon
     - On click: Call `handleGetRecommendations()`
     - Show loading spinner when `isLoadingRecommendations` is true
     - Disable button during loading
   - **If IN recommendation mode:**
     - Show "Show All Jobs" button with X icon
     - On click: Call `handleShowAllJobs()`

---

### **STEP 7: Add Required Imports**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Add import: `import { toast } from "sonner";`
2. Add import: `import { getRecommendedJobs } from "@/lib/actions/general.action";`
3. Add import: `X` icon from `lucide-react`

---

### **STEP 8: Add Recommendation Banner**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Above the job list, add conditional rendering:
   - If `isRecommendationMode` is true, show a banner with:
     - Gradient background (indigo to purple)
     - Sparkles icon
     - Title: "Recommended Jobs for You"
     - Job count: "X jobs found"
     - Description text about matching profile

---

### **STEP 9: Update Empty State Message**

**File to modify:** `app/(root)/jobs/JobsPageClient.tsx`

**What to do:**
1. Update the empty state message to be conditional:
   - If in recommendation mode: Show message about updating profile
   - Otherwise: Show existing "No jobs found" message

---

### **STEP 10: Test the Feature**

**What to test:**
1. **User not logged in:** Click button → Should handle gracefully
2. **User with complete profile:** Click button → Should show 10 recommended jobs
3. **User with minimal profile:** Click button → Should still work (may show fewer/more generic matches)
4. **User with empty profile:** Click button → Should show message to update profile
5. **Filtering:** Get recommendations, then apply search/location/type filters → Should filter recommended jobs
6. **Pagination:** Get recommendations → Verify pagination works (5 jobs per page)
7. **Switch modes:** Get recommendations → Click "Show All Jobs" → Should return to all jobs view
8. **Error handling:** Simulate error → Verify error toast appears

---

## Files to Modify Summary

1. **`lib/actions/general.action.ts`**
   - Add `getRecommendedJobs()` function

2. **`app/(root)/jobs/JobsPageClient.tsx`**
   - Add state variables
   - Add handler functions
   - Update button UI
   - Add banner
   - Update imports
   - Update filter logic

---

## Key Considerations

- **Scoring Algorithm:** The match score determines job relevance. Adjust weights if needed.
- **Performance:** For large job databases, consider caching or optimizing queries
- **User Experience:** Loading states and error messages are important
- **Edge Cases:** Handle missing user data, empty results, and errors gracefully

---

## Success Criteria

- [ ] Button click triggers recommendation fetch
- [ ] Loading spinner shows during fetch
- [ ] Top 10 jobs displayed based on match score
- [ ] Banner appears when viewing recommendations
- [ ] Filters work on recommended jobs
- [ ] Pagination works correctly
- [ ] "Show All Jobs" returns to normal view
- [ ] Error handling works
- [ ] Toast notifications provide feedback
- [ ] Empty states show appropriate messages

---

## Implementation Order

1. ✅ **Backend First** - Implement `getRecommendedJobs()` function
2. ✅ **Frontend Second** - Update UI components and handlers
3. ✅ **Test** - Verify all scenarios work
4. ✅ **Polish** - Add loading states, error handling, empty states
