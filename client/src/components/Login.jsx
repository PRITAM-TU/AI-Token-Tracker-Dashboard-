import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Eye, EyeOff, LogIn, Server, AlertCircle } from 'lucide-react'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, backendStatus } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (backendStatus === 'disconnected') {
      setError('Backend server is currently unavailable. Please try again later.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="glass-morphism rounded-3xl p-8 w-full max-w-md relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg animate-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-2">Sign in to your AI Token Tracker</p>
          
          {/* Backend Status */}
          <div className={`mt-4 p-3 rounded-xl ${
            backendStatus === 'connected' ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              <Server className={`h-4 w-4 ${
                backendStatus === 'connected' ? 'text-green-400' : 'text-red-400'
              }`} />
              <span className={`text-sm ${
                backendStatus === 'connected' ? 'text-green-300' : 'text-red-300'
              }`}>
                Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs mt-1 text-gray-400">
              Server: ai-backend-for-token.onrender.com
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Backend Disconnected Warning */}
        {backendStatus === 'disconnected' && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-300 text-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Backend server is currently unavailable. Some features may not work.</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={backendStatus === 'disconnected'}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 disabled:opacity-50"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={backendStatus === 'disconnected'}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 pr-12 disabled:opacity-50"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={backendStatus === 'disconnected'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || backendStatus === 'disconnected'}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}