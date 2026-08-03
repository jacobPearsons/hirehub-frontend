import { act, renderHook, waitFor } from '@testing-library/react'
import { SavedJobsProvider, useSavedJobs } from '../SavedJobsContext'

const {
  getAccessTokenMock,
  listSavedJobsMock,
  saveJobMock,
  removeSavedJobMock,
} = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
  listSavedJobsMock: vi.fn(),
  saveJobMock: vi.fn(),
  removeSavedJobMock: vi.fn(),
}))

vi.mock('../../api/client', () => ({
  API_BASE: 'http://localhost:4000/api',
  getAccessToken: getAccessTokenMock,
}))

vi.mock('../../api/savedJobs', () => ({
  listSavedJobs: listSavedJobsMock,
  saveJob: saveJobMock,
  removeSavedJob: removeSavedJobMock,
}))

describe('SavedJobsContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    getAccessTokenMock.mockReturnValue(null)
    listSavedJobsMock.mockResolvedValue({ data: [] })
    saveJobMock.mockResolvedValue({ data: {} })
    removeSavedJobMock.mockResolvedValue({ data: {} })
  })

  it('does not double-add the same job id', async () => {
    const { result } = renderHook(() => useSavedJobs(), { wrapper: SavedJobsProvider })

    await act(async () => {
      result.current.toggleSaveJob('job-1')
    })
    await waitFor(() => expect(result.current.savedJobIds).toContain('job-1'))
    expect(saveJobMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.toggleSaveJob('job-1')
    })
    // optimistic state already contains job-1, so second call should remove it (toggle semantics)
    await waitFor(() => expect(result.current.savedJobIds).not.toContain('job-1'))
    expect(removeSavedJobMock).toHaveBeenCalledTimes(1)
  })

  it('ignores a second toggle while the first save is in flight', async () => {
    let resolveFirst!: () => void
    saveJobMock.mockReturnValueOnce(
      new Promise<{ data: Record<string, never> }>((res) => {
        resolveFirst = () => res({ data: {} })
      }),
    )

    const { result } = renderHook(() => useSavedJobs(), { wrapper: SavedJobsProvider })

    // Two toggles in the same tick simulate a double-fire before state settles.
    act(() => {
      result.current.toggleSaveJob('job-1')
      result.current.toggleSaveJob('job-1')
    })

    await act(async () => {
      resolveFirst()
    })

    await waitFor(() => expect(result.current.savedJobIds).toEqual(['job-1']))
    expect(saveJobMock).toHaveBeenCalledTimes(1)
    expect(removeSavedJobMock).not.toHaveBeenCalled()
  })
})
