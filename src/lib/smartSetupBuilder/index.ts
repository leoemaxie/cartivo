/**
 * Smart Setup Builder - Export Index
 * 
 * Import everything you need from this file:
 * 
 * import {
 *   SmartSetupBuilder,
 *   ProductCard,
 *   buildSmartSetup,
 *   fetchCategories,
 *   fetchProductDetails,
 * } from '@/lib/smartSetupBuilder'
 */

// ============================================
// COMPONENTS
// ============================================

export { default as SmartSetupBuilder } from '@/app/components/SmartSetupBuilder'
export { default as ProductCard } from '@/app/components/SmartSetupBuilder/ProductCard'
export { default as ReplacementSuggestions } from '@/app/components/SmartSetupBuilder/ReplacementSuggestions'
export { default as CompatibleAccessories } from '@/app/components/SmartSetupBuilder/CompatibleAccessories'

// ============================================
// SETUP BUILDER LOGIC
// ============================================

export {
  buildSmartSetup,
  getUpgradeSuggestions,
  getCompatibleAccessories,
  type SetupConstraints,
  type SetupBuilderResult,
  type ReplacementSuggestion,
} from '@/services/setupBuilder'

// ============================================
// SANITY SERVICES
// ============================================

export {
  fetchCategories,
  fetchProductsByCategory,
  fetchProductsByStyleTags,
  fetchCompatibleProducts,
  fetchAlternativeProducts,
  fetchBestProductPerCategory,
  checkProductCompatibility,
  fetchProductDetails,
  fetchProductAccessories,
  type SanityProduct,
  type SanityCategory,
} from '@/services/sanity/sanityService'

// ============================================
// SANITY CLIENT
// ============================================

export { default as sanityClient } from '@/services/sanity/client'
