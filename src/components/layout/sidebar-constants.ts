import { LayoutDashboard, Bookmark, FileText, Briefcase, Search, Users, Plus, User } from 'lucide-react'

interface SidebarItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

export const seekerNavItems: SidebarItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Saved Jobs', to: '/dashboard?tab=saved', icon: Bookmark },
  { label: 'My Applications', to: '/dashboard?tab=applications', icon: FileText },
  { label: 'Browse Jobs', to: '/jobs', icon: Search },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
]

export const employerNavItems: SidebarItem[] = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'Job Listings', to: '/employer/dashboard?tab=listings', icon: Briefcase },
  { label: 'Applicants', to: '/employer/dashboard?tab=applicants', icon: Users },
  { label: 'Post Job', to: '/post-job', icon: Plus },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
]
