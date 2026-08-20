import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '../Tabs'

describe('Tabs', () => {
  it('renders only the active tab panel and animates on switch', async () => {
    const user = userEvent.setup()
    render(
      <TabsRoot defaultValue="a">
        <TabsList aria-label="Test tabs">
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </TabsRoot>,
    )

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Content A')
    expect(screen.queryByText('Content B')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Tab B' }))
    await waitFor(() => expect(screen.queryByText('Content A')).not.toBeInTheDocument())
    const panels = screen.getAllByRole('tabpanel')
    expect(panels).toHaveLength(1)
    expect(panels[0]).toHaveTextContent('Content B')
  })
})
