export function canManageApplications(user: { role: string; permissions?: string[] } | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  const permissions = user.permissions ?? []
  if (
    permissions.includes('*:*') ||
    permissions.includes('application:*') ||
    permissions.includes('application:update')
  ) {
    return true
  }
  return false
}

export function canPostJob(user: { role: string; permissions?: string[] } | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  const permissions = user.permissions ?? []
  if (
    permissions.includes('*:*') ||
    permissions.includes('job:*') ||
    permissions.includes('job:create')
  ) {
    return true
  }
  return false
}
