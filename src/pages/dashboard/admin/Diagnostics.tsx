import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  Server,
  Database,
  Code,
  Globe
} from 'lucide-react'
import { AdminPageLayout } from '../../../components/admin/AdminPageLayout'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { runDiagnostics, formatDiagnosticReport } from '../../../utils/diagnostics'

interface DiagnosticResult {
  category: string
  name: string
  status: 'pass' | 'fail' | 'warning' | 'skip'
  message: string
  details?: string
  duration?: number
}

interface DiagnosticReport {
  timestamp: string
  environment: {
    apiUrl: string
    nodeEnv: string
    userAgent: string
  }
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    skipped: number
  }
  results: DiagnosticResult[]
}

interface BackendReport {
  success: boolean
  timestamp: string
  executionTime: string
  environment: {
    php_version: string
    server: string
    timezone: string
  }
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
  results: Array<{
    category: string
    name: string
    status: string
    message: string
    details?: string
  }>
}

const Diagnostics: React.FC = () => {
  const [frontendReport, setFrontendReport] = useState<DiagnosticReport | null>(null)
  const [backendReport, setBackendReport] = useState<BackendReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('frontend')

  const runFrontendDiagnostics = async () => {
    setLoading(true)
    try {
      const report = await runDiagnostics()
      setFrontendReport(report)
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
    } finally {
      setLoading(false)
    }
  }

  const runBackendDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/diagnostics.php`)
      const data = await response.json()
      setBackendReport(data)
    } catch (error) {
      console.error('Failed to run backend diagnostics:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAllDiagnostics = async () => {
    await Promise.all([runFrontendDiagnostics(), runBackendDiagnostics()])
  }

  useEffect(() => {
    runAllDiagnostics()
  }, [])

  const downloadReport = () => {
    if (!frontendReport && !backendReport) return

    let content = ''

    if (frontendReport) {
      content += formatDiagnosticReport(frontendReport)
      content += '\n\n'
    }

    if (backendReport) {
      content += '='.repeat(60) + '\n'
      content += 'BACKEND DIAGNOSTIC REPORT\n'
      content += '='.repeat(60) + '\n\n'
      content += `Timestamp: ${backendReport.timestamp}\n`
      content += `PHP Version: ${backendReport.environment.php_version}\n`
      content += `Server: ${backendReport.environment.server}\n`
      content += `Execution Time: ${backendReport.executionTime}\n\n`

      content += '-'.repeat(60) + '\n'
      content += 'SUMMARY\n'
      content += '-'.repeat(60) + '\n'
      content += `Total: ${backendReport.summary.total}\n`
      content += `Passed: ${backendReport.summary.passed}\n`
      content += `Failed: ${backendReport.summary.failed}\n`
      content += `Warnings: ${backendReport.summary.warnings}\n\n`

      const categories = [...new Set(backendReport.results.map(r => r.category))]
      for (const category of categories) {
        content += '-'.repeat(60) + '\n'
        content += `${category.toUpperCase()}\n`
        content += '-'.repeat(60) + '\n'

        for (const result of backendReport.results.filter(r => r.category === category)) {
          const icon = result.status === 'pass' ? '[PASS]' : result.status === 'fail' ? '[FAIL]' : '[WARN]'
          content += `${icon} ${result.name}\n`
          content += `       ${result.message}\n`
          if (result.details) {
            content += `       ${result.details}\n`
          }
        }
        content += '\n'
      }
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coffice-diagnostics-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200'
      case 'fail':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'api':
        return <Globe className="w-5 h-5" />
      case 'database':
      case 'database tables':
        return <Database className="w-5 h-5" />
      case 'php':
      case 'php extensions':
        return <Server className="w-5 h-5" />
      default:
        return <Code className="w-5 h-5" />
    }
  }

  const currentReport = activeTab === 'frontend' ? frontendReport : backendReport
  const currentResults = activeTab === 'frontend'
    ? frontendReport?.results
    : backendReport?.results

  const categories = currentResults
    ? [...new Set(currentResults.map(r => r.category))]
    : []

  return (
    <AdminPageLayout title="Diagnostics systeme">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent" />
            <span className="text-gray-600">Verification de l'etat du systeme</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadReport}
              disabled={!frontendReport && !backendReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Telecharger
            </Button>
            <Button onClick={runAllDiagnostics} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        <div className="flex gap-4 border-b">
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'frontend'
                ? 'border-b-2 border-accent text-accent'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('frontend')}
          >
            Frontend
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'backend'
                ? 'border-b-2 border-accent text-accent'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('backend')}
          >
            Backend
          </button>
        </div>

        {currentReport && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {activeTab === 'frontend'
                  ? (currentReport as DiagnosticReport).summary.total
                  : (currentReport as BackendReport).summary.total}
              </p>
              <p className="text-sm text-gray-600">Tests</p>
            </Card>
            <Card className="p-4 text-center bg-green-50">
              <p className="text-3xl font-bold text-green-600">
                {activeTab === 'frontend'
                  ? (currentReport as DiagnosticReport).summary.passed
                  : (currentReport as BackendReport).summary.passed}
              </p>
              <p className="text-sm text-green-700">Reussis</p>
            </Card>
            <Card className="p-4 text-center bg-red-50">
              <p className="text-3xl font-bold text-red-600">
                {activeTab === 'frontend'
                  ? (currentReport as DiagnosticReport).summary.failed
                  : (currentReport as BackendReport).summary.failed}
              </p>
              <p className="text-sm text-red-700">Echoues</p>
            </Card>
            <Card className="p-4 text-center bg-amber-50">
              <p className="text-3xl font-bold text-amber-600">
                {activeTab === 'frontend'
                  ? (currentReport as DiagnosticReport).summary.warnings
                  : (currentReport as BackendReport).summary.warnings}
              </p>
              <p className="text-sm text-amber-700">Avertissements</p>
            </Card>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-accent animate-spin" />
            <span className="ml-3 text-gray-600">Execution des diagnostics...</span>
          </div>
        )}

        {!loading && currentResults && (
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryResults = currentResults.filter(r => r.category === category)

              return (
                <Card key={category} className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    {getCategoryIcon(category)}
                    <h3 className="font-semibold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-500">
                      ({categoryResults.length} tests)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {categoryResults.map((result, index) => (
                      <motion.div
                        key={`${result.name}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusBg(result.status)}`}
                      >
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{result.name}</p>
                          <p className="text-sm text-gray-600">{result.message}</p>
                          {result.details && (
                            <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                          )}
                          {'duration' in result && result.duration !== undefined && (
                            <p className="text-xs text-gray-400 mt-1">
                              {result.duration.toFixed(2)}ms
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {activeTab === 'backend' && backendReport && (
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-2">Informations serveur</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">PHP:</span>
                <span className="ml-2 font-medium">{backendReport.environment.php_version}</span>
              </div>
              <div>
                <span className="text-gray-500">Serveur:</span>
                <span className="ml-2 font-medium">{backendReport.environment.server}</span>
              </div>
              <div>
                <span className="text-gray-500">Execution:</span>
                <span className="ml-2 font-medium">{backendReport.executionTime}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminPageLayout>
  )
}

export default Diagnostics
