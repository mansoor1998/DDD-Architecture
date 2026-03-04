import { useState } from 'preact/hooks'
import { DatePicker } from '@components/DatePicker'
import { Plus, Flag } from 'lucide-react'

type Priority = 'Low' | 'Medium' | 'High'

export function TaskForm() {
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [priority, setPriority] = useState<Priority>('Medium')

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

          {/* Priority Select - HyperUI Style */}
          <div className="relative">
            <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-700 shadow-xs ring-1 ring-inset ring-gray-300">
              <Flag className={`size-3 ${
                priority === 'High' ? 'text-red-500' : 
                priority === 'Medium' ? 'text-orange-500' : 'text-blue-500'
              }`} />
              <select
                value={priority}
                onChange={(e) => setPriority(e.currentTarget.value as Priority)}
                className="bg-transparent text-[11px] font-medium border-none p-0 focus:ring-0 cursor-pointer pr-1 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
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
