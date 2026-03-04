import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HomePage } from '@pages/HomePage'
import { LoginPage } from '@pages/LoginPage'
import { RegisterPage } from '@pages/RegisterPage'
import { VerifyPage } from '@pages/VerifyPage'
import { useAuthStore } from '@store/auth.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: any }) {
  const { isAuthenticated, isActive } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isActive) {
    return <Navigate to="/verify-code" replace />
  }

  return children
}

function PublicRoute({ children }: { children: any }) {
  const { isAuthenticated, isActive } = useAuthStore()

  if (isAuthenticated && isActive) {
    return <Navigate to="/" replace />
  }

  if (isAuthenticated && !isActive) {
    return <Navigate to="/verify-code" replace />
  }

  return children
}

export function App() {
  const { isAuthenticated, isActive } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main Application Route - Fully Protected */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Verification Route - Only for authenticated but inactive users */}
          <Route 
            path="/verify-code" 
            element={
              isAuthenticated && !isActive ? <VerifyPage /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Auth Routes - Only for non-authenticated users */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
