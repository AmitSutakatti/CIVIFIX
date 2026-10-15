import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ContractorLogin from './pages/ContractorLogin'
import ContractorRegister from './pages/ContractorRegister'
import ContractorDashboard from './pages/ContractorDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<ContractorLogin />} />
            <Route path="/register" element={<ContractorRegister />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ContractorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

