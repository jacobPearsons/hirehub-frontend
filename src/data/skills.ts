export type SkillNiche =
  | 'tech' | 'design' | 'business' | 'marketing' | 'hr' | 'healthcare'
  | 'trades' | 'legal' | 'education' | 'languages' | 'soft-skills' | 'office' | 'general'

const categoryData: Record<Exclude<SkillNiche, 'general'>, string[]> = {
  tech: [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'Go', 'Rust', 'C', 'C++', 'C#',
    '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Swift', 'Kotlin', 'Flutter',
    'Dart', 'React Native', 'iOS Development', 'Android Development', 'HTML/CSS',
    'Sass/SCSS', 'Tailwind CSS', 'Bootstrap', 'WebAssembly',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra',
    'Firebase', 'Supabase', 'DynamoDB', 'Neo4j', 'GraphQL', 'REST APIs', 'gRPC',
    'SOAP', 'API Design', 'Database Design', 'Data Modeling',
    'AWS', 'Azure', 'Google Cloud Platform (GCP)', 'Docker', 'Kubernetes', 'Terraform',
    'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI',
    'CI/CD', 'Infrastructure as Code', 'Serverless Architecture', 'Microservices',
    'Load Balancing', 'Monitoring (Prometheus, Grafana)', 'Nginx', 'Apache',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Pandas', 'NumPy', 'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI',
    'Apache Spark', 'Hadoop', 'Kafka', 'Airflow', 'ETL Pipelines', 'Big Data',
    'Natural Language Processing (NLP)', 'Computer Vision', 'Generative AI',
    'Prompt Engineering', 'MLOps', 'Data Engineering', 'Business Intelligence',
    'Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'OWASP', 'SIEM',
    'Network Security', 'Cloud Security', 'Identity & Access Management', 'Cryptography',
    'Vulnerability Assessment', 'Incident Response', 'Compliance (SOC 2, ISO 27001)',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Agile', 'Scrum',
    'Kanban', 'Test-Driven Development (TDD)', 'Unit Testing', 'Integration Testing',
    'End-to-End Testing', 'Selenium', 'Cypress', 'Jest', 'Mocha', 'Postman', 'Swagger',
    'Linux', 'Bash/Shell Scripting', 'PowerShell', 'Vim', 'VS Code', 'IntelliJ IDEA',
  ],
  design: [
    'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Figma', 'Sketch',
    'Adobe XD', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'Adobe After Effects',
    'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Motion Graphics',
    '3D Modeling', 'Blender', 'Cinema 4D', 'Maya', 'AutoCAD', 'SketchUp', 'Revit',
    'Graphic Design', 'Brand Identity', 'Logo Design', 'Typography', 'Color Theory',
    'Print Design', 'Packaging Design', 'Illustration', 'Digital Art', 'Photography',
    'Video Production', 'Video Editing', 'Animation', 'Storyboarding', 'Canva',
    'Web Design', 'Responsive Design', 'Design Systems', 'Accessibility (WCAG)',
  ],
  business: [
    'Financial Analysis', 'Financial Modeling', 'Budgeting', 'Forecasting', 'Accounting',
    'Bookkeeping', 'QuickBooks', 'Xero', 'SAP', 'ERP Systems', 'Excel (Advanced)',
    'Pivot Tables', 'VLOOKUP', 'Macros/VBA', 'Risk Management', 'Investment Analysis',
    'Portfolio Management', 'Valuation', 'M&A', 'Auditing', 'Tax Preparation',
    'Compliance', 'Sarbanes-Oxley (SOX)', 'GAAP', 'IFRS', 'CFA', 'CPA',
    'Business Analysis', 'Market Research', 'Competitive Analysis', 'Strategic Planning',
    'Business Development', 'Sales Strategy', 'Revenue Operations', 'Pricing Strategy',
    'Product Management', 'Product Strategy', 'Roadmapping', 'Go-to-Market Strategy',
    'Market Sizing', 'SWOT Analysis', 'OKRs', 'KPIs', 'Benchmarking',
    'Operations Management', 'Supply Chain Management', 'Logistics', 'Procurement',
    'Inventory Management', 'Lean Manufacturing', 'Six Sigma', 'Kaizen', 'Quality Assurance',
    'Process Improvement', 'Workflow Optimization', 'ERP (SAP, Oracle)', 'Warehouse Management',
    'Demand Planning', 'Vendor Management', 'Import/Export', 'Customs & Compliance',
  ],
  marketing: [
    'Digital Marketing', 'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads',
    'TikTok Ads', 'Instagram Marketing', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'Marketing Automation', 'HubSpot', 'Marketo', 'Mailchimp',
    'Klaviyo', 'Salesforce Marketing Cloud', 'Google Analytics', 'Google Tag Manager',
    'Conversion Rate Optimization (CRO)', 'A/B Testing', 'Landing Page Optimization',
    'Affiliate Marketing', 'Influencer Marketing', 'Brand Strategy', 'Public Relations',
    'Crisis Communications', 'Media Relations', 'Press Releases', 'Copywriting',
    'Content Strategy', 'Blogging', 'Technical Writing', 'Grant Writing', 'SEO Copywriting',
    'Sales', 'B2B Sales', 'B2C Sales', 'SaaS Sales', 'Enterprise Sales', 'Inside Sales',
    'Field Sales', 'Account Management', 'Key Account Management', 'CRM (Salesforce, HubSpot)',
    'Cold Calling', 'Lead Generation', 'Prospecting', 'Negotiation', 'Closing Techniques',
    'Sales Forecasting', 'Pipeline Management', 'Contract Negotiation', 'Customer Success',
    'Customer Retention', 'Upselling', 'Cross-selling', 'Sales Enablement',
  ],
  hr: [
    'Recruiting', 'Talent Acquisition', 'Sourcing', 'Applicant Tracking Systems (ATS)',
    'Greenhouse', 'Lever', 'LinkedIn Recruiter', 'Employer Branding', 'Onboarding',
    'Employee Relations', 'Performance Management', '360-Degree Feedback', 'Compensation & Benefits',
    'Payroll Administration', 'HRIS (Workday, BambooHR, ADP)', 'Learning & Development',
    'Training & Facilitation', 'Succession Planning', 'Diversity, Equity & Inclusion (DEI)',
    'Labor Law', 'Conflict Resolution', 'Mediation', 'Coaching', 'Mentoring',
    'Organizational Development', 'Change Management', 'Employee Engagement',
    'Workforce Planning', 'HR Analytics', 'People Operations',
  ],
  healthcare: [
    'Patient Care', 'Clinical Research', 'Electronic Health Records (EHR)', 'Epic', 'Cerner',
    'Medical Coding', 'ICD-10', 'CPT Coding', 'Medical Billing', 'HIPAA Compliance',
    'Phlebotomy', 'Vital Signs Monitoring', 'CPR/BLS', 'ACLS', 'Wound Care',
    'Medication Administration', 'IV Therapy', 'Patient Assessment', 'Telehealth',
    'Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy',
    'Radiology', 'MRI', 'CT Scan', 'Ultrasound', 'Laboratory Techniques',
    'Quality Control (QC)', 'Good Manufacturing Practice (GMP)', 'Good Clinical Practice (GCP)',
    'FDA Regulations', 'Clinical Trials', 'Biostatistics', 'Bioinformatics',
    'Pharmacovigilance', 'Drug Safety', 'Regulatory Affairs', 'Medical Writing',
    'Public Health', 'Epidemiology', 'Health Informatics',
  ],
  trades: [
    'Carpentry', 'Masonry', 'Plumbing', 'Electrical Work', 'HVAC', 'Welding',
    'Blueprint Reading', 'CAD/CAM', 'CNC Machining', 'Lathe Operation',
    'Milling', '3D Printing', 'Quality Control Inspection',
    'OSHA Safety', 'Forklift Operation', 'Crane Operation', 'Scaffolding',
    'Concrete Finishing', 'Roofing', 'Drywall Installation', 'Painting', 'Flooring',
    'Landscaping', 'Heavy Equipment Operation', 'Auto Mechanics', 'Diesel Mechanics',
    'Electronics Repair', 'Appliance Repair', 'HVAC Installation', 'Pipefitting',
    'Sheet Metal Work', 'Ironwork', 'Glazing', 'Insulation', 'Solar Panel Installation',
  ],
  legal: [
    'Legal Research', 'Legal Writing', 'Contract Drafting', 'Contract Review',
    'Litigation Support', 'Case Management', 'Discovery', 'Deposition Preparation',
    'Court Procedures', 'Regulatory Compliance', 'Corporate Law', 'Intellectual Property',
    'Patent Law', 'Employment Law', 'Real Estate Law', 'Criminal Law', 'Family Law',
    'Paralegal', 'Notary Public', 'Arbitration', 'Policy Analysis',
    'Public Policy', 'Legislative Affairs', 'Grant Management', 'Nonprofit Management',
    'Community Outreach', 'Social Work', 'Crisis Intervention',
    'Substance Abuse Counseling', 'Mental Health Counseling', 'Child Welfare',
    'Urban Planning', 'Zoning', 'Environmental Compliance', 'Emergency Management',
  ],
  education: [
    'Curriculum Development', 'Instructional Design', 'Lesson Planning', 'Classroom Management',
    'Online Teaching', 'E-Learning', 'Learning Management Systems (LMS)', 'Moodle',
    'Canvas', 'Blackboard', 'Google Classroom', 'Microsoft Teams for Education',
    'Assessment Design', 'Rubric Development', 'Differentiated Instruction', 'Special Education',
    'ESL Teaching', 'Adult Education', 'Corporate Training', 'Technical Training',
    'Soft Skills Training', 'Facilitation', 'Public Speaking', 'Presentation Skills',
    'Educational Technology', 'Gamification', 'Microlearning', 'Blended Learning',
    'Student Counseling', 'Academic Advising', 'Research Methodology',
  ],
  languages: [
    'English', 'Spanish', 'Mandarin Chinese', 'French', 'German', 'Japanese', 'Korean',
    'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Italian', 'Dutch', 'Swedish', 'Polish',
    'Translation', 'Interpretation', 'Localization', 'Cross-Cultural Communication',
    'International Business', 'Global Supply Chain', 'Expatriate Management',
  ],
  'soft-skills': [
    'Communication', 'Active Listening',
    'Written Communication', 'Interpersonal Skills', 'Emotional Intelligence', 'Empathy',
    'Persuasion', 'Influence', 'Networking',
    'Teamwork', 'Collaboration', 'Cross-Functional Collaboration', 'Remote Collaboration',
    'Leadership', 'Team Management', 'People Management', 'Delegation', 'Motivation',
    'Strategic Thinking', 'Critical Thinking', 'Problem Solving',
    'Analytical Thinking', 'Creative Thinking', 'Innovation', 'Decision Making',
    'Adaptability', 'Flexibility', 'Resilience', 'Stress Management', 'Time Management',
    'Prioritization', 'Organization', 'Attention to Detail', 'Multitasking',
    'Project Management', 'Waterfall', 'PMI/PMP',
    'Stakeholder Management', 'Resource Management',
    'Self-Motivation', 'Accountability', 'Professionalism', 'Work Ethic', 'Integrity',
    'Dependability', 'Punctuality', 'Continuous Learning', 'Curiosity', 'Growth Mindset',
  ],
  office: [
    'Microsoft Office Suite', 'Microsoft Word', 'Microsoft Excel', 'Microsoft PowerPoint',
    'Microsoft Outlook', 'Microsoft Teams', 'Google Workspace', 'Google Docs', 'Google Sheets',
    'Google Slides', 'Google Drive', 'Slack', 'Zoom', 'Notion', 'Asana', 'Trello',
    'Monday.com', 'ClickUp', 'Basecamp', 'Smartsheet', 'Airtable', 'Dropbox', 'OneDrive',
    'Data Entry', 'Typing (WPM)', 'Transcription', 'Minute Taking', 'Calendar Management',
    'Travel Coordination', 'Event Planning', 'Office Management', 'Reception',
    'Customer Service', 'Phone Etiquette', 'Help Desk', 'Ticketing Systems', 'Zendesk',
    'Freshdesk', 'Intercom', 'Live Chat Support',
  ],
}

