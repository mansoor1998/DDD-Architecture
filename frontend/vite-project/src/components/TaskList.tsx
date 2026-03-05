import { useState } from 'preact/hooks'
import { StatCard } from '@components/StatCard'
import { TaskForm } from '@components/TaskForm'
import type { Task, UpdateTaskDto } from '@models/task.model'

type TaskListProps = {
  tasks: Task[]
  onUpdateTask?: (id: string, data: UpdateTaskDto) => void
  onDeleteTask?: (id: string) => void
  onEditStart?: () => void
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onEditStart }: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleEdit = (id: string) => {
    setEditingTaskId(id)
    onEditStart?.()
  }

  const handleSave = (id: string, data: UpdateTaskDto) => {
    onUpdateTask?.(id, data)
    setEditingTaskId(null)
  }

  return (
    <section className="flex flex-col gap-3">
      {tasks.map((task) => (
        editingTaskId === task.id ? (
          <TaskForm 
            key={task.id}
            initialData={{
              title: task.title,
              description: task.description || "",
              priority: task.priority,
              status: task.status,
              due_date: task.due_date ? new Date(task.due_date) : undefined
            }}
            onSave={(data) => handleSave(task.id, data)}
            onCancel={() => setEditingTaskId(null)}
          />
        ) : (
          <StatCard 
            key={task.id}
            task={task}
            onEdit={() => handleEdit(task.id)}
            onDelete={() => onDeleteTask?.(task.id)}
            onUpdate={(data) => onUpdateTask?.(task.id, data)}
          />
        )
      ))}
    </section>
  )
}
