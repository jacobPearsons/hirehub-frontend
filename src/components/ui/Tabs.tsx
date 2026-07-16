import { createContext, useCallback, useContext, useId, useMemo, useState, type ReactNode } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used within <Tabs>')
  return ctx
}

interface RootProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export function TabsRoot({ defaultValue, value, onValueChange, children }: RootProps) {
  const [internalTab, setInternalTab] = useState(defaultValue ?? '')
  const baseId = useId()

  const activeTab = value ?? internalTab
  const setActiveTab = useCallback(
    (v: string) => {
      if (onValueChange) onValueChange(v)
      setInternalTab(v)
    },
    [onValueChange]
  )

  const ctx = useMemo(() => ({ activeTab, setActiveTab, baseId }), [activeTab, setActiveTab, baseId])

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>
}

interface ListProps {
  children: ReactNode
  'aria-label'?: string
}

export function TabsList({ children, 'aria-label': ariaLabel }: ListProps) {
  const { activeTab, setActiveTab } = useTabsContext()

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tabs = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')
      )
      const currentIndex = tabs.findIndex((t) => t.getAttribute('data-value') === activeTab)
      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = (currentIndex + 1) % tabs.length
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = tabs.length - 1
          break
        default:
          return
      }

      const nextTab = tabs[nextIndex]
      setActiveTab(nextTab.getAttribute('data-value')!)
      nextTab.focus()
    },
    [activeTab, setActiveTab]
  )

  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={handleKeyDown} className="flex gap-1 border-b border-hairline mb-8">
      {children}
    </div>
  )
}

interface TriggerProps {
  value: string
  children: ReactNode
}

export function TabsTrigger({ value, children }: TriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      data-value={value}
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-t ${
        isActive
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-muted hover:text-ink hover:border-ink/30'
      }`}
    >
      {children}
    </button>
  )
}

interface ContentProps {
  value: string
  children: ReactNode
}

export function TabsContent({ value, children }: ContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
