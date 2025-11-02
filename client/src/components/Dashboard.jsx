import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Send, Download, Clock, DollarSign, Cpu, Activity, AlertCircle, RefreshCw, Database } from 'lucide-react'

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
  const [dataLoaded, setDataLoaded] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', costPerToken: 0.000002 },
    { id: 'gpt-4', name: 'GPT-4', costPerToken: 0.000045 }
  ]

  // Load real data from backend
  const loadBackendData = async () => {
    try {
      setLoadingData(true)
      setError('')
      console.log('🔄 Loading data from backend...')

      // Load logs and stats in parallel
      const [logsResponse, statsResponse] = await Promise.all([
        axios.get('/api/logs'),
        axios.get('/api/logs/stats')
      ])

      console.log('📊 Logs response:', logsResponse.data)
      console.log('📈 Stats response:', statsResponse.data)

      // Handle logs response
      if (logsResponse.data.success) {
        setLogs(logsResponse.data.data || [])
        console.log('✅ Loaded logs:', logsResponse.data.data?.length || 0)
      } else {
        throw new Error(logsResponse.data.message || 'Failed to load logs')
      }

      // Handle stats response
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data)
        console.log('✅ Loaded stats:', statsResponse.data.data)
      } else {
        throw new Error(statsResponse.data.message || 'Failed to load stats')
      }

      setDataLoaded(true)

    } catch (error) {
      console.error('❌ Error loading backend data:', error)
      setError(`Backend Error: ${error.response?.data?.message || error.message}`)
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

    try {
      console.log('🔄 Sending prompt to backend...')
      
      const response = await axios.post('/api/ai/process', {
        prompt,
        model: selectedModel
      })

      console.log('✅ Backend response:', response.data)

      if (response.data.success) {
        // Reload data to get updated logs and stats
        await loadBackendData()
        setPrompt('')
      } else {
        throw new Error(response.data.message || 'Failed to process prompt')
      }

    } catch (error) {
      console.error('❌ Error processing prompt:', error)
      setError(`Processing Error: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Timestamp', 'Model', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Cost', 'Response Time']
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.timestamp || log.createdAt).toLocaleString(),
        log.modelUsed,
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
    a.download = 'token-usage-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const refreshData = () => {
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
          <p className="text-gray-400 mt-2">Real data from your database</p>
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

      {/* Loading State */}
      {loadingData && (
        <div className="glass-morphism rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <Database className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Loading data from database...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !loadingData && (
        <div className="glass-morphism rounded-2xl p-4 border border-red-500/50">
          <div className="flex items-center space-x-2 text-red-300">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Data Loaded Successfully */}
      {dataLoaded && !loadingData && (
        <div className="glass-morphism rounded-2xl p-4 border border-green-500/50">
          <div className="flex items-center space-x-2 text-green-300">
            <Database className="h-5 w-5" />
            <div>
              <span className="font-medium">Database Connected</span>
              <p className="text-sm text-green-200 mt-1">
                Loaded {logs.length} log entries from your database
              </p>
            </div>
          </div>
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
                  {stats.totalTokens.toLocaleString()}
                </p>
                <p className="text-blue-400 text-sm mt-1">
                  Database Data
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
                  ${stats.totalCost.toFixed(6)}
                </p>
                <p className="text-green-400 text-sm mt-1">
                  Real Calculation
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
                  {stats.totalRequests.toLocaleString()}
                </p>
                <p className="text-purple-400 text-sm mt-1">
                  From Database
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
                  {Math.round(stats.avgResponseTime)}ms
                </p>
                <p className="text-yellow-400 text-sm mt-1">
                  Actual Average
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
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
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
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-white placeholder-gray-400"
              placeholder="Enter your AI prompt here... This will be saved to your database."
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={loading || !prompt.trim() || loadingData}
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
            Recent Activity {logs.length > 0 && `(${logs.length} total)`}
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
              <p>No data found in your database.</p>
              <p className="text-sm mt-2">Send your first prompt to start tracking!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}