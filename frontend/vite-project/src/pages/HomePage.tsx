import { useState } from 'preact/hooks'
import { Sidebar } from '@components/Sidebar'
import { StatCard } from '@components/StatCard'
import { DatePicker } from '@components/DatePicker'

export function HomePage() {
  const [activeTab, setActiveTab] = useState('General')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const tasks = [
    {
      id: "task-1",
      title: "How I built my first website with Nuxt, Tailwind CSS and Vercel",
      description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa maiores deleniti consectetur nobis et eaque.",
      date: "31/06/2025",
      readingTime: "12 minutes"
    },
    {
      id: "task-2",
      title: "Mastering React 18: New Features and Best Practices",
      description: "Dive deep into concurrent rendering, automatic batching, and transition APIs to build smoother user experiences.",
      date: "15/07/2025",
      readingTime: "18 minutes"
    },
    {
      id: "task-3",
      title: "The Future of Frontend Engineering",
      description: "Exploring the evolution of web frameworks, the rise of server-side logic, and what's next for the ecosystem.",
      date: "02/08/2025",
      readingTime: "10 minutes"
    }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        value={activeTab} 
        onChange={(tab) => setActiveTab(tab)} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6 px-4 max-w-6xl mx-auto w-full flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activeTab} Tasks</h1>
            <p className="text-gray-500 text-sm">Managing your {activeTab.toLowerCase()} workspace.</p>
          </div>
          <DatePicker 
            selectedDate={selectedDate} 
            onChange={(date) => setSelectedDate(date)} 
          />
        </header>

        {/* Tasks List Section centered with horizontal padding */}
        <div className="flex flex-col gap-3 w-full px-4 max-w-6xl mx-auto">
          {tasks.map((task) => (
            <StatCard 
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
