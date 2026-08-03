import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationsProvider } from './context/NotificationsContext'
import Layout from './components/layout/Layout'
import { ToastProvider } from './components/ui/Toast'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { NotFoundPage } from './components/ui/NotFoundPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardShell } from './components/layout/DashboardShell'

const HomePage = lazy(() => import('./components/home/HomePage'))
const JobBoardPage = lazy(() => import('./components/jobs/JobBoardPage'))
const JobDetailPage = lazy(() => import('./components/jobs/JobDetailPage'))
const BlogPage = lazy(() => import('./components/blog/BlogPage'))
const BlogPostPage = lazy(() => import('./components/blog/BlogPostPage'))
const EmployersPage = lazy(() => import('./components/employers/EmployersPage'))
const LoginPage = lazy(() => import('./components/auth/LoginPage'))
const SignupPage = lazy(() => import('./components/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'))
const OnboardingWizard = lazy(() => import('./components/onboarding/OnboardingWizard'))
const AboutPage = lazy(() => import('./components/about/AboutPage'))
const ContactPage = lazy(() => import('./components/contact/ContactPage'))
const FAQPage = lazy(() => import('./components/faq/FAQPage'))
const PostJobPage = lazy(() => import('./components/post-job/PostJobPage'))
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'))
const EmployerDashboardPage = lazy(() => import('./components/employer-dashboard/EmployerDashboardPage'))
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'))
const AdminPage = lazy(() => import('./components/admin/AdminPage').then((m) => ({ default: m.AdminPage })))

function App() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <ToastProvider>
    <ThemeProvider>
    <NotificationsProvider>
    <Layout>
      <Suspense fallback={
        <main className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="text-center text-ink-muted">Loading...</div>
        </main>
      }>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={{
            initial: reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
            enter: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.35, ease: 'easeOut' } },
            exit: { opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } },
          }} initial="initial" animate="enter" exit="exit">
            <Routes location={location}>
              <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
              <Route path="/jobs" element={<ErrorBoundary><JobBoardPage /></ErrorBoundary>} />
              <Route path="/jobs/:id" element={<ErrorBoundary><JobDetailPage /></ErrorBoundary>} />
              <Route path="/blog" element={<ErrorBoundary><BlogPage /></ErrorBoundary>} />
              <Route path="/blog/:slug" element={<ErrorBoundary><BlogPostPage /></ErrorBoundary>} />
              <Route path="/employers" element={<ErrorBoundary><EmployersPage /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
              <Route path="/signup" element={<ErrorBoundary><SignupPage /></ErrorBoundary>} />
              <Route path="/forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
              <Route path="/reset-password" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
              <Route path="/about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
              <Route path="/contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
              <Route path="/faq" element={<ErrorBoundary><FAQPage /></ErrorBoundary>} />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <DashboardShell>
                    <ErrorBoundary><DashboardPage /></ErrorBoundary>
                  </DashboardShell>
                </ProtectedRoute>
              } />
              <Route path="/employer/dashboard" element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <DashboardShell>
                    <ErrorBoundary><EmployerDashboardPage /></ErrorBoundary>
                  </DashboardShell>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardShell>
                    <ErrorBoundary><AdminPage /></ErrorBoundary>
                  </DashboardShell>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/profile" element={
                <ProtectedRoute allowedRoles={['seeker', 'employer']}>
                  <DashboardShell>
                    <ErrorBoundary><ProfilePage /></ErrorBoundary>
                  </DashboardShell>
                </ProtectedRoute>
              } />
              <Route path="/post-job" element={<ProtectedRoute allowedRoles={['employer']}><ErrorBoundary><PostJobPage /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <ErrorBoundary><OnboardingWizard /></ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </Layout>
    </NotificationsProvider>
    </ThemeProvider>
    </ToastProvider>
  )
}

export default App
