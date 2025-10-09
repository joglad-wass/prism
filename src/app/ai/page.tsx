'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { useFilter } from '../../contexts/filter-context'
import {
  BotMessageSquare,
  Send,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  Loader2,
  CheckCircle2,
  XCircle,
  Code,
  RotateCcw
} from 'lucide-react'
import { queryAI, checkAIHealth, PresentationMetadata } from '../../services/ai'
import { ResultRenderer } from '../../components/ai/result-renderer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: any
  query?: string
  isError?: boolean
  presentation?: PresentationMetadata
}

interface CostCenterGroup {
  id: string
  groupName: string
  displayName: string
  costCenters: string[]
  isSystem: boolean
}

interface CostCenterOption {
  value: string
  label: string
  type: 'all' | 'group' | 'individual'
}

export default function AIPage() {
  const { filterSelection } = useFilter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant powered by Ollama. I can help you query your Prism database using natural language. Ask me about clients, deals, brands, or agents!",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiHealth, setAiHealth] = useState<{
    ready: boolean
    message?: string
  } | null>(null)
  const [showQuery, setShowQuery] = useState<string | null>(null)
  const [currentResults, setCurrentResults] = useState<{
    data: any
    presentation: PresentationMetadata
    query: string
  } | null>(null)
  const [costCenterOptions, setCostCenterOptions] = useState<CostCenterOption[]>([])

  // Check AI health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkAIHealth()
      if (health.success && health.data) {
        setAiHealth({
          ready: health.data.ready,
          message: health.data.ready
            ? 'AI service is ready'
            : 'Ollama is not running or models are missing'
        })
      } else {
        setAiHealth({
          ready: false,
          message: health.error || 'Failed to check AI service'
        })
      }
    }
    checkHealth()
  }, [])

  // Fetch cost center options for display labels
  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cost-centers')
        const data = await response.json()

        if (data.success && data.data) {
          const opts: CostCenterOption[] = []

          // Add groups
          if (data.data.groups && Array.isArray(data.data.groups)) {
            data.data.groups.forEach((group: CostCenterGroup) => {
              opts.push({
                value: `group:${group.id}`,
                label: group.displayName,
                type: 'group'
              })
            })
          }

          // Add ungrouped individual cost centers
          if (data.data.ungrouped && Array.isArray(data.data.ungrouped)) {
            data.data.ungrouped.forEach((cc: string) => {
              const costCenterCode = cc.match(/^(CC\d{3})/)?.[1] || cc
              opts.push({
                value: `individual:${costCenterCode}`,
                label: cc.replace(/^CC\d{3}\s*/, '').trim() || cc,
                type: 'individual'
              })
            })
          }

          setCostCenterOptions(opts)
        }
      } catch (error) {
        console.error('Failed to fetch cost centers:', error)
      }
    }
    fetchCostCenters()
  }, [])

  // Get display label for current filter
  const getFilterDisplayLabel = () => {
    if (filterSelection.type === 'all' || !filterSelection.value) return null

    const lookupValue = filterSelection.type === 'group'
      ? `group:${filterSelection.value}`
      : `individual:${filterSelection.value}`

    const option = costCenterOptions.find(opt => opt.value === lookupValue)
    return option?.label || filterSelection.value
  }

  const exampleQueries = [
    {
      icon: TrendingUp,
      title: 'Revenue Analysis',
      query: 'Show me clients who have done deals with Nike or Adidas in the last year',
      color: 'text-green-600'
    },
    {
      icon: Target,
      title: 'Cross-Sell Opportunities',
      query: 'Which agents have worked with both athletes and musicians?',
      color: 'text-blue-600'
    },
    {
      icon: AlertCircle,
      title: 'Risk Assessment',
      query: 'Identify clients who haven\'t had any deals in the last 6 months',
      color: 'text-orange-600'
    },
    {
      icon: Lightbulb,
      title: 'Strategic Insights',
      query: 'What are the most successful brand partnerships for NIL athletes?',
      color: 'text-purple-600'
    }
  ]

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentQuestion = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      // Build conversation history from previous messages (excluding system messages)
      const history = messages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && !m.isError))
        .reduce((acc, msg, idx, arr) => {
          if (msg.role === 'user' && idx + 1 < arr.length && arr[idx + 1].role === 'assistant') {
            acc.push({
              question: msg.content,
              answer: arr[idx + 1].content,
              data: arr[idx + 1].data
            })
          }
          return acc
        }, [] as Array<{ question: string; answer: string; data?: any }>)

      // Build cost center filters from filterSelection
      const filters: { costCenter?: string; costCenterGroup?: string } = {}
      if (filterSelection.type === 'individual' && filterSelection.value) {
        filters.costCenter = filterSelection.value
      } else if (filterSelection.type === 'group' && filterSelection.value) {
        filters.costCenterGroup = filterSelection.value
      }

      const response = await queryAI(currentQuestion, history, filters)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success && response.data
          ? response.data.answer
          : response.error || 'Failed to process query',
        timestamp: new Date(),
        data: response.data?.results,
        query: response.data?.query,
        presentation: response.data?.presentation,
        isError: !response.success
      }

      setMessages(prev => [...prev, aiMessage])

      // Update the results panel if we have data
      if (response.success && response.data?.results && response.data?.presentation) {
        setCurrentResults({
          data: response.data.results,
          presentation: response.data.presentation,
          query: response.data.query || ''
        })
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to query AI'}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (query: string) => {
    setInputValue(query)
  }

  const handleClearConversation = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI assistant powered by Ollama. I can help you query your Prism database using natural language. Ask me about clients, deals, brands, or agents!",
        timestamp: new Date()
      }
    ])
  }

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BotMessageSquare className="h-7 w-7" />
              AI Insights
            </h1>
            <p className="text-muted-foreground">
              Natural language queries powered by Ollama + pgvector
            </p>
            {getFilterDisplayLabel() && (
              <Badge variant="secondary" className="mt-2">
                Filtered by: {getFilterDisplayLabel()}
              </Badge>
            )}
          </div>
          {aiHealth && (
            <Badge
              variant={aiHealth.ready ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {aiHealth.ready ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {aiHealth.message}
            </Badge>
          )}
        </div>

        {/* Example Queries */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {exampleQueries.map((example, idx) => (
            <Card
              key={idx}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleExampleClick(example.query)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <example.icon className={`h-4 w-4 ${example.color}`} />
                  {example.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{example.query}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout: Chat + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* LEFT: Chat Interface */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BotMessageSquare className="h-5 w-5" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask questions in natural language
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearConversation}
                  disabled={messages.length <= 1}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`${
                        message.role === 'user' ? 'max-w-[80%]' : 'max-w-[90%]'
                      } rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.isError
                          ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Show query button if available */}
                        {message.query && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setShowQuery(message.query || null)}
                          >
                            <Code className="h-3 w-3 mr-1" />
                            View Query
                          </Button>
                        )}

                        <p className="text-xs opacity-70 ml-auto">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question about your data..."
                  className="flex-1 px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading || !aiHealth?.ready}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading || !aiHealth?.ready}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Query Modal */}
              {showQuery && (
                <div className="mt-4 p-3 bg-muted border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <Code className="h-4 w-4" />
                      Generated Query
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuery(null)}
                    >
                      Close
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto p-2 bg-background rounded">
                    {showQuery}
                  </pre>
                </div>
              )}

              {/* Info Banner */}
              {!aiHealth?.ready && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Setup Required
                      </p>
                      <p className="text-orange-700 dark:text-orange-300 mt-1">
                        To use the AI agent, please ensure Ollama is running and the required models are installed.
                        Run: <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">ollama pull llama3.2:3b</code> and{' '}
                        <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">ollama pull nomic-embed-text</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Results Panel */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Results
                  </CardTitle>
                  <CardDescription>
                    Structured data from your queries
                  </CardDescription>
                </div>
                {currentResults && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentResults(null)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {currentResults ? (
                <ResultRenderer
                  data={currentResults.data}
                  presentation={currentResults.presentation}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Results will appear here when you ask a question
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Future Features Preview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Predictive Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Get AI-powered predictions for deal closure probability, revenue forecasting, and churn risk.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Automatically identify unusual patterns in client behavior, deal velocity, and revenue trends.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Receive personalized suggestions for client-brand pairings and cross-sell opportunities.
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
