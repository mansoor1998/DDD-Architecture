import { Edit2, Trash2, Calendar, Flag } from 'lucide-react'
import type { Task, UpdateTaskDto } from '@models/task.model'

type StatCardProps = {
  task: Task
  onEdit?: () => void
  onDelete?: () => void
  onUpdate?: (data: UpdateTaskDto) => void
}

export function StatCard({ 
  task, 
  onEdit,
  onDelete,
  onUpdate
}: StatCardProps) {
  const isCompleted = task.status === 'completed'

  const handleToggle = () => {
    onUpdate?.({ status: isCompleted ? 'pending' : 'completed' })
  }

  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-orange-500',
    low: 'text-blue-500'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`group block rounded-xl border p-3 shadow-sm sm:p-4 bg-white hover:border-indigo-200 transition-all w-full ${isCompleted ? 'bg-gray-50/50 border-gray-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="pt-1">
            <input 
              type="checkbox" 
              checked={isCompleted}
              onChange={handleToggle}
              className="size-5 rounded border-gray-300 shadow-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" 
              id={task.id} 
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 text-base leading-tight truncate ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>

            {task.description && (
              <p className={`mt-1 text-sm line-clamp-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {task.due_date && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  <Calendar className="size-3" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              )}

              <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-gray-100 shadow-xs capitalize ${priorityColors[task.priority]}`}>
                <Flag className="size-3 fill-current" />
                <span>{task.priority}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button 
            onClick={(e) => {
              e.preventDefault();
              onEdit?.();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
            title="Edit task"
          >
            <Edit2 className="size-4" />
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              onDelete?.();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
