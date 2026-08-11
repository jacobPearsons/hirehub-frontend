import { describe, expect, it, afterEach, vi } from 'vitest'
import { normalizeApplication, createApplication, updateApplicationStatus, listApplications, getCandidateProfile, getApplication, withdrawApplication, resumeFileUrl } from '../applications'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeApplication', () => {
  it('flattens nested job and lowercases uppercase status', () => {
    const app = normalizeApplication({
      id: 'app-1',
      jobId: 'job-1',
      job: { title: 'Senior Engineer', company: 'Acme', companyLogo: '/logos/acme.png' },
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      status: 'INTERVIEWING',
      submittedAt: '2026-07-01T00:00:00.000Z',
    })

    expect(app.jobTitle).toBe('Senior Engineer')
    expect(app.company).toBe('Acme')
    expect(app.companyLogo).toBe('/logos/acme.png')
    expect(app.status).toBe('interviewing')
  })

  it('reconciles hiring-data fields into typed fields', () => {
    const interviewData = { interviewType: 'video', interviewDate: '2026-08-01', interviewTime: '10:00', interviewerName: 'Bob', interviewerTitle: 'CTO', scheduledAt: '2026-07-01' }
    const app = normalizeApplication({
      id: 'app-1',
      jobId: 'job-1',
      job: { title: 'Senior Engineer', company: 'Acme' },
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      status: 'APPLIED',
      submittedAt: '2026-07-01T00:00:00.000Z',
      interviewData,
    })

    expect(app.interviewDetails).toEqual(interviewData)
  })

  it('handles missing job (create/updateStatus responses)', () => {
    const app = normalizeApplication({
      id: 'app-1',
      jobId: 'job-1',
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      status: 'APPLIED',
      submittedAt: '2026-07-01T00:00:00.000Z',
    })

    expect(app.jobTitle).toBe('')
    expect(app.company).toBe('')
    expect(app.status).toBe('applied')
  })

  it('maps screening result, screening answers, and timeline', () => {
    const app = normalizeApplication({
      id: 'app-1',
      jobId: 'job-1',
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      status: 'SCREENING',
      submittedAt: '2026-07-01T00:00:00.000Z',
      screeningResult: { score: 72, maxPossible: 100 },
      screeningAnswers: [
        {
          questionId: 'q1',
          answerText: 'I have 5 years of React experience.',
          score: 8,
          matchedKeywords: ['react', 'typescript'],
          question: { prompt: 'Describe your React experience', expectedKeywords: ['react'], maxScore: 10 },
        },
      ],
      timeline: [
        { id: 't1', fromStatus: null, toStatus: 'APPLIED', actorRole: 'SEEKER', createdAt: '2026-07-01T00:00:00.000Z' },
        { id: 't2', fromStatus: 'APPLIED', toStatus: 'SCREENING', actorRole: 'EMPLOYER', createdAt: '2026-07-02T00:00:00.000Z' },
      ],
    })

    expect(app.screeningResult).toEqual({ score: 72, maxPossible: 100 })
    expect(app.screeningAnswers?.[0].questionId).toBe('q1')
    expect(app.screeningAnswers?.[0].score).toBe(8)
    expect(app.screeningAnswers?.[0].question?.prompt).toBe('Describe your React experience')
    expect(app.timeline).toHaveLength(2)
    expect(app.timeline?.[0]).toEqual({
      id: 't1',
      fromStatus: null,
      toStatus: 'applied',
      actorRole: 'SEEKER',
      createdAt: '2026-07-01T00:00:00.000Z',
    })
    expect(app.timeline?.[1].toStatus).toBe('screening')
  })
})

