import { useState } from 'preact/hooks'
import { Sidebar } from '@components/Sidebar'
import { TaskForm } from '@components/TaskForm'
import { TaskList } from '@components/TaskList'
import { PanelLeft, Plus } from 'lucide-react'
import type { Task } from '@models/task.model'

export function HomePage() {
  const [activeTab, setActiveTab] = useState('General')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)

  // Mock initial tasks based on the model
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "How I built my first website with Nuxt, Tailwind CSS and Vercel",
      description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa maiores deleniti consectetur nobis et eaque.",
      status: 'todo',
      priority: 'medium',
      due_date: new Date().toISOString()
    },
    {
      id: "678e8400-e29b-41d4-a716-446655440111",
      title: "Mastering React 18: New Features and Best Practices",
      description: "Dive deep into concurrent rendering, automatic batching, and transition APIs to build smoother user experiences.",
      status: 'in-progress',
      priority: 'high',
      due_date: new Date().toISOString()
    },
    {
      id: "789e8400-e29b-41d4-a716-446655440222",
      title: "Refactor Authentication Service",
      status: 'todo',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000 * 2).toISOString()
    },
    {
      id: "890e8400-e29b-41d4-a716-446655440333",
      title: "Weekly Design Sync",
      status: 'todo',
      priority: 'low',
      due_date: new Date(Date.now() + 86400000 * 5).toISOString()
    }
  ])

  const handleUpdateTask = (id: string, updatedData: any) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t))
  }

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleCreateTask = (data: any) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      status: 'todo',
      due_date: data.due_date?.toISOString() || null
    }
    setTasks(prev => [...prev, newTask])
    setIsAddingTask(false)
  }

  const handleOpenAddTask = () => {
    setIsAddingTask(true)
    // The editingTaskId state is internal to TaskList, 
    // we'll need to reset it via a ref or key if we wanted full control,
    // but the task list will notify us if it starts editing.
  }

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

          <div className="max-w-6xl mx-auto w-full px-4 space-y-6 pb-12">
            {/* Tasks List Component */}
            <TaskList 
              tasks={tasks} 
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onEditStart={() => setIsAddingTask(false)}
            />

            {/* Add Task Button */}
            <div className="border-t border-gray-200 w-full" />

            {/* Divider */}
            {!isAddingTask && (
              <div className="pt-2 flex flex-col items-start gap-4">
                <button 
                  onClick={handleOpenAddTask}
                  className="group inline-flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="size-4 text-gray-400 group-hover:text-indigo-600" />
                  <span>Add Task</span>
                </button>
              </div>
            )}

            {/* New Task Input Form */}
            {isAddingTask && (
              <section className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <TaskForm 
                  onSave={handleCreateTask} 
                  onCancel={() => setIsAddingTask(false)}
                />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
