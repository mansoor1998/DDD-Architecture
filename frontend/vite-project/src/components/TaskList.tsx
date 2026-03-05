import { useState } from 'preact/hooks'
import { StatCard } from '@components/StatCard'
import { TaskForm } from '@components/TaskForm'
import type { Task, UpdateTaskDto } from '@models/task.model'
import { motion, AnimatePresence } from 'framer-motion'

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
      <AnimatePresence initial={false} mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.clientId || task.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 1
            }}
          >
            {editingTaskId === task.id ? (
              <TaskForm 
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
                task={task}
                onEdit={() => handleEdit(task.id)}
                onDelete={() => onDeleteTask?.(task.id)}
                onUpdate={(data) => onUpdateTask?.(task.id, data)}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}
