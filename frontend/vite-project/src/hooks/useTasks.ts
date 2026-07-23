import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@services/task.service'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@models/task.model'
import { toast } from 'react-toastify'

export const TASK_KEYS = {
  all:    ['tasks']           as const,
  detail: (id: string) => ['tasks', id] as const,
}

// TODO: The implementation using clientIdMap to handle the unique keys is not the best approach 
// might need to think of something else, but this needs to be changed

// Session-stable mapping of server IDs to client-generated IDs
const clientIdMap = new Map<string, string>()

const getOrCreateClientId = (serverId: string) => {
  if (!clientIdMap.has(serverId)) {
    clientIdMap.set(serverId, crypto.randomUUID())
  }
  return clientIdMap.get(serverId)!
}

export function useTasks() {
  return useQuery({
    queryKey: TASK_KEYS.all,
    queryFn: async () => {
      const tasks = await taskService.getAll()
      return tasks.map(t => ({ 
        ...t, 
        clientId: getOrCreateClientId(t.id) 
      }))
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: async () => {
      const task = await taskService.getById(id)
      return { 
        ...task, 
        clientId: getOrCreateClientId(task.id) 
      }
    },
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
            clientId: tempId, // Our own assigned ID
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
      // Register the link between the real server ID and our client ID
      if (context?.tempId) {
        clientIdMap.set(createdTask.id, context.tempId)
      }

      queryClient.setQueryData<Task[]>(TASK_KEYS.all, (old) => 
        old?.map(task => 
          task.clientId === context?.tempId 
            ? { ...createdTask, clientId: context.tempId } 
            : task
        )
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
    //   queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
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
      queryClient.setQueryData<Task[]>(TASK_KEYS.all, (old) => 
        old?.map(task => 
          task.id === id 
            ? { ...updatedTask, clientId: task.clientId } 
            : task
        )
      )
      queryClient.setQueryData(TASK_KEYS.detail(id), { 
        ...updatedTask, 
        clientId: clientIdMap.get(id) || id 
      })
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
    //   queryClient.invalidateQueries({ queryKey: TASK_KEYS.all })
    //   queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) })
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
    onSuccess: (_, id) => {
      clientIdMap.delete(id)
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

