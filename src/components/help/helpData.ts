export interface HelpArticle {
  question: string
  answer: string
}

export interface HelpCategory {
  id: string
  title: string
  description: string
  icon: 'search' | 'user' | 'employer' | 'support'
  articles: HelpArticle[]
}

export const helpCategories: HelpCategory[] = [
  {
    id: 'job-seekers',
    title: 'For Job Seekers',
    description: 'Accounts, searching, and applying to jobs.',
    icon: 'user',
    articles: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign up" in the top navigation, choose your role (Job Seeker or Employer), and complete the onboarding wizard. You will need a valid email address.',
      },
      {
        question: 'How do I apply to a job?',
        answer: 'Open a job listing and click "Apply". Your profile and resume are sent to the employer, and you can track the application status on your dashboard.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot password". We will email you a link that expires in one hour. Click it to choose a new password.',
      },
      {
        question: 'How do I save a job to apply later?',
        answer: 'Click the bookmark icon on any job listing to save it. Saved jobs appear under the "Saved Jobs" tab on your dashboard.',
      },
      {
        question: 'How do I update my profile?',
        answer: 'Go to your dashboard and open the Profile page. You can update your photo, skills, work history, and contact details there.',
      },
    ],
  },
  {
    id: 'employers',
    title: 'For Employers',
    description: 'Posting jobs, reviewing applicants, and hiring.',
    icon: 'employer',
    articles: [
      {
        question: 'How do I post a job?',
        answer: 'Sign in with an employer account and click "Post a Job". Fill in the role details, location, pay, and requirements, then publish. Your listing goes live immediately.',
      },
      {
        question: 'How do I review applicants?',
        answer: 'Open the Applicants tab on your employer dashboard. You can view each candidate profile, move them through pipeline stages, and message them directly.',
      },
      {
        question: 'How do I schedule an interview?',
        answer: 'From an applicant record, use the interview invitation action to send the candidate a scheduled interview with date, time, and meeting link.',
      },
      {
        question: 'Can I edit or close a job posting?',
        answer: 'Yes. On your job listings, open the listing and choose Edit to change details or Close to stop receiving new applications.',
      },
    ],
  },
  {
    id: 'accounts-billing',
    title: 'Accounts & Billing',
    description: 'Payments, invoices, and plan questions.',
    icon: 'search',
    articles: [
      {
        question: 'What does HireHub Community cost?',
        answer: 'Job seekers can use HireHub Community for free. Employers pay a flat rate per published job; see the Employers page for current pricing.',
      },
      {
        question: 'How do I update my payment method?',
        answer: 'Open your employer dashboard, navigate to Billing, and update your payment method there. We never store full card numbers on our servers.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Still need help?',
    description: 'Reach a human or find more answers.',
    icon: 'support',
    articles: [
      {
        question: 'How do I contact support?',
        answer: 'Email support@hirehub.community and we will get back to you within one business day.',
      },
      {
        question: 'Where can I read the FAQ?',
        answer: 'Our FAQ page covers registering, hiring, and interviews in more depth.',
      },
    ],
  },
]
