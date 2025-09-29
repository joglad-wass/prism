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
  // Core System Fields
  id: string
  createdAt: string
  updatedAt: string

  // Salesforce System Fields
  Id?: string // Salesforce ID
  Name: string
  IsDeleted?: boolean

  // Person Account Fields
  FirstName?: string
  LastName?: string
  MiddleName?: string
  Salutation?: string
  Suffix?: string
  PersonEmail?: string
  PersonTitle?: string
  PersonMobilePhone?: string
  PersonHomePhone?: string
  PersonBirthdate?: string
  PersonGenderIdentity?: string
  PersonPronouns?: string

  // Contact Information
  Phone?: string
  Fax?: string
  Website?: string
  PhotoUrl?: string

  // Address Fields
  BillingStreet?: string
  BillingCity?: string
  BillingState?: string
  BillingStateCode?: string
  BillingPostalCode?: string
  BillingCountry?: string
  BillingCountryCode?: string
  BillingLatitude?: number
  BillingLongitude?: number

  ShippingStreet?: string
  ShippingCity?: string
  ShippingState?: string
  ShippingStateCode?: string
  ShippingPostalCode?: string
  ShippingCountry?: string
  ShippingCountryCode?: string

  PersonMailingStreet?: string
  PersonMailingCity?: string
  PersonMailingState?: string
  PersonMailingStateCode?: string
  PersonMailingPostalCode?: string
  PersonMailingCountry?: string
  PersonMailingCountryCode?: string

  // Salesforce Custom Fields
  Status__c?: string
  Client_Status__c?: string
  Account_Status__c?: string
  Client_Category__c?: string
  Sport__c?: string
  CSM_Sport__c?: string
  Sports_Category__c?: string
  Sub_Sport__c?: string
  Team__c?: string
  Cost_Center__c?: string
  Agent_Cost_Center__c?: string
  NIL__c?: boolean
  Women__c?: boolean
  Marketing_Fee_Percentage__c?: number

  // Agent and Agency Fields
  Agent__c?: string
  Agent_Emails__c?: string
  Agency__c?: string
  Agency__pc?: string
  Agent_Workday_Company__c?: string

  // Social Media Fields (from schema)
  Instagram__c?: string
  Instagram_Followers__c?: string
  Facebook__c?: string
  X_Twitter__c?: string
  YouTube__c?: string

  // Integration Fields
  Workday_ID__c?: string
  Workday_Company_Default__c?: string
  Agiloft_Company_ID__c?: string
  Chartmetric_ID__c?: string
  External_ID__c?: string

  // Business Fields
  Description?: string
  Industry?: string
  AnnualRevenue?: number
  AccountNumber?: string
  Rating?: string
  Ownership?: string

  // Client Management Fields
  Active_Talent_Client__c?: boolean
  Account_Type__c?: string
  Client_Code__c?: string
  Client_Designation__c?: string
  Client_Image__c?: string
  Exclusive__c?: boolean

  // Location & Demographics
  City__c?: string
  Country__c?: string
  Country_of_Origin__c?: string
  Location__c?: string
  Market__c?: string

  // Date Fields
  CreatedDate?: string
  LastModifiedDate?: string
  LastActivityDate?: string
  SystemModstamp?: string

  // Legacy fields for backward compatibility
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