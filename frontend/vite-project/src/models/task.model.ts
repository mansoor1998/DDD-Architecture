import { z } from 'zod'

export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high'])
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

export const TaskSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  status: TaskStatusSchema.default('pending'),
  priority: TaskPrioritySchema.default('medium'),
  due_date: z.string().datetime().nullable(),
  created_at: z.string().datetime().optional(),
})

export type Task = z.infer<typeof TaskSchema>

export const CreateTaskSchema = TaskSchema.omit({ 
  id: true, 
  user_id: true, 
  created_at: true
})
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = CreateTaskSchema.partial()
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>
