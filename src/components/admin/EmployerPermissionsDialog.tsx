import { useCallback, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui'
import { useToast } from '../ui/Toast'
import {
  createRoleBinding,
  deleteRoleBinding,
  listRoleBindings,
  listRoles,
  updateRoleCapabilities,
  type AdminEmployer,
  type Role,
  type RoleBinding,
} from '../../api/admin'

const EMPLOYER_CAPABILITIES = [
  'job:create', 'job:read', 'job:update', 'job:delete', 'job:list',
  'application:create', 'application:read', 'application:update', 'application:delete', 'application:list',
  'user:read',
]

interface EmployerPermissionsDialogProps {
  employer: AdminEmployer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployerPermissionsDialog({ employer, open, onOpenChange }: EmployerPermissionsDialogProps) {
  const { showToast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [bindings, setBindings] = useState<RoleBinding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[] | null>(null)

  useEffect(() => {
    if (!open) return
    Promise.all([listRoles(), listRoleBindings()])
      .then(([nextRoles, nextBindings]) => {
        setRoles(nextRoles)
        setBindings(nextBindings)
        setSelectedCapabilities(null)
      })
      .catch(() => setError('Failed to load permissions.'))
      .finally(() => setLoading(false))
  }, [open])

  const refresh = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    Promise.all([listRoles(), listRoleBindings()])
      .then(([nextRoles, nextBindings]) => {
        setRoles(nextRoles)
        setBindings(nextBindings)
        setSelectedCapabilities(null)
      })
      .catch(() => setError('Failed to load permissions.'))
      .finally(() => setLoading(false))
  }, [])

  const employerBindings = bindings.filter((b) => b.userId === employer.id)
  const employerRole = roles.find((r) => r.id === 'employer')
  const hasEmployerRole = employerBindings.some(
    (b) => b.role?.id === 'employer' || (employerRole !== undefined && b.roleId === employerRole.id),
  )

  const catalogSet = new Set(EMPLOYER_CAPABILITIES)
  const draftCapabilities = selectedCapabilities ?? employerRole?.capabilities ?? []
  const unknownCapabilities = draftCapabilities.filter((cap) => !catalogSet.has(cap))
  const savePayload = [
    ...EMPLOYER_CAPABILITIES.filter((cap) => draftCapabilities.includes(cap)),
    ...unknownCapabilities,
  ]

  const isLoading = loading && roles.length === 0 && bindings.length === 0

  function bindingRoleName(binding: RoleBinding) {
    if (binding.role) return binding.role.name
    const role = roles.find((r) => r.id === binding.roleId)
    return role?.name ?? 'Unknown role'
  }

  function bindingCapabilities(binding: RoleBinding) {
    if (binding.role) return binding.role.capabilities
    const role = roles.find((r) => r.id === binding.roleId)
    return role?.capabilities ?? []
  }

  function toggleCapability(capability: string) {
    setSelectedCapabilities((prev) => {
      const base = prev ?? employerRole?.capabilities ?? []
      return base.includes(capability)
        ? base.filter((cap) => cap !== capability)
        : [...base, capability]
    })
  }

  async function handleGrant() {
    if (!selectedRoleId) return
    const role = roles.find((r) => r.id === selectedRoleId)
    try {
      await createRoleBinding(selectedRoleId, employer.id)
      setSelectedRoleId('')
      showToast('success', `Granted ${role?.name ?? 'role'} role to ${employer.name}`)
      refresh(true)
    } catch {
      showToast('error', 'Failed to grant role. Please try again.')
    }
  }

  async function handleRemove(binding: RoleBinding) {
    try {
      await deleteRoleBinding(binding.id)
      showToast('success', `Removed ${bindingRoleName(binding)} role`)
      refresh(true)
    } catch {
      showToast('error', 'Failed to remove role. Please try again.')
    }
  }

  async function handleSaveCapabilities() {
    if (!employerRole) return
    try {
      await updateRoleCapabilities(employerRole.id, savePayload)
      showToast('success', 'Employer capabilities updated')
      refresh(true)
    } catch {
      showToast('error', 'Failed to update capabilities. Please try again.')
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedRoleId('')
        onOpenChange(next)
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-surface-1 rounded-xl p-6 w-full max-w-lg shadow-xl border border-hairline max-h-[85vh] overflow-y-auto"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-ink">Manage Permissions</Dialog.Title>
                      <Dialog.Description className="sr-only">
                        Manage roles and capabilities for {employer.name}.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="p-1 rounded-md text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mb-4">
                    <h2 className="text-base font-medium text-ink">{employer.name}</h2>
                    <p className="text-sm text-ink-muted">{employer.companyName ?? 'No company'}</p>
                  </div>

                  {isLoading && (
                    <div className="flex items-center justify-center py-12 text-ink-muted text-sm">
                      Loading permissions…
                    </div>
                  )}

                  {error && (
                    <div className="py-10 text-center">
                      <p className="text-error text-sm">{error}</p>
                      <Button variant="accent" size="sm" className="mt-4" onClick={() => refresh()}>
                        Retry
                      </Button>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <div className="space-y-6">
                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                          Current Roles
                        </h3>
                        {employerBindings.length === 0 ? (
                          <p className="text-sm text-ink-muted">No roles assigned.</p>
                        ) : (
                          <ul className="space-y-3">
                            {employerBindings.map((binding) => (
                              <li key={binding.id} className="rounded-lg border border-hairline p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">{bindingRoleName(binding)}</p>
                                    {bindingCapabilities(binding).length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {bindingCapabilities(binding).map((cap) => (
                                          <span
                                            key={cap}
                                            className="inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-medium bg-surface-2 text-ink-muted"
                                          >
                                            {cap}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(binding)}
                                    className="text-xs font-medium text-error hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded flex-shrink-0"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>

                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                          Grant Role
                        </h3>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            aria-label="Role to grant"
                            className="flex-1 px-3 py-2 rounded-md border border-hairline bg-surface-1 text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                          >
                            <option value="">Select a role…</option>
                            {roles
                              .filter((r) => r.id !== 'admin')
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                          </select>
                          <Button variant="accent" size="sm" onClick={handleGrant} disabled={!selectedRoleId}>
                            Bind
                          </Button>
                        </div>
                      </section>

                      {hasEmployerRole && employerRole && (
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-2">
                            Employer Capabilities
                          </h3>
                          <div className="space-y-2 rounded-lg border border-hairline p-3">
                            {EMPLOYER_CAPABILITIES.map((cap) => (
                              <label key={cap} className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={draftCapabilities.includes(cap)}
                                  onChange={() => toggleCapability(cap)}
                                  className="accent-accent"
                                />
                                <code className="text-xs">{cap}</code>
                              </label>
                            ))}
                            {unknownCapabilities.map((cap) => (
                              <label key={cap} className="flex items-center gap-2.5 text-sm text-ink-muted">
                                <input type="checkbox" checked disabled className="accent-accent" />
                                <code className="text-xs">{cap}</code>
                              </label>
                            ))}
                          </div>
                          <Button variant="primary" size="sm" className="mt-3" onClick={handleSaveCapabilities}>
                            Save
                          </Button>
                        </section>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
