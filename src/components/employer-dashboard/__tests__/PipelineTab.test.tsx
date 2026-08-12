import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DndContext } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import { ToastProvider } from '../../ui'
import { useApplications } from '../../../context/ApplicationsContext'
import { PipelineTab } from '../PipelineTab'
import type { Application } from '../../../types/application'

interface DragEndPayload {
  active: { id: string }
  over: { id: string }
}

type MockDndContext = { __dragEnd?: (event: DragEndPayload) => void }

vi.mock('@dnd-kit/core', () => {
  const DndContext = ({ children, onDragEnd }: { children?: ReactNode; onDragEnd?: (event: DragEndPayload) => void }) => {
    ;(DndContext as unknown as MockDndContext).__dragEnd = onDragEnd
    return children
  }
  return {
    DndContext,
    useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {}, transform: null, isDragging: false }),
    useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
    DragOverlay: ({ children }: { children?: ReactNode }) => children ?? null,
  }
})

function drag(appId: string, from: string, to: string) {
  ;(DndContext as unknown as MockDndContext).__dragEnd?.({ active: { id: `col-${from}:${appId}` }, over: { id: `col-${to}` } })
}

vi.mock('../../../context/ApplicationsContext', () => ({
  useApplications: vi.fn(() => ({ applications: [], updateApplicationStatus: vi.fn() })),
}))

const baseApp = (overrides: Partial<Application>): Application => ({
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi there',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

function renderPipelineTab(applications: Application[]) {
  const updateApplicationStatus = vi.fn().mockResolvedValue(undefined)
  vi.mocked(useApplications).mockReturnValue({ applications, updateApplicationStatus })
  render(
    <ToastProvider>
      <MemoryRouter>
        <PipelineTab applications={applications} />
      </MemoryRouter>
    </ToastProvider>,
  )
  return { updateApplicationStatus }
}

describe('PipelineTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 6 column headers and places a card in its column', () => {
    renderPipelineTab([baseApp({})])

    for (const label of ['Applied', 'Screening', 'Shortlist', 'Interviewing', 'Offer', 'Hired']) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Applied column')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Applied column')).getByText('Engineer')).toBeInTheDocument()
  })

  it('calls updateApplicationStatus with SCREENING when dragging applied → screening', async () => {
    const { updateApplicationStatus } = renderPipelineTab([baseApp({})])

    drag('a1', 'applied', 'screening')

    await waitFor(() => {
      expect(updateApplicationStatus).toHaveBeenCalledWith('a1', 'SCREENING')
    })
  })

  it('does not call updateApplicationStatus for an illegal applied → offer drag', () => {
    const { updateApplicationStatus } = renderPipelineTab([baseApp({})])

    drag('a1', 'applied', 'offer')

    expect(updateApplicationStatus).not.toHaveBeenCalled()
  })

  it('shows rejected and withdrawn cards in the Closed section, not in the columns', () => {
    renderPipelineTab([
      baseApp({}),
      baseApp({ id: 'a2', jobTitle: 'Rejected Role', status: 'rejected' }),
      baseApp({ id: 'a3', jobTitle: 'Withdrawn Role', status: 'withdrawn' }),
    ])

    const closed = screen.getByLabelText('Closed applications')
    expect(within(closed).getByText('Rejected Role')).toBeInTheDocument()
    expect(within(closed).getByText('Withdrawn Role')).toBeInTheDocument()

    expect(within(screen.getByLabelText('Applied column')).getByText('Engineer')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Applied column')).queryByText('Rejected Role')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Rejected column')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Withdrawn column')).not.toBeInTheDocument()
  })
})
