import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardShell } from '../DashboardShell'

vi.mock('../Sidebar', () => ({
  Sidebar: ({ mobile, collapsed }: { mobile?: boolean; collapsed?: boolean }) => (
    <div
      data-testid={mobile ? 'sidebar-mobile' : 'sidebar-desktop'}
      data-collapsed={String(!!collapsed)}
    />
  ),
}))

vi.mock('../Infobar', () => ({
  Infobar: ({ onCollapseToggle }: { onCollapseToggle?: () => void }) => (
    <button type="button" data-testid="collapse-toggle" onClick={onCollapseToggle}>
      toggle
    </button>
  ),
}))

describe('DashboardShell', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles the sidebar collapsed state', async () => {
    const user = userEvent.setup()
    render(
      <DashboardShell>
        <div>content</div>
      </DashboardShell>,
    )
    const sidebar = screen.getByTestId('sidebar-desktop')
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    await user.click(screen.getByTestId('collapse-toggle'))
    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  })

  it('initializes collapsed from persisted localStorage', () => {
    localStorage.setItem('hirehub-sidebar-collapsed', 'true')
    render(
      <DashboardShell>
        <div>content</div>
      </DashboardShell>,
    )
    expect(screen.getByTestId('sidebar-desktop')).toHaveAttribute('data-collapsed', 'true')
  })
})
