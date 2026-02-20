/**
 * Smart Setup Builder - TypeScript Type Definitions
 */

// ============================================
// SETUP BUILDER TYPES
// ============================================

export interface SetupConstraints {
  categories: string[] // Category IDs from Sanity
  maxBudget: number // Total budget in USD
  stylePreference: string[] // Style tags (modern, minimalist, etc.)
  minSustainability?: number // 0-100 scale, default: 0
}

export interface SetupBuilderResult {
  products: SanityProduct[]
  totalCost: number
  remainingBudget: number
  isCompactible: boolean
  explanation: string
  replacementSuggestions: ReplacementSuggestion[]
}

export interface ReplacementSuggestion {
  productId: string
  productName: string
  currentPrice: number
  alternativeId: string
  alternativeName: string
  alternativePrice: number
  savings: number
  reason: string
}

// ============================================
// SANITY DOCUMENT TYPES
// ============================================

export interface SanityProduct {
  _id: string
  _type: 'product'
  name: string
  slug: { _type: 'slug'; current: string }
  price: number
  description?: string
  sku?: string
  inStock: boolean
  externalUrl?: string
  category: SanityReference<SanityCategory>
  brand: SanityReference<SanityBrand>
  image?: string
  images?: Array<{ asset: { url: string } }>
  attributes?: SanityReference<SanityAttribute>[]
  styleTags: string[]
  performanceMetrics: {
    durabilityScore: number // 0-100
    returnRate: number // percentage
    warrantyYears: number
    averageRating: number // 0-5
  }
  sustainabilityScore: number // 0-100
  compatibility: SanityReference<SanityProduct>[]
  requiredAccessories: SanityReference<SanityProduct>[]
  alternatives: SanityReference<SanityProduct>[]
}

export interface SanityCategory {
  _id: string
  _type: 'category'
  title: string
  slug: { _type: 'slug'; current: string }
  description?: string
  icon?: string
  image?: string
  parentCategory?: SanityReference<SanityCategory>
}

export interface SanityBrand {
  _id: string
  _type: 'brand'
  name: string
  slug: { _type: 'slug'; current: string }
  trustScore: number // 0-100
  sustainabilityRating: number // 0-100
  description?: string
  website?: string
  image?: string
}

export interface SanityAttribute {
  _id: string
  _type: 'attribute'
  name: string
  slug: { _type: 'slug'; current: string }
  type: AttributeType
  description?: string
}

export type AttributeType =
  | 'material'
  | 'waterproof'
  | 'ergonomic'
  | 'wireless'
  | 'adjustable'
  | 'noiseCanceling'
  | 'portable'
  | 'weatherResistant'
  | 'energyEfficient'
  | 'other'

// ============================================
// HELPER TYPES
// ============================================

export interface SanityReference<T> {
  _id: string
  _key?: string
  _ref?: string
  _type: 'reference'
  _weak?: boolean
  name?: string
  slug?: { current: string }
  price?: number
}

export interface SanityDocument {
  _id: string
  _type: string
  _rev?: string
  _createdAt?: string
  _updatedAt?: string
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface FetchProductsParams {
  categoryId: string
  maxPrice: number
}

export interface FetchAlternativeProductsParams {
  categoryId: string
  maxPrice: number
  minSustainability: number
}

export interface FetchBestProductParams {
  categoryId: string
  maxPrice: number
  minSustainability: number
  styleTags: string[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface SanityApiResponse<T> {
  result: T[]
  timestamp: string
}

export interface SanityError {
  message: string
  code?: string
  statusCode?: number
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface SmartSetupBuilderProps {
  onSetupBuilt?: (result: SetupBuilderResult) => void
  onError?: (error: Error) => void
}

export interface ProductCardProps {
  product: SanityProduct
  onSelect?: (product: SanityProduct) => void
  isSelected?: boolean
}

export interface ReplacementSuggestionsProps {
  suggestions: ReplacementSuggestion[]
}

export interface CompatibleAccessoriesProps {
  accessories: SanityProduct[]
}

// ============================================
// UTILITY TYPES
// ============================================

export type AsyncApiCall<T> = Promise<T>

export interface Cache<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// ============================================
// FILTER OPTIONS
// ============================================

export const STYLE_PREFERENCES = {
  MODERN: 'modern',
  MINIMALIST: 'minimalist',
  INDUSTRIAL: 'industrial',
  SCANDINAVIAN: 'scandinavian',
  INDUSTRIAL_MODERN: 'industrial-modern',
  ERGONOMIC_TECH: 'ergonomic-tech',
  SUSTAINABLE: 'sustainable',
  LUXURY: 'luxury',
  BUDGET_FRIENDLY: 'budget-friendly',
  VINTAGE: 'vintage',
} as const

export type StylePreference = typeof STYLE_PREFERENCES[keyof typeof STYLE_PREFERENCES]

export const ATTRIBUTE_TYPES = {
  MATERIAL: 'material',
  WATERPROOF: 'waterproof',
  ERGONOMIC: 'ergonomic',
  WIRELESS: 'wireless',
  ADJUSTABLE: 'adjustable',
  NOISE_CANCELING: 'noiseCanceling',
  PORTABLE: 'portable',
  WEATHER_RESISTANT: 'weatherResistant',
  ENERGY_EFFICIENT: 'energyEfficient',
} as const

export type AttributeTypeValue = typeof ATTRIBUTE_TYPES[keyof typeof ATTRIBUTE_TYPES]

// ============================================
// CONFIGURATION
// ============================================

export interface SanityClientConfig {
  projectId: string
  dataset: string
  apiVersion: string
  useCdn: boolean
  token?: string
}

export interface SetupBuilderConfig {
  minBudget: number // minimum budget allowed
  maxBudget: number // maximum budget allowed
  defaultBudget: number
  minSustainabilityDefault: number
  cacheTTL: number // milliseconds
}

export interface PerformanceThresholds {
  minDurabilityScore: number
  maxReturnRate: number
  minWarrantyYears: number
  minAverageRating: number
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SetupGeneratedEvent {
  timestamp: Date
  productCount: number
  totalCost: number
  remainingBudget: number
  isCompatible: boolean
  stylePreferences: string[]
  categoryCount: number
  minSustainability: number
}

export interface ProductViewEvent {
  timestamp: Date
  productId: string
  productName: string
  categoryId: string
  price: number
}

// ============================================
// ERROR HANDLING
// ============================================

export interface SetupBuilderError extends Error {
  code: 'INVALID_CONSTRAINT' | 'NO_PRODUCTS' | 'BUDGET_CONSTRAINT' | 'SANITY_ERROR'
  details?: Record<string, any>
}

export class InvalidConstraintError extends Error implements SetupBuilderError {
  code = 'INVALID_CONSTRAINT' as const
  details?: Record<string, any>

  constructor(message: string, details?: Record<string, any>) {
    super(message)
    this.details = details
    this.name = 'InvalidConstraintError'
  }
}

export class NoProductsError extends Error implements SetupBuilderError {
  code = 'NO_PRODUCTS' as const
  details?: Record<string, any>

  constructor(message: string = 'No products found matching criteria', details?: Record<string, any>) {
    super(message)
    this.details = details
    this.name = 'NoProductsError'
  }
}

export class BudgetConstraintError extends Error implements SetupBuilderError {
  code = 'BUDGET_CONSTRAINT' as const
  details?: Record<string, any>

  constructor(message: string, details?: Record<string, any>) {
    super(message)
    this.details = details
    this.name = 'BudgetConstraintError'
  }
}
