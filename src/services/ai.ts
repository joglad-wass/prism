import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface PresentationMetadata {
  type: 'table' | 'cards' | 'list' | 'single' | 'count'
  columns?: string[]
  title?: string
}

export interface AIQueryResponse {
  success: boolean
  data?: {
    question: string
    answer: string
    results: any
    query: string
    context: string[]
    presentation: PresentationMetadata
  }
  error?: string
}

export interface AIHealthResponse {
  success: boolean
  data?: {
    ollama: {
      isRunning: boolean
      hasLLM: boolean
      hasEmbedding: boolean
      models: string[]
    }
    embeddings: Array<{ type: string; count: number }>
    ready: boolean
  }
  error?: string
}

/**
 * Query the AI agent with a natural language question
 */
export async function queryAI(
  question: string,
  history?: Array<{ question: string; answer: string; data?: any }>,
  filters?: { costCenter?: string; costCenterGroup?: string }
): Promise<AIQueryResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/ai/query`, {
      question,
      history,
      costCenter: filters?.costCenter,
      costCenterGroup: filters?.costCenterGroup,
    })
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to query AI',
    }
  }
}

/**
 * Check AI service health
 */
export async function checkAIHealth(): Promise<AIHealthResponse> {
  try {
    const response = await axios.get(`${API_URL}/api/ai/health`)
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to check AI health',
    }
  }
}

/**
 * Get AI service statistics
 */
export async function getAIStats(): Promise<{
  success: boolean
  data?: Array<{ type: string; count: number }>
  error?: string
}> {
  try {
    const response = await axios.get(`${API_URL}/api/ai/stats`)
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch stats',
    }
  }
}
