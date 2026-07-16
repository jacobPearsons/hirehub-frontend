import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { useApp } from '../../context/AppContext'
import { logout } from '../../api/auth'
import { ThemeToggle } from '../ui/ThemeToggle'
import { setAccessToken } from '../../api/client'

const navLinks = [
  { label: 'Jobs', to: '/jobs' },
  { label: 'Blog', to: '/blog' },
  { label: 'For Employers', to: '/employers' },
  { label: 'About', to: '/about' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    setAccessToken(null)
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-canvas border-b border-hairline h-14">
      <Container className="h-full">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded text-ink">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 52" fill="none" className="h-7" aria-hidden="true">
              <rect x="4" y="6" width="40" height="40" rx="8" fill="#ff5600"/>
              <path d="M16 16v20M16 26h16M32 16v20" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <text x="54" y="32" fontFamily="Inter, system-ui, sans-serif" fontSize="22" fontWeight="500" fill="currentColor" letterSpacing="-0.3">HireHub</text>
              <text x="54" y="45" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" opacity="0.6">Community</text>
            </svg>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <span className="w-px h-4 bg-hairline" aria-hidden="true" />
            {user?.role === 'employer' && (
              <NavLink to="/employer/dashboard" className={({ isActive }) =>
                `text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
              }>
                Dashboard
              </NavLink>
            )}
            {user?.role === 'seeker' && (
              <NavLink to="/dashboard" className={({ isActive }) =>
                `text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
              }>
                Dashboard
              </NavLink>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-ink-muted">{user.name}</span>
                <button onClick={handleLogout} className="text-sm text-ink-muted hover:text-ink transition-colors" aria-label="Log out">
                  <LogOut size={18} />
                </button>
                {user.role === 'employer' && (
                  <Link to="/post-job"><Button variant="primary" size="sm">Post a Job</Button></Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/post-job"><Button variant="primary" size="sm">Post a Job</Button></Link>
              </>
            )}
          </div>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                className="md:hidden text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-md"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
              <Dialog.Content
                aria-label="Navigation menu"
                className="fixed inset-0 z-50 bg-canvas flex flex-col items-center justify-center gap-6 md:hidden"
              >
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-md" aria-label="Close menu">
                    <X size={24} />
                  </button>
                </Dialog.Close>

                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <hr className="w-16 border-hairline" />

                {user ? (
                  <>
                    {user.role === 'seeker' && (
                      <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                        }
                      >
                        Dashboard
                      </NavLink>
                    )}
                    {user.role === 'employer' && (
                      <NavLink to="/employer/dashboard" onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                        }
                      >
                        Employer Dashboard
                      </NavLink>
                    )}
                    <button onClick={() => { handleLogout(); setMobileOpen(false) }}
                      className="text-lg font-medium text-ink-muted hover:text-ink transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                      }
                    >
                      Dashboard
                    </NavLink>
                    <NavLink to="/employer/dashboard" onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                      }
                    >
                      Employer Dashboard
                    </NavLink>
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                      <Link to="/post-job"><Button variant="primary" size="sm">Post a Job</Button></Link>
                    </div>
                  </>
                )}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </Container>

    </nav>
  )
}
