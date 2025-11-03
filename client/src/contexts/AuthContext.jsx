import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../utils/axiosConfig'
import { API_ENDPOINTS } from '../config/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      verifyToken()
    } else {
      setLoading(false)
    }
    
    // Check backend status
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.HEALTH)
      setBackendStatus('connected')
      console.log('✅ Backend connected:', response.data)
    } catch (error) {
      setBackendStatus('disconnected')
      console.error('❌ Backend connection failed:', error)
    }
  }

  const verifyToken = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_PROFILE)
      setUser(response.data.user)
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    backendStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}