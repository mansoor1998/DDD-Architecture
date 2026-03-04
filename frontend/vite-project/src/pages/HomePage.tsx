import { useState } from 'preact/hooks'
import { Sidebar } from '@components/Sidebar'
import { StatCard } from '@components/StatCard'
import { TaskForm } from '@components/TaskForm'
import { PanelLeft } from 'lucide-react'

export function HomePage() {
  const [activeTab, setActiveTab] = useState('General')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const tasks = [
    {
      id: "task-1",
      title: "How I built my first website with Nuxt, Tailwind CSS and Vercel",
      description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa maiores deleniti consectetur nobis et eaque.",
    },
    {
      id: "task-2",
      title: "Mastering React 18: New Features and Best Practices",
      description: "Dive deep into concurrent rendering, automatic batching, and transition APIs to build smoother user experiences.",
    },
    {
      id: "task-3",
      title: "The Future of Frontend Engineering",
      description: "Exploring the evolution of web frameworks, the rise of server-side logic, and what's next for the ecosystem.",
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        value={activeTab} 
        onChange={(tab) => setActiveTab(tab)} 
        isOpen={isSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="h-14 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <PanelLeft className={`size-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-8 pb-8">
          <header className="max-w-6xl mx-auto w-full mb-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900">{activeTab} Tasks</h1>
          </header>

          <div className="max-w-6xl mx-auto w-full px-4 space-y-8 pb-12">
            {/* New Task Input Form */}
            <section>
              <TaskForm />
            </section>

            {/* Tasks List */}
            <section className="flex flex-col gap-3">
              {tasks.map((task) => (
                <StatCard 
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                />
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
