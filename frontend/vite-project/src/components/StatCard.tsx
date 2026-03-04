import { Edit2, Trash2 } from 'lucide-react'

type StatCardProps = {
  title: string
  description: string
  id: string
  onEdit?: () => void
  onDelete?: () => void
}

export function StatCard({ 
  title, 
  description, 
  id,
  onEdit,
  onDelete
}: StatCardProps) {
  return (
    <div className="group block rounded-md border border-gray-300 p-3 shadow-sm sm:p-4 bg-white hover:border-indigo-500 transition-colors w-full">
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={id} className="inline-flex items-start gap-3 flex-1 cursor-pointer">
          <input 
            type="checkbox" 
            className="my-1 size-5 rounded border-gray-300 shadow-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
            id={id} 
          />

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base">
              {title}
            </h3>

            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>
        </label>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
