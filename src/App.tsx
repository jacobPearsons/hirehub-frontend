import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import { ToastProvider } from './components/ui/Toast'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

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
const AboutPage = lazy(() => import('./components/about/AboutPage'))
const ContactPage = lazy(() => import('./components/contact/ContactPage'))
const PostJobPage = lazy(() => import('./components/post-job/PostJobPage'))
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'))
const EmployerDashboardPage = lazy(() => import('./components/employer-dashboard/EmployerDashboardPage'))

function App() {
  const location = useLocation()

  return (
    <HelmetProvider>
    <ToastProvider>
    <ThemeProvider><Layout>
      <Suspense fallback={
        <main className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="text-center text-ink-muted">Loading...</div>
        </main>
      }>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={{
            initial: { opacity: 0, y: 12 },
            enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
            exit: { opacity: 0, transition: { duration: 0.15 } },
          }} initial="initial" animate="enter" exit="exit">
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobBoardPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/employers" element={<EmployersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['seeker']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboardPage /></ProtectedRoute>} />
              <Route path="/post-job" element={<ProtectedRoute allowedRoles={['employer']}><PostJobPage /></ProtectedRoute>} />
              <Route path="*" element={
                <main className="min-h-screen flex items-center justify-center bg-canvas">
                  <div className="text-center">
                    <h1 className="text-[56px] font-medium text-ink mb-4">404</h1>
                    <p className="text-lg text-ink-muted mb-6">Page not found</p>
                    <Link to="/" className="text-accent hover:underline text-sm font-medium">Go home</Link>
                  </div>
                </main>
              } />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </Layout></ThemeProvider>
    </ToastProvider>
    </HelmetProvider>
  )
}

export default App
