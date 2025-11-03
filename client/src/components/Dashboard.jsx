import React, { useState, useEffect } from 'react'
import api from '../utils/axiosConfig'
import { API_ENDPOINTS } from '../config/api'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Send, Download, Clock, DollarSign, Cpu, Activity, AlertCircle, RefreshCw, Database, Server } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Dashboard() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalCost: 0,
    totalRequests: 0,
    avgResponseTime: 0
  })
  const [error, setError] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [apiResponse, setApiResponse] = useState(null)

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', costPerToken: 0.000002 },
    { id: 'gpt-4', name: 'GPT-4', costPerToken: 0.000045 },
    { id: 'claude-2', name: 'Claude 2', costPerToken: 0.000011 },
    { id: 'llama-2-70b', name: 'Llama 2 70B', costPerToken: 0.000009 }
  ]

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      console.log('🔵 Checking backend status...')
      const response = await api.get(API_ENDPOINTS.HEALTH)
      setBackendStatus('connected')
      console.log('✅ Backend connected:', response.data)
      return true
    } catch (error) {
      setBackendStatus('disconnected')
      console.error('❌ Backend connection failed:', error)
      setError(`Backend Error: ${error.message}`)
      return false
    }
  }

  // Load data from backend with proper error handling
  const loadBackendData = async () => {
    try {
      setLoadingData(true)
      setError('')
      setApiResponse(null)
      
      console.log('🔄 Starting to load data from backend...')

      // First check if backend is reachable
      const isBackendAlive = await checkBackendStatus()
      if (!isBackendAlive) {
        throw new Error('Backend server is not responding. Please check if the server is running.')
      }

      console.log('📡 Fetching logs and stats from backend...')

      // Load logs and stats in parallel with timeout
      const [logsResponse, statsResponse] = await Promise.all([
        api.get(API_ENDPOINTS.GET_LOGS).catch(err => {
          console.error('❌ Logs API error:', err)
          throw new Error(`Logs API: ${err.response?.data?.message || err.message}`)
        }),
        api.get(API_ENDPOINTS.GET_STATS).catch(err => {
          console.error('❌ Stats API error:', err)
          throw new Error(`Stats API: ${err.response?.data?.message || err.message}`)
        })
      ])

      console.log('📊 Backend response - Logs:', logsResponse.data)
      console.log('📈 Backend response - Stats:', statsResponse.data)

      // Store API responses for debugging
      setApiResponse({
        logs: logsResponse.data,
        stats: statsResponse.data,
        timestamp: new Date().toISOString()
      })

      // Handle logs response
      if (logsResponse.data && logsResponse.data.success) {
        const logsData = logsResponse.data.data || []
        setLogs(logsData)
        console.log(`✅ Loaded ${logsData.length} log entries`)
      } else {
        throw new Error(logsResponse.data?.message || 'Invalid response format from logs API')
      }

      // Handle stats response
      if (statsResponse.data && statsResponse.data.success) {
        setStats(statsResponse.data.data)
        console.log('✅ Stats loaded successfully:', statsResponse.data.data)
      } else {
        throw new Error(statsResponse.data?.message || 'Invalid response format from stats API')
      }

    } catch (error) {
      console.error('❌ Error loading backend data:', error)
      const errorMessage = error.response?.data?.message || error.message
      setError(`Backend Error: ${errorMessage}`)
      
      // Set empty data on error
      setLogs([])
      setStats({
        totalTokens: 0,
        totalCost: 0,
        totalRequests: 0,
        avgResponseTime: 0
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadBackendData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    setApiResponse(null)

    try {
      console.log('🔄 Sending prompt to backend...')
      
      const response = await api.post(API_ENDPOINTS.PROCESS_PROMPT, {
        prompt,
        model: selectedModel
      })

      console.log('✅ Backend processing response:', response.data)

      // Store API response
      setApiResponse({
        process: response.data,
        timestamp: new Date().toISOString()
      })

      if (response.data.success) {
        // Reload data to get updated information
        await loadBackendData()
        setPrompt('')
      } else {
        throw new Error(response.data.message || 'AI processing failed')
      }

    } catch (error) {
      console.error('❌ Error processing prompt:', error)
      const errorMessage = error.response?.data?.message || error.message
      setError(`Processing Error: ${errorMessage}`)
      
      // Store error response
      setApiResponse({
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    try {
      const headers = ['Timestamp', 'Model', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Cost', 'Response Time']
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          new Date(log.timestamp || log.createdAt).toLocaleString(),
          `"${log.modelUsed}"`,
          log.promptTokens || 0,
          log.completionTokens || 0,
          log.totalTokens || 0,
          `$${(log.estimatedCost || 0).toFixed(6)}`,
          `${log.responseTime || 0}ms`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `token-usage-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      console.log('✅ CSV export completed')
    } catch (error) {
      console.error('❌ CSV export error:', error)
      setError(`Export Error: ${error.message}`)
    }
  }

  const refreshData = () => {
    console.log('🔄 Manual refresh triggered')
    loadBackendData()
  }

  // Prepare chart data
  const chartData = logs.slice(-10).map(log => ({
    name: new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    tokens: log.totalTokens || 0,
    cost: (log.estimatedCost || 0) * 1000000,
    time: log.responseTime || 0
  }))

  const recentLogs = logs.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Token Tracker</h1>
          <p className="text-gray-400 mt-2">Real-time token usage dashboard</p>
        </div>
        <button
          onClick={refreshData}
          disabled={loadingData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
          <span>{loadingData ? 'Loading...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Backend Status */}
      <div className={`glass-morphism rounded-2xl p-4 border ${
        backendStatus === 'connected' ? 'border-green-500/50' : 'border-red-500/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Server className={`h-6 w-6 ${
              backendStatus === 'connected' ? 'text-green-400' : 'text-red-400'
            }`} />
            <div>
              <h3 className="font-semibold text-white">
                Backend Status: <span className={backendStatus === 'connected' ? 'text-green-400' : 'text-red-400'}>
                  {backendStatus === 'connected' ? 'Connected ✅' : 'Disconnected ❌'}
                </span>
              </h3>
              <p className="text-sm text-gray-400">
                Server: ai-backend-for-token.onrender.com
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">API Responses</p>
            <p className="text-white font-mono">{logs.length} logs loaded</p>
          </div>
        </div>
      </div>

      {/* API Response Debug Panel */}
      {apiResponse && (
        <div className="glass-morphism rounded-2xl p-4 border border-blue-500/50">
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-400 font-medium flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>API Response Debug (Click to expand)</span>
            </summary>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-blue-300 font-medium">Response Timestamp:</label>
                  <pre className="text-green-400 mt-1 overflow-auto">
                    {apiResponse.timestamp}
                  </pre>
                </div>
                <div>
                  <label className="text-blue-300 font-medium">Backend Status:</label>
                  <pre className="text-green-400 mt-1">
                    {backendStatus}
                  </pre>
                </div>
              </div>
              
              {apiResponse.logs && (
                <div>
                  <label className="text-blue-300 font-medium">Logs API Response:</label>
                  <pre className="text-green-400 mt-1 bg-gray-800/50 p-2 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(apiResponse.logs, null, 2)}
                  </pre>
                </div>
              )}
              
              {apiResponse.stats && (
                <div>
                  <label className="text-blue-300 font-medium">Stats API Response:</label>
                  <pre className="text-green-400 mt-1 bg-gray-800/50 p-2 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(apiResponse.stats, null, 2)}
                  </pre>
                </div>
              )}
              
              {apiResponse.process && (
                <div>
                  <label className="text-blue-300 font-medium">Process API Response:</label>
                  <pre className="text-green-400 mt-1 bg-gray-800/50 p-2 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(apiResponse.process, null, 2)}
                  </pre>
                </div>
              )}
              
              {apiResponse.error && (
                <div>
                  <label className="text-red-300 font-medium">Error Response:</label>
                  <pre className="text-red-400 mt-1 bg-gray-800/50 p-2 rounded-lg overflow-auto max-h-40">
                    {JSON.stringify(apiResponse.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      {/* Loading State */}
      {loadingData && (
        <div className="glass-morphism rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center space-x-3 text-blue-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-medium">Loading data from production backend...</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Fetching your token usage data from ai-backend-for-token.onrender.com
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && !loadingData && (
        <div className="glass-morphism rounded-2xl p-4 border border-red-500/50">
          <div className="flex items-center space-x-2 text-red-300">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
          <p className="text-red-400 text-sm mt-2">
            Check the API Response Debug panel above for detailed error information.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {!loadingData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tokens</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalTokens?.toLocaleString() || '0'}
                </p>
                <p className="text-blue-400 text-sm mt-1">
                  {logs.length} requests
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Cpu className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-white mt-1">
                  ${stats.totalCost?.toFixed(6) || '0.000000'}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  Real calculation
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.totalRequests?.toLocaleString() || '0'}
                </p>
                <p className="text-purple-400 text-sm mt-1">
                  Database count
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {Math.round(stats.avgResponseTime) || '0'}ms
                </p>
                <p className="text-yellow-400 text-sm mt-1">
                  Performance metric
                </p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="glass-morphism rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Send Prompt to AI</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={backendStatus === 'disconnected' || loadingData}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="4"
              disabled={backendStatus === 'disconnected' || loadingData}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400 disabled:opacity-50"
              placeholder="Enter your AI prompt here... This will be processed by the backend server."
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={loading || !prompt.trim() || loadingData || backendStatus === 'disconnected'}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Processing...' : 'Send Prompt'}</span>
            </button>

            <button
              type="button"
              onClick={exportCSV}
              disabled={logs.length === 0 || loadingData}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </form>
      </div>

      {/* Charts */}
      {logs.length > 0 && !loadingData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-morphism rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Token Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(55, 65, 81, 0.5)',
                    borderRadius: '0.75rem',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-morphism rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(55, 65, 81, 0.5)',
                    borderRadius: '0.75rem',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value) => [`$${(value / 1000000).toFixed(6)}`, 'Cost']}
                />
                <Bar dataKey="cost" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {!loadingData && (
        <div className="glass-morphism rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity {logs.length > 0 && `(${logs.length} total entries)`}
          </h3>
          {recentLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Model</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Prompt</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tokens</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Cost</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="py-3 px-4 text-white text-sm">
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
                          {log.modelUsed}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm max-w-xs truncate">
                        {log.prompt}
                      </td>
                      <td className="py-3 px-4 text-white">{log.totalTokens || 0}</td>
                      <td className="py-3 px-4 text-green-400">
                        ${(log.estimatedCost || 0).toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-yellow-400">{log.responseTime || 0}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data found from backend.</p>
              <p className="text-sm mt-2">Send your first prompt to start tracking!</p>
              <p className="text-xs mt-1 text-gray-500">
                Backend: ai-backend-for-token.onrender.com
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}