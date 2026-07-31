import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import ScrollToTop from './ScrollToTop'
import { Preloader } from '../ui/Preloader'

interface LayoutProps {
  children: ReactNode
}

const isDashboardPath = (pathname: string) =>
  pathname === '/dashboard' ||
  pathname.startsWith('/dashboard/') ||
  pathname === '/employer/dashboard' ||
  pathname.startsWith('/employer/dashboard/') ||
  pathname === '/admin'

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const inDashboard = isDashboardPath(pathname)

  return (
    <>
      <Preloader />
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-white focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      {!inDashboard && <Navbar />}
      <main id="main-content" className="min-h-screen">{children}</main>
      {!inDashboard && <Footer />}
    </>
  )
}
