import { useState } from 'preact/hooks'
import { useNavigate } from 'react-router-dom'
import { useVerifyEmail } from '@hooks/useAuth'
import { useAuthStore } from '@store/auth.store'
import { LogOut, MailCheck } from 'lucide-react'

export function VerifyPage() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const { clearAuth, email } = useAuthStore()
  const { mutate: verify, isPending, error } = useVerifyEmail()

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (!code.trim()) return
    
    verify(code, {
      onSuccess: () => {
        navigate('/')
      }
    })
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <MailCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error.message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onInput={(e) => setCode(e.currentTarget.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center tracking-widest font-mono"
              placeholder="Enter code"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !code.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="size-4" />
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  )
}
