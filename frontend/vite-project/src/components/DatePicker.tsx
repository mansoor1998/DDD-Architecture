import { useState, useRef, useEffect } from 'preact/hooks'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateDisplay } from '@utils/dateFormatter'

type DatePickerProps = {
  selectedDate?: Date
  onChange?: (date: Date) => void
  placeholder?: string
}

export function DatePicker({ selectedDate, onChange, placeholder = 'Select date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(selectedDate || new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange?.(newDate)
    setIsOpen(false)
  }

  const renderCalendar = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const days = []
    const totalDays = daysInMonth(year, month)
    const startDay = firstDayOfMonth(year, month)

    // Fill empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Fill days of current month
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === d && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year

      const isToday = new Date().getDate() === d && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateSelect(d)}
          className={`h-8 w-8 rounded-full text-xs font-medium transition-colors flex items-center justify-center
            ${isSelected ? 'bg-indigo-600 text-white' : 
              isToday ? 'text-indigo-600 font-bold border border-indigo-200 bg-indigo-50' : 
              'text-gray-700 hover:bg-gray-100'}`}
        >
          {d}
        </button>
      )
    }
    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-x-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 w-fit"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-gray-400" />
          <span>{selectedDate ? formatDateDisplay(selectedDate) : placeholder}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-64 origin-top-left rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h2>
            <div className="flex gap-1">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {day[0]}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
             <button 
                type="button"
                onClick={() => {
                   onChange?.(new Date())
                   setIsOpen(false)
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 w-full text-center"
             >
               Today
             </button>
          </div>

        </div>
      )}
    </div>
  )
}
