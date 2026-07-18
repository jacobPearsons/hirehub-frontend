import { LayoutDashboard, Bookmark, Briefcase, Search, Users, Plus } from 'lucide-react'

interface SidebarItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

export const seekerNavItems: SidebarItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Saved Jobs', to: '/dashboard', icon: Bookmark },
  { label: 'Browse Jobs', to: '/jobs', icon: Search },
]

export const employerNavItems: SidebarItem[] = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'Job Listings', to: '/employer/dashboard', icon: Briefcase },
  { label: 'Applicants', to: '/employer/dashboard', icon: Users },
  { label: 'Post Job', to: '/post-job', icon: Plus },
]
