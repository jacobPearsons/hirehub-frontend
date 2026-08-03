export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: { name: string; avatar: string; role: string };
  date: string;
  readTime: number;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "beginners-guide-to-getting-hired-on-hirehub",
    title: "A Beginner's Guide to Getting Hired on HireHub",
    excerpt:
      "New to HireHub? From your first registration to signing an offer, here's how to make the most of the platform at every step.",
    content:
      "Whether you're a first-time job seeker or returning to the market, getting started on HireHub is simpler than it looks. This guide walks you through the entire journey \u2014 from creating your account to accepting an offer \u2014 so you know exactly what to expect at every stage.\n\nThe first step is registering. Create your account with an email address, then take the time to build out a complete profile. Add your skills, years of experience, preferred location, and work preferences, because employers search and filter candidates by exactly these details. A complete profile is the difference between being found and being skipped.\n\nOnce your profile is ready, browse the job board and use the filters to narrow results by category, seniority, location, or remote availability. When you find a role that fits, tailor your application to the position \u2014 a short, specific cover letter goes a long way. Applying on HireHub takes just a few clicks, so don't hesitate to put yourself forward.\n\nAfter you apply, your application moves through a clear hiring flow \u2014 from submitted, to review, to interview, and finally to offer or close. You can follow your application's progress in real time from the My Applications dashboard. Status updates are pushed to your dashboard the moment they happen, so there's no refreshing or guessing \u2014 you always know where you stand.\n\nWhen a company wants to move forward, they'll reach out to schedule an interview. Treat every interview as a two-way conversation: prepare examples that show your skills in action, research the company beforehand, and use the chance to ask questions of your own about the team, the role, and what success looks like.\n\nIf things go well, you'll receive an offer. Review every detail carefully \u2014 salary, benefits, start date, and any flexibility around location or schedule \u2014 and don't be afraid to ask clarifying questions. If you're weighing multiple offers, compare them on the whole picture rather than just the number.\n\nFinally, remember that landing a job is a numbers game. Keep your profile fresh, keep applying, and treat each application as practice for the next. With the right approach, HireHub can take you from first register to signed offer in less time than you think.",
    image: "https://picsum.photos/seed/beginners-guide-to-getting-hired-on-hirehub/800/400",
    category: "Career Advice",
    author: {
      name: "Priya Patel",
      avatar: "https://i.pravatar.cc/150?u=priya-patel",
      role: "Career Coach",
    },
    date: "2026-08-03",
    readTime: 8,
    featured: false,
  },
  {
    slug: "remote-hiring-best-practices",
    title: "Remote Hiring Best Practices for 2026",
    excerpt:
      "Learn how top companies are finding and hiring remote talent in an increasingly distributed world.",
    content:
      "Remote hiring has evolved from a pandemic-era necessity to a permanent strategic advantage. Companies that hire remotely access a global talent pool, reduce overhead costs, and build more diverse teams.\n\nBut remote hiring comes with its own set of challenges. How do you assess cultural fit over video calls? How do you ensure new hires feel connected from day one? And how do you scale your hiring process without sacrificing quality?\n\nIn this guide, we share best practices from companies that have mastered remote hiring. You'll learn about structured interview processes, async assessment techniques, and onboarding strategies that set new hires up for success.\n\nWe also cover the tools and technologies that make remote hiring seamless, from collaborative coding platforms to virtual whiteboarding sessions. Whether you're hiring your first remote employee or scaling a distributed team, these practices will help you build a world-class remote workforce.",
    image: "https://picsum.photos/seed/remote-hiring-best-practices/800/400",
    category: "Hiring Tips",
    author: {
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?u=sarah-chen",
      role: "Head of Talent",
    },
    date: "2026-07-01",
    readTime: 8,
    featured: true,
  },
  {
    slug: "building-inclusive-engineering-culture",
    title: "Building an Inclusive Engineering Culture",
    excerpt:
      "Practical strategies for creating a workplace where every engineer feels valued and empowered.",
    content:
      "Inclusive engineering cultures don't happen by accident. They require intentional design, continuous investment, and a willingness to challenge the status quo.\n\nWhen engineers feel included, they contribute more freely, collaborate more effectively, and produce better work. Research shows that diverse teams make better decisions and build more innovative products.\n\nThis post explores concrete strategies for building inclusion into every layer of your engineering organization. From hiring and onboarding to code review and promotion processes, we share actionable changes that make a real difference.\n\nWe also discuss common pitfalls — like performative diversity initiatives or mentorship programs that lack accountability — and how to avoid them. Building an inclusive culture is a journey, not a destination, but the rewards are immense.",
    image: "https://picsum.photos/seed/building-inclusive-engineering-culture/800/400",
    category: "Company Culture",
    author: {
      name: "Marcus Johnson",
      avatar: "https://i.pravatar.cc/150?u=marcus-johnson",
      role: "Director of Engineering",
    },
    date: "2026-06-25",
    readTime: 10,
    featured: false,
  },
  {
    slug: "navigating-career-transitions-in-tech",
    title: "Navigating Career Transitions in Tech",
    excerpt:
      "A step-by-step guide to switching roles, industries, or career paths within the technology sector.",
    content:
      "Career transitions in tech are more common than ever. Whether you're moving from IC to management, switching from frontend to backend, or pivoting from marketing to product, the path forward can feel both exciting and daunting.\n\nThis article breaks down the career transition process into manageable steps. We cover how to assess your transferable skills, fill knowledge gaps, and position yourself as a strong candidate in a new domain.\n\nYou'll learn from people who have successfully navigated major career changes — including an engineer who became a product manager, a designer who moved into research, and a sales professional who transitioned to customer success.\n\nWe also address the emotional side of career change: imposter syndrome, the fear of starting over, and how to build confidence in a new identity. With the right strategy and mindset, a career transition can be the best move you ever make.",
    image: "https://picsum.photos/seed/navigating-career-transitions-in-tech/800/400",
    category: "Career Advice",
    author: {
      name: "Priya Patel",
      avatar: "https://i.pravatar.cc/150?u=priya-patel",
      role: "Career Coach",
    },
    date: "2026-06-20",
    readTime: 7,
    featured: false,
  },
  {
    slug: "compensation-trends-in-hiring",
    title: "Compensation Trends Shaping Hiring in 2026",
    excerpt:
      "An analysis of salary benchmarks, equity packages, and total compensation trends across the tech industry.",
    content:
      "Compensation is one of the most critical factors in attracting and retaining top talent. In 2026, several key trends are reshaping how companies approach pay.\n\nFirst, salary transparency is becoming the norm. More states and countries are passing pay transparency laws, and candidates expect to see salary ranges on job postings. Companies that resist this trend risk losing top candidates.\n\nSecond, equity compensation is evolving. With market volatility, companies are exploring new structures like extended exercise windows and early liquidity programs. We break down what candidates should look for in an equity offer.\n\nFinally, remote work has introduced geographic salary adjustments — and controversy. We examine the arguments for and against location-based pay, and how some companies are opting for a pure skill-based approach instead.",
    image: "https://picsum.photos/seed/compensation-trends-in-hiring/800/400",
    category: "Industry News",
    author: {
      name: "Alex Kim",
      avatar: "https://i.pravatar.cc/150?u=alex-kim",
      role: "Compensation Analyst",
    },
    date: "2026-06-15",
    readTime: 9,
    featured: false,
  },
  {
    slug: "writing-job-descriptions-that-attract",
    title: "Writing Job Descriptions That Actually Attract Talent",
    excerpt:
      "How to craft job postings that stand out, reduce bias, and convert top candidates into applicants.",
    content:
      "Your job description is often the first impression a candidate has of your company. A great one can convince a passive candidate to apply. A bad one can scare away your ideal hire.\n\nThis article breaks down the anatomy of an effective job description. We cover everything from title wording and salary transparency to culture descriptions and requirements lists.\n\nOne of the biggest mistakes companies make is listing too many requirements, which disproportionately discourages underrepresented candidates. We share research-backed strategies for writing inclusive descriptions that attract diverse applicants.\n\nYou'll also learn about structuring descriptions for readability, using storytelling to convey company values, and A/B testing your postings to continuously improve conversion rates. Small changes in how you describe a role can have an outsized impact on who applies.",
    image: "https://picsum.photos/seed/writing-job-descriptions-that-attract/800/400",
    category: "Hiring Tips",
    author: {
      name: "Sarah Chen",
      avatar: "https://i.pravatar.cc/150?u=sarah-chen",
      role: "Head of Talent",
    },
    date: "2026-06-10",
    readTime: 6,
    featured: false,
  },
  {
    slug: "future-of-distributed-teams",
    title: "The Future of Distributed Teams: What We've Learned",
    excerpt:
      "Lessons from companies that have been fully remote for years, and what the future holds for distributed work.",
    content:
      "Distributed work is no longer an experiment — it's a proven model that some of the most successful companies have embraced for years. But what separates thriving distributed teams from struggling ones?\n\nThis piece draws on lessons from companies that have been fully remote since before the pandemic. We look at what they do differently in areas like communication, culture, career development, and decision-making.\n\nKey themes include the importance of async-first communication, investing heavily in documentation, being intentional about social connection, and rethinking performance evaluation for an environment where you can't see people working.\n\nWe also explore emerging trends: AI-powered productivity tools, virtual reality meeting spaces, and four-day workweeks. The future of distributed work is bright, but it requires deliberate effort from leadership and team members alike.",
    image: "https://picsum.photos/seed/future-of-distributed-teams/800/400",
    category: "Company Culture",
    author: {
      name: "Marcus Johnson",
      avatar: "https://i.pravatar.cc/150?u=marcus-johnson",
      role: "Director of Engineering",
    },
    date: "2026-06-05",
    readTime: 11,
    featured: false,
  },
];
