import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@services/task.service'
import type { CreateTaskDto, UpdateTaskDto } from '@models/task.model'
import { toast } from 'react-toastify'

export const TASK_KEYS = {
  all:    ['tasks']           as const,
  detail: (id: string) => ['tasks', id] as const,
}

export function useTasks() {
  return useQuery({
    queryKey: TASK_KEYS.all,
    queryFn:  taskService.getAll,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn:  () => taskService.getById(id),
    enabled:  !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => taskService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
      // toast.success('Task created successfully')
    },
    onError: (error: any) => {
      error.handled = true
      toast.error(error.message || 'Failed to create task')
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: UpdateTaskDto }) => 
      taskService.update(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) })
    },
    onError: (error: any) => {
      error.handled = true
      toast.error(error.message || 'Failed to update task')
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
      // toast.success('Task deleted successfully')
    },
    onError: (error: any) => {
      error.handled = true
      toast.error(error.message || 'Failed to delete task')
    }
  })
}