export const GENERAL_SUGGESTIONS: string[] = [
  'Microsoft 365', 'Google Calendar', 'File Management', 'Document Preparation',
  'Report Writing', 'Meeting Coordination', 'Task Tracking', 'Workplace Etiquette',
  'Professional Email', 'Remote Work Tools', 'New Hire Onboarding', 'Knowledge Management',
  'Process Documentation', 'Project Coordination',
]

export const SKILL_CATEGORIES: Record<Exclude<SkillNiche, 'general'>, string[]> & {
  general: string[]
} = {
  ...categoryData,
  general: GENERAL_SUGGESTIONS,
}

export const SKILL_NICHES = [
  { id: 'general', label: 'General' },
  { id: 'tech', label: 'Technology & Engineering' },
  { id: 'design', label: 'Design & Creative' },
  { id: 'business', label: 'Business, Finance & Operations' },
  { id: 'marketing', label: 'Marketing, Sales & Communications' },
  { id: 'hr', label: 'Human Resources & People Operations' },
  { id: 'healthcare', label: 'Healthcare & Life Sciences' },
  { id: 'trades', label: 'Trades, Construction & Manufacturing' },
  { id: 'legal', label: 'Legal, Government & Public Service' },
  { id: 'education', label: 'Education & Training' },
  { id: 'languages', label: 'Languages & Global Skills' },
  { id: 'soft-skills', label: 'Soft Skills & Professional Competencies' },
  { id: 'office', label: 'General Office & Administrative' },
] as const

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat()

