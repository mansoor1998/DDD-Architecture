import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@services/task.service'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@models/task.model'
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
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all })
      const previousTasks = queryClient.getQueryData<Task[]>(TASK_KEYS.all)
      
      const tempId = crypto.randomUUID()

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(TASK_KEYS.all, [
          ...previousTasks,
          { 
            ...newTask, 
            id: tempId, 
            user_id: '', 
            status: newTask.status || 'pending',
            priority: newTask.priority || 'medium',
            created_at: new Date().toISOString() 
          } as Task,
        ])
      }

      return { previousTasks, tempId }
    },
    onSuccess: (createdTask, _variables, context) => {
      // Replace the optimistic placeholder with the actual server response
      queryClient.setQueryData<Task[]>(TASK_KEYS.all, (old) => 
        old?.map(task => task.id === context?.tempId ? createdTask : task)
      )
    },
    onError: (err: any, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.all, context.previousTasks)
      }
      err.handled = true
      toast.error(err.message || 'Failed to create task')
    },
    // onSettled: () => {
    //   // queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
    // },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string, dto: UpdateTaskDto }) => 
      taskService.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all })
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.detail(id) })

      const previousTasks = queryClient.getQueryData<Task[]>(TASK_KEYS.all)
      const previousTask = queryClient.getQueryData<Task>(TASK_KEYS.detail(id))

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          TASK_KEYS.all,
          previousTasks.map((t) => (t.id === id ? { ...t, ...dto } : t))
        )
      }

      if (previousTask) {
        queryClient.setQueryData<Task>(TASK_KEYS.detail(id), {
          ...previousTask,
          ...dto,
        })
      }

      return { previousTasks, previousTask }
    },
    onSuccess: (updatedTask, { id }) => {
      // Update with exact server response (includes updated_at, etc.)
      queryClient.setQueryData<Task[]>(TASK_KEYS.all, (old) => 
        old?.map(task => task.id === id ? updatedTask : task)
      )
      queryClient.setQueryData(TASK_KEYS.detail(id), updatedTask)
    },
    onError: (err: any, { id }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.all, context.previousTasks)
      }
      if (context?.previousTask) {
        queryClient.setQueryData(TASK_KEYS.detail(id), context.previousTask)
      }
      err.handled = true
      toast.error(err.message || 'Failed to update task')
    },
    // onSettled: (data, error, { id }) => {
    //   // queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
    //   // queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) })
    // },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.all })

      const previousTasks = queryClient.getQueryData<Task[]>(TASK_KEYS.all)

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          TASK_KEYS.all,
          previousTasks.filter((t) => t.id !== id)
        )
      }

      return { previousTasks }
    },
    onError: (err: any, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.all, context.previousTasks)
      }
      err.handled = true
      toast.error(err.message || 'Failed to delete task')
    },
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
    // },
  })
}

