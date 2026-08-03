export interface FAQItem {
  question: string
  answer: string
  category: 'registration' | 'hiring' | 'interview' | 'general'
}

export const faqItems: FAQItem[] = [
  {
    category: 'registration',
    question: 'How do I create an account?',
    answer: 'Click "Sign up" in the top navigation, choose Seeker or Employer, and complete the one-time onboarding. Your progress saves automatically and you can skip optional steps and return later.',
  },
  {
    category: 'registration',
    question: 'Is creating an account free?',
    answer: 'Yes. Creating an account, browsing jobs, and saving roles is completely free for seekers. Employers can start on a free plan and upgrade when ready to post more roles.',
  },
  {
    category: 'hiring',
    question: 'How do I apply for a job?',
    answer: 'Open any job posting and click "Apply". Upload a resume if you don\'t have one on file — otherwise your existing resume is reused automatically. You\'ll see a confirmation and can track progress in "My Applications".',
  },
  {
    category: 'hiring',
    question: 'What happens after I apply?',
    answer: 'Your application moves through clear stages — Applied, Under Review, Interviewing, Offer. We notify you by push notification and email at every status change, and the Hiring Flow view in your dashboard shows exactly where you stand.',
  },
  {
    category: 'interview',
    question: 'How do interviews work?',
    answer: 'When an employer schedules an interview, the details appear directly on your application card. Be ready for a mix of intro calls, technical interviews, and cultural-fit conversations — each one is documented in your dashboard.',
  },
  {
    category: 'general',
    question: 'How do I manage my saved jobs?',
    answer: 'Use the bookmark icon on any job card to save it. Find everything you\'ve saved under "Saved Jobs" in your dashboard, and remove a role at any time.',
  },
]
