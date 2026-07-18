import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Infobar } from './Infobar'
import type { ReactNode } from 'react'

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar mobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Infobar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
