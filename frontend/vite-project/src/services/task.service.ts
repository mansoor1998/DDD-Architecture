import { apiClient } from './http.client'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@models/task.model'

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>('/tasks/')
    return data
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`)
    return data
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks/', dto)
    return data
  },

  update: async (id: string, dto: UpdateTaskDto): Promise<Task> => {
    const { data } = await apiClient.put<Task>(`/tasks/${id}`, dto)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`)
  },
}
