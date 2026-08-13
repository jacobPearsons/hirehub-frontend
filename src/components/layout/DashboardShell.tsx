import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Infobar } from './Infobar'
import type { ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('hirehub-sidebar-collapsed') === 'true' } catch { return false }
  })

  function handleCollapseToggle() {
    setCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('hirehub-sidebar-collapsed', String(next)) } catch { /* intentionally empty */ }
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar mobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <img
            src="/dashboard-bg.png"
            alt=""
            className="w-full h-full object-cover object-top"
            width="1672"
            height="941"
            loading="lazy"
          />
        </div>
        <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
          <Infobar onMenuToggle={() => setSidebarOpen(true)} onCollapseToggle={handleCollapseToggle} collapsed={collapsed} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
