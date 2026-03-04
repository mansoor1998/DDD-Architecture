import { useState } from 'preact/hooks'
import { StatCard } from '@components/StatCard'
import { TaskForm } from '@components/TaskForm'
import type { Task } from '@models/task.model'

type TaskListProps = {
  tasks: Task[]
  onUpdateTask?: (id: string, data: any) => void
  onDeleteTask?: (id: string) => void
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const handleSave = (id: string, data: any) => {
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
              description: task.description,
              priority: task.priority,
              due_date: task.due_date ? new Date(task.due_date) : undefined
            }}
            onSave={(data) => handleSave(task.id, data)}
            onCancel={() => setEditingTaskId(null)}
          />
        ) : (
          <StatCard 
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description || ''}
            onEdit={() => setEditingTaskId(task.id)}
            onDelete={() => onDeleteTask?.(task.id)}
          />
        )
      ))}
    </section>
  )
}
