import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../../ui'
import { EmployerPermissionsDialog } from '../EmployerPermissionsDialog'
import type { AdminEmployer, Role, RoleBinding } from '../../../api/admin'

const { mockListRoles, mockListRoleBindings, mockUpdateRoleCapabilities, mockCreateRoleBinding, mockDeleteRoleBinding } = vi.hoisted(() => ({
  mockListRoles: vi.fn(),
  mockListRoleBindings: vi.fn(),
  mockUpdateRoleCapabilities: vi.fn(),
  mockCreateRoleBinding: vi.fn(),
  mockDeleteRoleBinding: vi.fn(),
}))

vi.mock('../../../api/admin', () => ({
  listRoles: mockListRoles,
  listRoleBindings: mockListRoleBindings,
  updateRoleCapabilities: mockUpdateRoleCapabilities,
  createRoleBinding: mockCreateRoleBinding,
  deleteRoleBinding: mockDeleteRoleBinding,
}))

const employer: AdminEmployer = {
  id: 'emp-1',
  name: 'Acme Corp',
  email: 'acme@corp.com',
  companyName: 'Acme',
  avatarUrl: null,
  location: 'New York',
  createdAt: '2026-01-01T00:00:00.000Z',
  _count: { jobListings: 4 },
}

const roleAdmin: Role = { id: 'admin', name: 'Administrator', description: 'Admin', capabilities: [] }
const roleEmployer: Role = {
  id: 'employer',
  name: 'Employer',
  description: 'Employer',
  capabilities: ['job:create', 'application:read', 'application:update', 'legacy:cap'],
}
const roleSeeker: Role = { id: 'seeker', name: 'Job Seeker', description: 'Seeker', capabilities: [] }

const roles: Role[] = [roleAdmin, roleEmployer, roleSeeker]

const bindingEmployer: RoleBinding = {
  id: 'binding-1',
  roleId: roleEmployer.id,
  userId: employer.id,
  contextType: 'global',
  contextId: null,
  expiresAt: null,
  grantedAt: '2026-01-01T00:00:00.000Z',
  status: 'active',
  role: roleEmployer,
}

const bindingOtherUser: RoleBinding = {
  id: 'binding-2',
  roleId: roleSeeker.id,
  userId: 'other-user',
  contextType: 'global',
  contextId: null,
  expiresAt: null,
  grantedAt: '2026-01-01T00:00:00.000Z',
  status: 'active',
  role: roleSeeker,
}

const bindings: RoleBinding[] = [bindingEmployer, bindingOtherUser]

function renderDialog() {
  return render(
    <ToastProvider>
      <EmployerPermissionsDialog employer={employer} open onOpenChange={() => {}} />
    </ToastProvider>,
  )
}

describe('EmployerPermissionsDialog', () => {
  beforeEach(() => {
    mockListRoles.mockReset()
    mockListRoleBindings.mockReset()
    mockUpdateRoleCapabilities.mockReset()
    mockCreateRoleBinding.mockReset()
    mockDeleteRoleBinding.mockReset()
    mockListRoles.mockResolvedValue(roles)
    mockListRoleBindings.mockResolvedValue(bindings)
    mockUpdateRoleCapabilities.mockResolvedValue(roleEmployer)
    mockCreateRoleBinding.mockResolvedValue({ ...bindingOtherUser, id: 'binding-3' })
    mockDeleteRoleBinding.mockResolvedValue(undefined)
  })

  it('renders the employer name, their current bindings, and the grant role select', async () => {
    renderDialog()

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument()

    const select = screen.getByLabelText('Role to grant')
    const options = within(select).getAllByRole('option').map((o) => o.textContent)
    expect(options).toContain('Employer')
    expect(options).toContain('Job Seeker')
    expect(options).not.toContain('Administrator')

    expect(screen.getAllByRole('button', { name: 'Remove' })).toHaveLength(1)
    const unknownCap = screen.getByRole('checkbox', { name: 'legacy:cap' })
    expect(unknownCap).toBeChecked()
    expect(unknownCap).toBeDisabled()
  })

  it('excludes the Administrator role from the grant select but renders the Employer Capabilities editor with real seeded role data', async () => {
    renderDialog()

    const select = await screen.findByLabelText('Role to grant')
    const options = within(select).getAllByRole('option').map((o) => o.textContent)
    expect(options).not.toContain('Administrator')
    expect(options).toEqual(['Select a role…', 'Employer', 'Job Seeker'])

    const capabilityCheckboxes = screen.getAllByRole('checkbox')
    expect(capabilityCheckboxes.length).toBeGreaterThan(0)
    expect(screen.getByRole('checkbox', { name: 'job:create' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'application:update' })).toBeInTheDocument()
  })

  it('grants a role by calling createRoleBinding with (roleId, employer.id)', async () => {
    const user = userEvent.setup()
    renderDialog()

    await screen.findByLabelText('Role to grant')
    await user.selectOptions(screen.getByLabelText('Role to grant'), roleSeeker.id)
    await user.click(screen.getByRole('button', { name: 'Bind' }))

    await waitFor(() => {
      expect(mockCreateRoleBinding).toHaveBeenCalledWith(roleSeeker.id, employer.id)
    })
  })

  it('removes a binding by calling deleteRoleBinding with the binding id', async () => {
    const user = userEvent.setup()
    renderDialog()

    await screen.findByText('Acme Corp')
    await user.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      expect(mockDeleteRoleBinding).toHaveBeenCalledWith(bindingEmployer.id)
    })
  })

  it('saves capabilities via updateRoleCapabilities preserving unknown capabilities', async () => {
    const user = userEvent.setup()
    renderDialog()

    const updateCheckbox = await screen.findByRole('checkbox', { name: 'application:update' })
    expect(updateCheckbox).toBeChecked()
    await user.click(updateCheckbox)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockUpdateRoleCapabilities).toHaveBeenCalledWith(roleEmployer.id, [
        'job:create',
        'application:read',
        'legacy:cap',
      ])
    })
  })

  it('refetches roles and bindings after a grant, remove, and save', async () => {
    const user = userEvent.setup()
    renderDialog()

    await screen.findByLabelText('Role to grant')

    const rolesBefore = mockListRoles.mock.calls.length
    const bindingsBefore = mockListRoleBindings.mock.calls.length

    await user.selectOptions(screen.getByLabelText('Role to grant'), roleSeeker.id)
    await user.click(screen.getByRole('button', { name: 'Bind' }))

    await waitFor(() => {
      expect(mockCreateRoleBinding).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockListRoles.mock.calls.length).toBeGreaterThan(rolesBefore)
      expect(mockListRoleBindings.mock.calls.length).toBeGreaterThan(bindingsBefore)
    })

    const rolesAfterGrant = mockListRoles.mock.calls.length
    const bindingsAfterGrant = mockListRoleBindings.mock.calls.length

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() => {
      expect(mockDeleteRoleBinding).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockListRoles.mock.calls.length).toBeGreaterThan(rolesAfterGrant)
      expect(mockListRoleBindings.mock.calls.length).toBeGreaterThan(bindingsAfterGrant)
    })

    const rolesAfterRemove = mockListRoles.mock.calls.length
    const bindingsAfterRemove = mockListRoleBindings.mock.calls.length

    await user.click(screen.getByRole('checkbox', { name: 'application:update' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(mockUpdateRoleCapabilities).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockListRoles.mock.calls.length).toBeGreaterThan(rolesAfterRemove)
      expect(mockListRoleBindings.mock.calls.length).toBeGreaterThan(bindingsAfterRemove)
    })
  })
})
