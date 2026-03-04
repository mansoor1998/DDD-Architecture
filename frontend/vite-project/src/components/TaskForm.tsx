import { useState, useRef, useEffect } from 'preact/hooks'
import { DatePicker } from '@components/DatePicker'
import { Plus, Flag, ChevronDown, AlertCircle, Info, X } from 'lucide-react'

type Priority = 'low' | 'medium' | 'high'

type TaskFormProps = {
  initialData?: {
    title: string
    description?: string
    priority: Priority
    due_date?: Date
  }
  onSave?: (data: any) => void
  onCancel?: () => void
}

export function TaskForm({ initialData, onSave, onCancel }: TaskFormProps) {
  const [taskName, setTaskName] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [date, setDate] = useState<Date | undefined>(initialData?.due_date || new Date())
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium')
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isEditMode = !!initialData

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const priorityOptions: { label: Priority; display: string; icon: any; color: string; bg: string }[] = [
    { label: 'high', display: 'High', icon: AlertCircle, color: 'text-red-600', bg: 'hover:bg-red-50' },
    { label: 'medium', display: 'Medium', icon: Flag, color: 'text-orange-500', bg: 'hover:bg-orange-50' },
    { label: 'low', display: 'Low', icon: Info, color: 'text-blue-500', bg: 'hover:bg-blue-50' },
  ]

  const currentPriority = priorityOptions.find(opt => opt.label === priority)!

  return (
    <div className={`rounded-xl border bg-white p-1.5 shadow-xs transition-all ${isEditMode ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-gray-200 focus-within:border-gray-300'}`}>
      <div className="px-1.5 pt-1.5">
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onInput={(e) => setTaskName(e.currentTarget.value)}
          className="w-full border-none p-0 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none"
        />

        <textarea
          rows={1}
          placeholder="Description"
          value={description}
          onInput={(e) => setDescription(e.currentTarget.value)}
          className="mt-0.5 w-full border-none p-0 text-xs text-gray-600 placeholder-gray-400 focus:ring-0 focus:outline-none resize-none overflow-hidden"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1.5 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker 
            selectedDate={date} 
            onChange={setDate} 
            placeholder="Set date"
          />

          <div className="relative inline-flex" ref={dropdownRef}>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xs">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-gray-50 focus:outline-none capitalize ${currentPriority.color}`}
              >
                <currentPriority.icon className="size-3" />
                {priority}
              </button>

              <button
                type="button"
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className="px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-50 focus:outline-none border-l border-gray-300 cursor-pointer"
              >
                <ChevronDown className={`size-3 transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isPriorityOpen && (
              <div role="menu" className="absolute left-0 bottom-full mb-2 z-50 w-32 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-1">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setPriority(opt.label)
                        setIsPriorityOpen(false)
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium transition-colors rounded-md ${opt.bg} ${opt.color} cursor-pointer`}
                      role="menuitem"
                    >
                      <opt.icon className="size-3" />
                      {opt.display}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition-all cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Cancel</span>
            </button>
          )}
          
          <button
            onClick={() => onSave?.({ title: taskName, description, priority, due_date: date })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            disabled={!taskName.trim()}
          >
            {isEditMode ? <span>Save Changes</span> : (
              <>
                <Plus className="size-3.5" />
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