describe('application API mapping', () => {
  it('createApplication normalizes the created application', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          id: 'app-1',
          jobId: 'job-1',
          applicantName: 'Jane Doe',
          applicantEmail: 'jane@example.com',
          coverLetter: 'Letter',
          status: 'APPLIED',
          submittedAt: '2026-07-01T00:00:00.000Z',
        },
      }),
    }))

    const res = await createApplication({
      jobId: 'job-1',
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
    })

    expect(res.data.status).toBe('applied')
    expect(res.data.jobTitle).toBe('')
  })

  it('updateApplicationStatus sends uppercase status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: 'app-1',
          jobId: 'job-1',
          applicantName: 'Jane Doe',
          applicantEmail: 'jane@example.com',
          coverLetter: 'Letter',
          status: 'OFFER',
          submittedAt: '2026-07-01T00:00:00.000Z',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await updateApplicationStatus('app-1', 'offer')

    const [, options] = fetchMock.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ status: 'OFFER' })
  })

  it('listApplications maps every record', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'app-1',
            jobId: 'job-1',
            job: { title: 'Senior Engineer', company: 'Acme' },
            applicantName: 'Jane Doe',
            applicantEmail: 'jane@example.com',
            coverLetter: 'Letter',
            status: 'SCREENING',
            submittedAt: '2026-07-01T00:00:00.000Z',
          },
        ],
      }),
    }))

    const res = await listApplications()
    expect(res.data[0].status).toBe('screening')
    expect(res.data[0].jobTitle).toBe('Senior Engineer')
  })

  it('createApplication forwards screeningAnswers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          id: 'app-1',
          jobId: 'job-1',
          applicantName: 'Jane Doe',
          applicantEmail: 'jane@example.com',
          coverLetter: 'Letter',
          status: 'SCREENING',
          submittedAt: '2026-07-01T00:00:00.000Z',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await createApplication({
      jobId: 'job-1',
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      screeningAnswers: [{ questionId: 'q1', answerText: 'Yes' }],
    })

    const [, options] = fetchMock.mock.calls[0]
    expect(JSON.parse(options.body).screeningAnswers).toEqual([{ questionId: 'q1', answerText: 'Yes' }])
  })

  it('getApplication GETs the application and normalizes it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: 'app-1',
          jobId: 'job-1',
          applicantName: 'Jane Doe',
          applicantEmail: 'jane@example.com',
          coverLetter: 'Letter',
          status: 'SHORTLIST',
          submittedAt: '2026-07-01T00:00:00.000Z',
        },
      }),
    }))

    const res = await getApplication('app-1')
    expect(res.data.status).toBe('shortlist')

    const [url] = vi.mocked(fetch).mock.calls[0] as [string]
    expect(url).toBe('http://localhost:4000/api/applications/app-1')
  })

  it('withdrawApplication POSTs to the withdraw endpoint and normalizes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: 'app-1',
          jobId: 'job-1',
          applicantName: 'Jane Doe',
          applicantEmail: 'jane@example.com',
          coverLetter: 'Letter',
          status: 'WITHDRAWN',
          submittedAt: '2026-07-01T00:00:00.000Z',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const res = await withdrawApplication('app-1')
    expect(res.data.status).toBe('withdrawn')

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:4000/api/applications/app-1/withdraw')
    expect(options.method).toBe('POST')
  })
})

describe('getCandidateProfile', () => {
  it('GETs the candidate endpoint and normalizes the nested application', async () => {
    const rawApplication = {
      id: 'app-1',
      jobId: 'job-1',
      job: { title: 'Senior Engineer', company: 'Acme' },
      applicantName: 'Jane Doe',
      applicantEmail: 'jane@example.com',
      coverLetter: 'Letter',
      status: 'APPLIED',
      submittedAt: '2026-07-01T00:00:00.000Z',
    }
    const candidate = {
      id: 'u1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      skills: ['Python', 'React'],
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { application: rawApplication, candidate } }),
    })))

    const res = await getCandidateProfile('app-1')
    expect(res.data.candidate.name).toBe('Jane Doe')
    expect(res.data.application.jobTitle).toBe('Senior Engineer')
    expect(res.data.application.status).toBe('applied')

    const [url] = vi.mocked(fetch).mock.calls[0] as [string]
    expect(url).toBe('http://localhost:4000/api/applications/app-1/candidate')
  })
})

describe('resumeFileUrl', () => {
  it('builds the URL from the API origin and encodes the filename', () => {
    expect(resumeFileUrl('1712345.pdf')).toBe('http://localhost:4000/uploads/resumes/1712345.pdf')
    expect(resumeFileUrl('resume one.pdf')).toBe('http://localhost:4000/uploads/resumes/resume%20one.pdf')
  })
})
