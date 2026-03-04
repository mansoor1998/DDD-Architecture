import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from '@pages/HomePage'
import { LoginPage } from '@pages/LoginPage'
import { RegisterPage } from '@pages/RegisterPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Application Route with Sidebar */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Fallback - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
