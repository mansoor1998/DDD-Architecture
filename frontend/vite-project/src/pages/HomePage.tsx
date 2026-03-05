import { useState, useMemo } from 'preact/hooks'
import { Sidebar } from '@components/Sidebar'
import { TaskForm } from '@components/TaskForm'
import { TaskList } from '@components/TaskList'
import { LoadingSpinner } from '@components/LoadingSpinner'
import { PanelLeft, Plus } from 'lucide-react'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@hooks/useTasks'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@models/task.model'

export function HomePage() {
  const [activeTab, setActiveTab] = useState('General')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)

  const { data: tasks = [], isLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const filteredTasks = useMemo(() => {
    // const now = new Date()
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    // const oneDay = 24 * 60 * 60 * 1000
    // const oneWeek = 7 * oneDay

    // return tasks.filter(task => {
    //   if (activeTab === 'All') return true
    //   if (activeTab === 'General') return task.status !== 'completed'
      
    //   if (!task.due_date) return false
    //   const dueDate = new Date(task.due_date).getTime()
      
    //   if (activeTab === 'Today') {
    //     return dueDate >= today && dueDate < today + oneDay
    //   }
    //   if (activeTab === 'Weekly') {
    //     return dueDate >= today && dueDate < today + oneWeek
    //   }
    //   return true
    // })

    return tasks
  }, [tasks, activeTab])

  const handleUpdateTask = (id: string, updatedData: UpdateTaskDto) => {
    updateTask.mutate({ id, dto: updatedData })
  }

  const handleDeleteTask = (id: string) => {
    deleteTask.mutate(id)
  }

  const handleCreateTask = (data: any) => {
    const dto: CreateTaskDto = {
      ...data,
      status: 'pending',
      due_date: data.due_date?.toISOString() || null
    }
    createTask.mutate(dto, {
      onSuccess: () => {
        setIsAddingTask(false)
      }
    })
  }

  const handleOpenAddTask = () => {
    setIsAddingTask(true)
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
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Tasks List Component */}
                <TaskList 
                  tasks={filteredTasks} 
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
