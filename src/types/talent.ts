export interface Agent {
  id: string
  name: string
  email: string
  phone?: string
}

export interface TalentAgent {
  id: string
  talentClientId: string
  agentId: string
  isPrimary: boolean
  role?: string
  createdAt: string
  agent: Agent
}

export interface Brand {
  id: string
  name: string
  type: string
}

export interface Schedule {
  id: string
  name: string
  amount: number
  scheduleDate: string
  scheduleStatus: string
}

export interface Deal {
  id: string
  name: string
  amount?: number
  status: string
  startDate?: string
  closeDate?: string
  brand: Brand
  schedules: Schedule[]
}

export interface DealClient {
  deal: Deal
  splitPercent?: number
}

export interface Note {
  id: string
  title: string
  content: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string
  }
}

export interface Contact {
  id: string
  email?: string
  phone?: string
  website?: string
  address?: string
  instagram?: string
  twitter?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  twitch?: string
  spotify?: string
  soundcloud?: string
}

export interface EmailLog {
  id: string
  subject: string
  fromEmail: string
  toEmail: string
  body?: string
  timestamp: string
}

export interface TalentDetail {
  id: string
  name: string
  firstName?: string
  lastName?: string
  status: string
  category?: string
  isNil: boolean
  isWomen: boolean
  isRetired: boolean
  sport?: string
  team?: string
  costCenter?: string
  location?: string
  marketingFeePercentage?: number
  firstSignedDate?: string
  firstDealDate?: string
  lastDealDate?: string
  salesforceId?: string
  workdayId?: string
  createdAt: string
  updatedAt: string

  // Relationships
  agents: TalentAgent[]
  deals: DealClient[]
  notes: Note[]
  contacts: Contact[]
  emailLogs?: EmailLog[]

  // Computed fields
  totalRevenue: number
  wassRevenue?: number
  dealCount: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  error?: string
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}