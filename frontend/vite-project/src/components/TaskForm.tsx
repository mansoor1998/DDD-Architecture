import { useState, useRef, useEffect } from 'preact/hooks'
import { DatePicker } from '@components/DatePicker'
import { Plus, Flag, ChevronDown, AlertCircle, Info } from 'lucide-react'

type Priority = 'Low' | 'Medium' | 'High'

export function TaskForm() {
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [priority, setPriority] = useState<Priority>('Medium')
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const priorityOptions: { label: Priority; icon: any; color: string; bg: string }[] = [
    { label: 'High', icon: AlertCircle, color: 'text-red-600', bg: 'hover:bg-red-50' },
    { label: 'Medium', icon: Flag, color: 'text-orange-500', bg: 'hover:bg-orange-50' },
    { label: 'Low', icon: Info, color: 'text-blue-500', bg: 'hover:bg-blue-50' },
  ]

  const currentPriority = priorityOptions.find(opt => opt.label === priority)!

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-xs focus-within:border-gray-300 transition-all">
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
          {/* Date Picker */}
          <DatePicker 
            selectedDate={date} 
            onChange={setDate} 
            placeholder="Set date"
          />

          {/* Custom Priority Dropdown - HyperUI Inspiration */}
          <div className="relative inline-flex" ref={dropdownRef}>
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xs">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-gray-50 focus:outline-none ${currentPriority.color}`}
              >
                <currentPriority.icon className="size-3" />
                {priority}
              </button>

              <button
                type="button"
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className="px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-50 focus:outline-none border-l border-gray-300 cursor-pointer"
                aria-label="Toggle Priority Menu"
              >
                <ChevronDown className={`size-3 transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isPriorityOpen && (
              <div 
                role="menu" 
                className="absolute left-0 bottom-full mb-2 z-50 w-32 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
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
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          disabled={!taskName.trim()}
        >
          <Plus className="size-3.5" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  )
}
