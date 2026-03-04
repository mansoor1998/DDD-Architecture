type StatCardProps = {
  title: string
  description: string
  id: string
}

export function StatCard({ 
  title, 
  description, 
  id
}: StatCardProps) {
  return (
    <div className="block rounded-md border border-gray-300 p-3 shadow-sm sm:p-4 bg-white hover:border-indigo-500 transition-colors w-full">
      <div className="flex flex-col items-start gap-3">
        <label htmlFor={id} className="inline-flex items-start gap-3 w-full cursor-pointer">
          <input 
            type="checkbox" 
            className="my-1 size-5 rounded border-gray-300 shadow-sm text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
            id={id} 
          />

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base">
              {title}
            </h3>

            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
