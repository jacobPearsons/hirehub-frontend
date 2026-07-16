import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listApplications, createApplication } from '../api/applications'

export function useApplicationsQuery() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: listApplications,
  })
}

export function useCreateApplicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createApplication>[0]) => createApplication(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