export const NICHE_ALIASES: Record<string, SkillNiche> = {
  'customer service': 'office',
  'customer support': 'office',
  csr: 'office',
  support: 'office',
  'office admin': 'office',
  administrative: 'office',
  frontend: 'tech',
  'front end': 'tech',
  backend: 'tech',
  'back end': 'tech',
  'full stack': 'tech',
  software: 'tech',
  developer: 'tech',
  programming: 'tech',
  programmer: 'tech',
  engineer: 'tech',
  engineering: 'tech',
  react: 'tech',
  nodejs: 'tech',
  'node.js': 'tech',
  typescript: 'tech',
  javascript: 'tech',
  html: 'tech',
  css: 'tech',
  python: 'tech',
  sql: 'tech',
  aws: 'tech',
  cloud: 'tech',
  devops: 'tech',
  php: 'tech',
  'data science': 'tech',
  'data analysis': 'tech',
  design: 'design',
  'graphic design': 'design',
  'product design': 'design',
  'ux research': 'design',
  'video editing': 'design',
  accounting: 'business',
  finance: 'business',
  financial: 'business',
  bookkeeping: 'business',
  marketing: 'marketing',
  sales: 'marketing',
  seo: 'marketing',
  recruiting: 'hr',
  recruiter: 'hr',
  'talent acquisition': 'hr',
  hr: 'hr',
  'human resources': 'hr',
  nurse: 'healthcare',
  nursing: 'healthcare',
  medical: 'healthcare',
  healthcare: 'healthcare',
  welding: 'trades',
  welder: 'trades',
  electrician: 'trades',
  plumbing: 'trades',
  plumber: 'trades',
  construction: 'trades',
  hvac: 'trades',
  legal: 'legal',
  law: 'legal',
  lawyer: 'legal',
  paralegal: 'legal',
  teaching: 'education',
  teacher: 'education',
  education: 'education',
  esl: 'education',
  spanish: 'languages',
  bilingual: 'languages',
  translation: 'languages',
  communication: 'soft-skills',
  leadership: 'soft-skills',
  teamwork: 'soft-skills',
}

