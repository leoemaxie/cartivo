import sanityClient from './client'
import * as queries from './queries'

export interface SanityProduct {
  _id: string
  name: string
  slug: { current: string }
  price: number
  description: string
  category: {
    _id: string
    title: string
    slug: { current: string }
  }
  brand: {
    _id: string
    name: string
    slug: { current: string }
    trustScore: number
    sustainabilityRating: number
  }
  styleTags: string[]
  image: string
  images?: { asset: { url: string } }[]
  performanceMetrics: {
    durabilityScore: number
    returnRate: number
    warrantyYears: number
    averageRating: number
  }
  sustainabilityScore: number
  inStock: boolean
  sku?: string
  externalUrl?: string
  compatibility: Array<{
    _id: string
    name: string
    slug: { current: string }
  }>
  requiredAccessories: Array<{
    _id: string
    name: string
    slug: { current: string }
    price: number
  }>
  alternatives: Array<{
    _id: string
    name: string
    slug: { current: string }
    price: number
    performanceMetrics: any
  }>
}

export interface SanityCategory {
  _id: string
  title: string
  slug: { current: string }
  description: string
  icon?: string
  image?: string
}

/**
 * Fetch all categories
 */
export const fetchCategories = async (): Promise<SanityCategory[]> => {
  return sanityClient.fetch(queries.CATEGORIES_QUERY)
}

/**
 * Fetch products in a category under a specific price
 */
export const fetchProductsByCategory = async (
  categoryId: string,
  maxPrice: number
): Promise<SanityProduct[]> => {
  return sanityClient.fetch(queries.PRODUCTS_BY_CATEGORY_AND_PRICE, {
    categoryId,
    maxPrice,
  })
}

/**
 * Fetch products by style tags
 */
export const fetchProductsByStyleTags = async (
  styleTags: string[],
  maxPrice: number
): Promise<SanityProduct[]> => {
  return sanityClient.fetch(queries.PRODUCTS_BY_STYLE_TAGS, {
    maxPrice,
    styleTags,
  })
}

/**
 * Fetch compatible products for a given product
 */
export const fetchCompatibleProducts = async (productId: string): Promise<SanityProduct[]> => {
  return sanityClient.fetch(queries.COMPATIBLE_PRODUCTS_QUERY, { productId })
}

/**
 * Fetch alternative products
 */
export const fetchAlternativeProducts = async (
  categoryId: string,
  maxPrice: number,
  minSustainability: number = 0
): Promise<SanityProduct[]> => {
  return sanityClient.fetch(queries.ALTERNATIVE_PRODUCTS_QUERY, {
    categoryId,
    maxPrice,
    minSustainability,
  })
}

/**
 * Fetch best product per category
 */
export const fetchBestProductPerCategory = async (
  categoryId: string,
  maxPrice: number,
  minSustainability: number = 0,
  styleTags: string[] = []
): Promise<SanityProduct | null> => {
  return sanityClient.fetch(queries.BEST_PRODUCT_PER_CATEGORY, {
    categoryId,
    maxPrice,
    minSustainability,
    styleTags,
  })
}

/**
 * Check compatibility between multiple products
 */
export const checkProductCompatibility = async (
  selectedProductIds: string[]
): Promise<Array<{ _id: string; name: string; compatibility: any[] }>> => {
  return sanityClient.fetch(queries.CHECK_PRODUCT_COMPATIBILITY, {
    selectedProductIds,
  })
}

/**
 * Fetch complete product details
 */
export const fetchProductDetails = async (productId: string): Promise<SanityProduct | null> => {
  return sanityClient.fetch(queries.PRODUCT_DETAILS_QUERY, { productId })
}

/**
 * Fetch accessories for a product
 */
export const fetchProductAccessories = async (
  productId: string
): Promise<
  Array<{
    _id: string
    name: string
    slug: { current: string }
    price: number
    image: string
    performanceMetrics: any
  }>
> => {
  return sanityClient.fetch(queries.PRODUCT_ACCESSORIES_QUERY, { productId })
}
