import { LayoutGrid, Calendar, CalendarDays, ListTodo, LogOut } from 'lucide-react'
import preactLogo from '@/assets/preact.svg'

type SidebarProps = {
  value: string
  onChange: (name: string) => void
}

export function Sidebar({ value, onChange }: SidebarProps) {
  const menuItems = [
    { name: 'General', icon: LayoutGrid },
    { name: 'Today', icon: Calendar },
    { name: 'Weekly', icon: CalendarDays },
    { name: 'All', icon: ListTodo },
  ]

  return (
    <div className="flex h-screen flex-col justify-between border-e border-gray-100 bg-white w-64 shrink-0">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 px-2">
          <img src={preactLogo} className="size-8" alt="Preact logo" />
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            Todo App
          </span>
        </div>

        <ul className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => onChange(item.name)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  value === item.name
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <div className="p-4">
          <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-4 border-t border-gray-100">
          <img
            alt="User avatar"
            src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=1160"
            className="size-10 rounded-full object-cover"
          />

          <div>
            <p className="text-xs">
              <strong className="block font-medium">Eric Frusciante</strong>
              <span className="text-gray-400"> eric@frusciante.com </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
