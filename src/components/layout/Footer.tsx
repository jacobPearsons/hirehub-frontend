import { Link } from 'react-router-dom'
import { Globe, MessageCircle, ExternalLink } from 'lucide-react'
import { Container } from '../ui/Container'

const footerLinks = {
  jobs: [
    { label: 'Browse Jobs', to: '/jobs' },
    { label: 'Remote Jobs', to: '/jobs?type=remote' },
    { label: 'Full-Time', to: '/jobs?type=full-time' },
    { label: 'Freelance', to: '/jobs?type=freelance' },
  ],
  resources: [
    { label: 'Blog', to: '/blog' },
    { label: 'Career Advice', to: '/blog' },
    { label: 'Salary Guide', to: '/blog' },
    { label: 'Help Center', to: '#' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'For Employers', to: '/employers' },
    { label: 'Contact', to: '/contact' },
    { label: 'Post a Job', to: '/post-job' },
    { label: 'Privacy Policy', to: '#' },
  ],
}

const socialLinks = [
  { icon: Globe, href: '#' },
  { icon: MessageCircle, href: '#' },
  { icon: ExternalLink, href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline py-16">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <svg viewBox="0 0 220 52" fill="none" className="h-7 mb-2 text-ink" aria-label="HireHub">
              <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
              <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
              <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
            </svg>
            <p className="text-sm text-ink-muted">
              Find your next opportunity.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-3">Jobs</p>
            {footerLinks.jobs.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-sm text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded mb-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-3">Resources</p>
            {footerLinks.resources.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-sm text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded mb-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-3">Company</p>
            {footerLinks.company.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-sm text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded mb-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-hairline-soft mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ink-subtle">
            © 2026 HireHub Community. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
                  aria-label={link.icon.name}
                >
                  <Icon size={18} />
                </a>
              )
            })}
          </div>
        </div>
      </Container>
    </footer>
  )
}