export interface NicheDetection {
  niche: SkillNiche
  matches: string[]
}

export function detectNiche(text: string, selected: string[] = []): NicheDetection {
  const lower = text.toLowerCase()
  const scores: Partial<Record<SkillNiche, number>> = {}

  for (const [phrase, niche] of Object.entries(NICHE_ALIASES)) {
    if (lower.includes(phrase)) scores[niche] = (scores[niche] ?? 0) + 3
  }

  for (const [niche, skills] of Object.entries(categoryData) as [Exclude<SkillNiche, 'general'>, string[]][]) {
    let score = 0
    for (const skill of skills) {
      const needle = skill.toLowerCase()
      if (needle.length >= 4 && lower.includes(needle)) score += 1
    }
    if (score > 0) scores[niche] = (scores[niche] ?? 0) + score
  }

  const ranked = (Object.entries(scores) as [SkillNiche, number][]).sort((a, b) => b[1] - a[1])
  if (ranked.length === 0) return { niche: 'general', matches: [] }

  const niche = ranked[0][0]
  const matches = ((categoryData as Record<SkillNiche, string[]>)[niche] ?? [])
    .filter((skill) => lower.includes(skill.toLowerCase()) && !selected.includes(skill))
    .slice(0, 8)

  return { niche, matches }
}
