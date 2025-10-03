// Core API Types based on backend schema

export interface TalentClient {
  // Core System Fields
  id: string
  createdAt: string
  updatedAt: string

  // Salesforce System Fields
  attributes_type?: string
  attributes_url?: string
  Id?: string
  IsDeleted?: boolean
  MasterRecordId?: string
  Name: string
  ParentId?: string
  BillingAddress?: any
  BillingCity?: string
  BillingCountry?: string
  BillingCountryCode?: string
  BillingGeocodeAccuracy?: string
  BillingLatitude?: number
  BillingLongitude?: number
  BillingPostalCode?: string
  BillingState?: string
  BillingStateCode?: string
  BillingStreet?: string
  ShippingAddress?: any
  ShippingCity?: string
  ShippingCountry?: string
  ShippingCountryCode?: string
  ShippingGeocodeAccuracy?: string
  ShippingLatitude?: number
  ShippingLongitude?: number
  ShippingPostalCode?: string
  ShippingState?: string
  ShippingStateCode?: string
  ShippingStreet?: string
  Phone?: string
  Fax?: string
  AccountNumber?: string
  Website?: string
  PhotoUrl?: string
  Sic?: string
  Industry?: string
  AnnualRevenue?: number
  NumberOfEmployees?: number
  Ownership?: string
  TickerSymbol?: string
  Description?: string
  Rating?: string
  Site?: string
  OwnerId?: string
  CreatedDate?: string
  CreatedById?: string
  LastModifiedDate?: string
  LastModifiedById?: string
  SystemModstamp?: string
  LastActivityDate?: string
  LastViewedDate?: string
  LastReferencedDate?: string
  IsPersonAccount?: boolean
  PersonContactId?: string
  PersonMailingAddress?: any
  PersonMailingCity?: string
  PersonMailingCountry?: string
  PersonMailingCountryCode?: string
  PersonMailingGeocodeAccuracy?: string
  PersonMailingLatitude?: number
  PersonMailingLongitude?: number
  PersonMailingPostalCode?: string
  PersonMailingState?: string
  PersonMailingStateCode?: string
  PersonMailingStreet?: string
  PersonOtherAddress?: any
  PersonOtherCity?: string
  PersonOtherCountry?: string
  PersonOtherCountryCode?: string
  PersonOtherGeocodeAccuracy?: string
  PersonOtherLatitude?: number
  PersonOtherLongitude?: number
  PersonOtherPostalCode?: string
  PersonOtherState?: string
  PersonOtherStateCode?: string
  PersonOtherStreet?: string
  PersonOtherPhone?: string
  PersonMobilePhone?: string
  PersonHomePhone?: string
  PersonEmail?: string
  PersonTitle?: string
  PersonDepartment?: string
  PersonAssistantName?: string
  PersonAssistantPhone?: string
  PersonLeadSource?: string
  PersonBirthdate?: string
  PersonHasOptedOutOfEmail?: boolean
  PersonHasOptedOutOfFax?: boolean
  PersonDoNotCall?: boolean
  PersonLastCURequestDate?: string
  PersonLastCUUpdateDate?: string
  PersonEmailBouncedReason?: string
  PersonEmailBouncedDate?: string
  PersonGenderIdentity?: string
  PersonPronouns?: string
  PersonIndividualId?: string
  Jigsaw?: string
  JigsawCompanyId?: string
  AccountSource?: string
  SicDesc?: string

  // Person Account Name Fields
  Salutation?: string
  FirstName?: string
  LastName?: string
  MiddleName?: string
  Suffix?: string

  // Key Custom Salesforce Fields (sampling the most important ones)
  Academic_Calendar_Link__c?: string
  Academic_Organization__pc?: boolean
  AccountId__c?: string
  Account_Status__c?: string
  Active_Talent_Client__c?: boolean
  Agent_Cost_Center__c?: string
  Agent_Emails__c?: string
  Agent_Workday_Company__c?: string
  Cost_Center__c?: string

  // Social Media Fields
  Instagram__c?: string
  X_Twitter__c?: string
  Facebook__c?: string
  TikTok__c?: string
  YouTube__c?: string
  Spotify__c?: string
  Soundcloud__c?: string

  // Marketing and Performance Fields
  Marketing_Fee_Percentage__c?: number
  NIL__c?: boolean
  Women__c?: boolean
  Sports_Category__c?: string
  Sport__c?: string
  Team__c?: string
  Client_Status__c?: string
  Client_Department__c?: string
  Retainer_Status__c?: string
  Retired__c?: boolean

  // Workday Integration Fields
  WD_CustomerID__c?: string
  Ultimate_Parent_WD_Customer_ID__c?: string

  // Financial Tracking Fields
  Current_Year_Budget__c?: number
  Current_Year_Forecasted_Amount__c?: number
  CY_Budget__c?: number
  CY_Contracted__c?: number
  Prior_Year_Revenue__c?: number
  Total_Budget__c?: number
  Total_Won__c?: number

  // Legacy compatibility fields (for existing frontend code)
  name?: string
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
  firstSignedDate?: string
  firstDealDate?: string
  lastDealDate?: string
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
  TotalPrice?: number | string
  Description?: string
  Workday_Company__c?: string
  Workday_Project_State__c?: string

  // Workday Project Fields
  WD_PRJ_ID__c?: string
  WD_Project_Name__c?: string
  Workday_Project_Status__c?: string

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
  Active__c?: boolean

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

export interface ActivityLog {
  id: string
  createdAt: string

  // Activity details
  activityType: string // PRODUCT_CREATED, SCHEDULE_CREATED, etc.
  entityType: string  // Product, Schedule, Note, Deal, Payment
  entityId?: string

  // Change details
  title: string
  description?: string
  metadata?: any

  // User tracking
  actorId?: string
  actor?: Agent

  // Deal relationship
  dealId: string
  deal?: Deal
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
  // Additional metadata for tooltips
  sport?: string
  team?: string
  status?: string
  agents?: Array<{ agent: { name: string }, isPrimary: boolean }>
  industry?: string
  email?: string
  company?: string
  division?: string
  jobTitle?: string
  brand?: { name: string }
  owner?: { name: string }
  stage?: string
  amount?: string | number
}

// API Filter Types
export interface TalentFilters {
  status?: string
  category?: string
  isNil?: boolean
  isWomen?: boolean
  agent?: string
  search?: string
  costCenter?: string
  costCenterGroup?: string
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
  costCenter?: string
  costCenterGroup?: string
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
  costCenter?: string
  costCenterGroup?: string
  page?: number
  limit?: number
}
