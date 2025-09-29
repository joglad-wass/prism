// Core API Types based on backend schema

export interface TalentClient {
  id: string
  createdAt: string
  updatedAt: string

  // Basic Information
  name: string
  firstName?: string
  lastName?: string
  status: string
  category?: string
  isNil: boolean
  isWomen: boolean
  isRetired: boolean

  // Professional Information
  sport?: string
  team?: string
  costCenter?: string
  location?: string

  // Dates
  firstSignedDate?: string
  firstDealDate?: string
  lastDealDate?: string

  // External Links
  salesforceId?: string
  workdayId?: string

  // Relationships
  agentId?: string
  agent?: Agent
  agents?: TalentAgent[]
  deals?: DealClient[]
  notes?: Note[]
  contacts?: Contact[]
  emailLogs?: EmailLog[]
}

export interface Agent {
  id: string
  createdAt: string
  updatedAt: string

  // Basic Information
  name: string
  email: string
  phone?: string
  title?: string

  // Organization
  company?: string
  division?: string
  costCenter?: string

  // Relationships
  clients?: TalentClient[]
  deals?: Deal[]
  ownedBrands?: Brand[]
  notes?: Note[]
}

export interface TalentAgent {
  id: string
  talentClientId: string
  agentId: string
  isPrimary: boolean
  role?: string
  agent: Agent
}

export interface Brand {
  id: string
  createdAt: string
  updatedAt: string

  // Basic Information
  name: string
  altName?: string
  legalName?: string
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT'
  industry?: string
  type: 'BRAND' | 'AGENCY'
  currency: string

  // External Links
  salesforceId?: string
  workdayId?: string

  // Relationships
  ownerId?: string
  owner?: Agent
  deals?: Deal[]
  contacts?: Contact[]
  emailLogs?: EmailLog[]
}

export interface Deal {
  id: string
  createdAt: string
  updatedAt: string

  // Basic Information
  Name: string
  Status__c: string
  StageName: string
  startDate?: string
  closeDate?: string

  // Financial Information
  Amount?: number
  splitPercent?: number
  dealPercent?: number
  commission?: number

  // Organization
  division?: string
  company?: string

  // External Links
  salesforceId?: string
  workdayProjectId?: string

  // New Salesforce Fields
  OpportunityId__c?: string
  Account_Industry__c?: string
  Account_Name__c?: string
  Owner_Workday_Cost_Center__c?: string
  CompanyReference__c?: string
  Contract_Amount__c?: number
  Talent_Marketing_Fee_Percentage__c?: number
  Licence_Holder_Name__c?: string
  Stage_Last_Updated__c?: string

  // Relationships
  brandId: string
  brand?: Brand
  ownerId?: string
  owner?: Agent
  clients?: DealClient[]
  products?: Product[]
  schedules?: Schedule[]
  notes?: DealNote[]
  _count?: {
    schedules: number
    notes: number
    products?: number
  }
}

export interface DealClient {
  id: string
  talentClientId: string
  dealId: string
  splitPercent?: number
  talentClient?: TalentClient
  deal?: Deal
}

export interface Product {
  id: string
  createdAt: string
  updatedAt: string

  // Salesforce Product Fields
  Product_Name__c?: string
  ProductCode?: string
  Project_Deliverables__c?: string
  UnitPrice?: number
  Workday_Company__c?: string
  Workday_Project_State__c?: string

  // Relationships
  OpportunityId: string
  deal?: Deal
  schedules?: Schedule[]
  _count?: {
    schedules: number
  }
}

export interface Schedule {
  id: string
  createdAt: string
  updatedAt: string

  // Salesforce Schedule Fields
  Revenue?: number
  ScheduleDate?: string
  Description?: string
  Type?: string
  ScheduleStatus?: string
  ScheduleSplitPercent?: number
  Billable?: boolean

  // Invoice and Payment Fields
  Talent_Invoice_Line_Amount__c?: number
  Wasserman_Invoice_Line_Amount__c?: number
  WD_Invoice_ID__c?: string
  WD_Invoice_Reference_ID__c?: string
  WD_Payment_Status__c?: string
  WD_Payment_Term__c?: string
  WD_PO_Number__c?: string

  // Legacy fields for compatibility
  name?: string
  amount?: number
  paymentTerms?: string

  // Status
  scheduleStatus?: string
  paymentStatus?: string

  // External Links
  workdayId?: string

  // Relationships
  OpportunityLineItemId?: string
  product?: Product
  dealId?: string
  deal?: Deal
}

export interface Contact {
  id: string
  createdAt: string
  updatedAt: string

  // Contact Information
  email?: string
  phone?: string
  website?: string
  address?: string

  // Social Media
  instagram?: string
  twitter?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  twitch?: string
  spotify?: string
  soundcloud?: string

  // Relationships (polymorphic)
  talentClientId?: string
  talentClient?: TalentClient
  brandId?: string
  brand?: Brand
}

export interface Note {
  id: string
  createdAt: string
  updatedAt: string

  // Content
  title: string
  content: string
  category: 'GENERAL' | 'BUSINESS' | 'PERSONAL' | 'FOLLOW_UP' | 'MEETING' | 'EMAIL'
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

  // Relationships
  talentClientId: string
  talentClient?: TalentClient
  authorId?: string
  author?: Agent
  deals?: DealNote[]
}

export interface DealNote {
  id: string
  noteId: string
  dealId: string
  note?: Note
  deal?: Deal
}

export interface EmailLog {
  id: string
  createdAt: string

  // Email Information
  subject: string
  fromEmail: string
  toEmail: string
  body?: string
  timestamp: string

  // Relationships
  talentClientId?: string
  talentClient?: TalentClient
  brandId?: string
  brand?: Brand
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    clientMetrics?: {
      uniqueClients: number
      totalRelationships: number
      avgClientsPerAgent: number
    }
  }
}

export interface SearchResult {
  type: 'talent' | 'brand' | 'agent' | 'deal'
  id: string
  title: string
  subtitle?: string
  category?: string
}

// API Filter Types
export interface TalentFilters {
  status?: string
  category?: string
  isNil?: boolean
  isWomen?: boolean
  agent?: string
  search?: string
  page?: number
  limit?: number
}

export interface BrandFilters {
  status?: Brand['status']
  type?: Brand['type']
  industry?: string
  owner?: string
  search?: string
  page?: number
  limit?: number
}

export interface DealFilters {
  status?: string
  stage?: string
  brand?: string
  agent?: string
  division?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProductFilters {
  dealId?: string
  productCode?: string
  productName?: string
  search?: string
  page?: number
  limit?: number
}

export interface ScheduleFilters {
  dealId?: string
  productId?: string
  scheduleStatus?: string
  paymentStatus?: string
  search?: string
  page?: number
  limit?: number
}

export interface AgentFilters {
  company?: string
  division?: string
  search?: string
  hasDeals?: boolean
  page?: number
  limit?: number
}