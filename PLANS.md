# PLANS: Apply Modal, Saved Jobs, User Dashboard, Employer Dashboard

## Architecture Decisions

| Concern | Choice |
|---|---|
| State management | React Context (`AppContext`) + `useReducer` + localStorage |
| Modal | `@radix-ui/react-dialog` + Framer Motion overlay/enter animations |
| Forms | `react-hook-form` + `zod` |
| Icons | `lucide-react` (existing) |

## Data Model (new types)

```ts
interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  companyLogo: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter: string
  portfolioUrl?: string
  status: 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'offer'
  submittedAt: string
}

interface AppUser {
  id: string
  name: string
  email: string
  role: 'seeker' | 'employer'
  companyName?: string
}

interface AppState {
  user: AppUser | null
  savedJobIds: string[]
  applications: Application[]
}
```

## Component Tree — New Files

```
src/
  context/
    AppContext.tsx
  components/
    apply/
      ApplyJobModal.tsx     ← Radix Dialog + Framer Motion animated overlay
      ApplyJobForm.tsx      ← react-hook-form + zod
      ApplySuccess.tsx      ← post-submission success
      index.ts
    dashboard/
      DashboardPage.tsx     ← tabs: Saved Jobs | My Applications
      SavedJobsTab.tsx
      ApplicationsTab.tsx
      ApplicationCard.tsx
      index.ts
    employer-dashboard/
      EmployerDashboardPage.tsx  ← tabs: Job Listings | Applicants
      JobListingsTab.tsx
      ApplicantsTab.tsx
      index.ts
    jobs/
      SaveButton.tsx        ← heart icon toggle
```

## Files to Modify

| File | Change |
|---|---|
| `App.tsx` | Add routes `/dashboard`, `/employer/dashboard` |
| `CompanySidebar.tsx` | Wire Apply Now → opens ApplyJobModal |
| `JobCard.tsx` | Add SaveButton |
| `JobDetailPage.tsx` | Add SaveButton in header |
| `Navbar.tsx` | Add dashboard links based on user role |
| `package.json` | Add deps |

## Implementation Order

1. Install deps
2. Create AppContext
3. Create SaveButton → wire into JobCard + JobDetailPage
4. Build ApplyJobModal → wire into CompanySidebar
5. Build User Dashboard
6. Build Employer Dashboard
7. Wire routes + Navbar
8. Verify build
