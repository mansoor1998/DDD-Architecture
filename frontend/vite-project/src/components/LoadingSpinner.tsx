import { Loader2 } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full py-12">
      <Loader2 className="size-8 animate-spin text-indigo-600" />
    </div>
  )
}
