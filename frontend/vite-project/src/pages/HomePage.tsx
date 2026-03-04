import { useState } from 'preact/hooks'
import { Sidebar } from '@components/Sidebar'
import { StatCard } from '@components/StatCard'
import { Calendar } from 'lucide-react'

export function HomePage() {
  const [activeTab, setActiveTab] = useState('General')

  const tasks = [
    {
      title: "How I built my first website with Nuxt, Tailwind CSS and Vercel",
      subtitle: "By John Doe",
      description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa maiores deleniti consectetur nobis et eaque.",
      date: "31/06/2025",
      readingTime: "12 minutes"
    },
    {
      title: "Mastering React 18: New Features and Best Practices",
      subtitle: "By Jane Smith",
      description: "Dive deep into concurrent rendering, automatic batching, and transition APIs to build smoother user experiences.",
      date: "15/07/2025",
      readingTime: "18 minutes"
    },
    {
      title: "The Future of Frontend Engineering",
      subtitle: "By Alex Johnson",
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

      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activeTab} Tasks</h1>
          </div>
        </header>

        {/* Tasks List Section */}
        <div className="flex flex-col gap-6 w-full">
          {tasks.map((task, index) => (
            <StatCard 
              key={index}
              title={task.title}
              subtitle={task.subtitle}
              description={task.description}
              icon={Calendar}
              date={task.date}
              readingTime={task.readingTime}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
