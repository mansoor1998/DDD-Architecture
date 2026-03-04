import { z } from 'zod'

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high'])
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

export const TaskStatusSchema = z.enum(['todo', 'in-progress', 'done'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  due_date: z.string().datetime().nullable(),
})

export type Task = z.infer<typeof TaskSchema>

export const CreateTaskSchema = TaskSchema.omit({ id: true })
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = CreateTaskSchema.partial()
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>
