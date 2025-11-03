import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Eye, EyeOff, UserPlus, Server, AlertCircle } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, backendStatus } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (backendStatus === 'disconnected') {
      setError('Backend server is currently unavailable. Please try again later.')
      setLoading(false)
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="glass-morphism rounded-3xl p-8 w-full max-w-md relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg animate-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2">Join AI Token Tracker today</p>
          
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
              <span>Backend server is currently unavailable. Registration will not work.</span>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={backendStatus === 'disconnected'}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 disabled:opacity-50"
              placeholder="Enter your full name"
            />
          </div>

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
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 disabled:opacity-50"
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
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 pr-12 disabled:opacity-50"
                placeholder="Create a password"
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={backendStatus === 'disconnected'}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 disabled:opacity-50"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || backendStatus === 'disconnected'}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}