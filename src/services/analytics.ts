import api from './api'

export interface QueryParams {
  entity: 'talents' | 'brands' | 'agents' | 'deals'
  filters?: any
  relationships?: {
    with?: string[]
    without?: string[]
    type?: 'and' | 'or'
  }
  costCenter?: string
  costCenterGroup?: string
}

export interface InsightParams {
  type?: string
  costCenter?: string
  costCenterGroup?: string
}

export interface NetworkParams {
  costCenter?: string
  costCenterGroup?: string
}

export interface BrandCooccurrence {
  [brand1: string]: {
    [brand2: string]: {
      count: number
      clients: Set<string>
    }
  }
}

export interface AgentPortfolio {
  agentId: string
  agentName: string
  clientCount: number
  dealCount: number
  brandCount: number
  categories: string[]
  categoryCount: number
  diversityScore: number
}

export interface RevenueConcentration {
  totalRevenue: number
  topClients: Array<{
    id: string
    name: string
    revenue: number
    percentage: number
  }>
  topBrands: Array<{
    id: string
    name: string
    revenue: number
    percentage: number
  }>
  top10ClientsPercentage: number
  top10BrandsPercentage: number
}

export interface EngagementRecency {
  hot: number
  warm: number
  cooling: number
  cold: number
  never: number
  clients: Array<{
    clientId: string
    clientName: string
    lastEngagementDate: string | null
    daysSinceEngagement: number | null
    status: 'hot' | 'warm' | 'cooling' | 'cold' | 'never'
  }>
}

export interface CategoryPerformance {
  [category: string]: {
    clientCount: number
    dealCount: number
    totalRevenue: number
    avgRevenuePerClient: number
    avgRevenuePerDeal: number
  }
}

export interface DealVelocity {
  byAgent: Array<{
    agentName: string
    dealCount: number
    avgDaysToClose: number
    totalRevenue: number
  }>
  byBrand: Array<{
    brandName: string
    dealCount: number
    avgDaysToClose: number
    totalRevenue: number
  }>
}

export interface InsightsData {
  brandCooccurrence?: BrandCooccurrence
  agentPortfolio?: AgentPortfolio[]
  revenueConcentration?: RevenueConcentration
  engagementRecency?: EngagementRecency
  categoryPerformance?: CategoryPerformance
  dealVelocity?: DealVelocity
}

export interface NetworkNode {
  id: string
  label: string
  type: 'talent' | 'brand' | 'agent'
  category?: string
  status?: string
  dealCount?: number
  brandType?: string
  isPrimary?: boolean
}

export interface NetworkEdge {
  from: string
  to: string
  type: 'represents' | 'deal'
  isPrimary?: boolean
  dealId?: string
  amount?: number
}

export interface NetworkData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  stats: {
    totalNodes: number
    talentCount: number
    brandCount: number
    agentCount: number
    totalEdges: number
  }
}

export class AnalyticsService {
  static async executeQuery(params: QueryParams): Promise<any> {
    const response = await api.post('/analytics/query', params)
    return response.data
  }

  static async getInsights(params: InsightParams = {}): Promise<InsightsData> {
    const queryParams = new URLSearchParams()
    if (params.type) queryParams.append('type', params.type)
    if (params.costCenter) queryParams.append('costCenter', params.costCenter)
    if (params.costCenterGroup) queryParams.append('costCenterGroup', params.costCenterGroup)

    const response = await api.get(`/analytics/insights?${queryParams.toString()}`)
    return response.data.data
  }

  static async getNetworkData(params: NetworkParams = {}): Promise<NetworkData> {
    const queryParams = new URLSearchParams()
    if (params.costCenter) queryParams.append('costCenter', params.costCenter)
    if (params.costCenterGroup) queryParams.append('costCenterGroup', params.costCenterGroup)

    const response = await api.get(`/analytics/network?${queryParams.toString()}`)
    return response.data.data
  }
}
