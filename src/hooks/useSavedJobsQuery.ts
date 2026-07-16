import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSavedJobs, saveJob, removeSavedJob } from '../api/savedJobs'

export function useSavedJobsQuery() {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: listSavedJobs,
  })
}

export function useSaveJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => saveJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  })
}

export function useRemoveSavedJobMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => removeSavedJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedJobs'] }),
  })
}
