import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  title: string
  subtitle: string
  description: string
  icon: LucideIcon
  date: string
  readingTime: string
  imageUrl?: string
}

export function StatCard({ 
  title, 
  subtitle, 
  description, 
  icon: Icon, 
  date, 
  readingTime,
  imageUrl = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=1160"
}: StatCardProps) {
  return (
    <a href="#" className="block rounded-md border border-gray-300 p-4 shadow-sm sm:p-6 bg-white hover:border-indigo-500 transition-colors">
      <div className="sm:flex sm:justify-between sm:gap-4 lg:gap-6">
        <div className="sm:order-last sm:shrink-0">
          <img 
            alt="" 
            src={imageUrl} 
            className="size-16 rounded-full object-cover sm:size-18" 
          />
        </div>

        <div className="mt-4 sm:mt-0">
          <h3 className="text-lg font-medium text-pretty text-gray-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-gray-700">{subtitle}</p>

          <p className="mt-4 line-clamp-2 text-sm text-pretty text-gray-700">
            {description}
          </p>
        </div>
      </div>

      <dl className="mt-6 flex gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <dt class="text-gray-700">
            <span className="sr-only"> Published on </span>
            <Icon className="size-5" />
          </dt>

          <dd className="text-xs text-gray-700">{date}</dd>
        </div>

        <div className="flex items-center gap-2">
          <dt className="text-gray-700">
            <span className="sr-only"> Reading time </span>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"></path>
            </svg>
          </dt>

          <dd className="text-xs text-gray-700">{readingTime}</dd>
        </div>
      </dl>
    </a>
  )
}
