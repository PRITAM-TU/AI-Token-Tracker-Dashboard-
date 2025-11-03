import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Layout from './components/Layout'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, backendStatus } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen neural-bg bg-gray-900 text-white">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App