/**
 * GROQ Query Builders for Smart Setup
 *
 * These queries are structured to fetch products with compatibility,
 * performance metrics, and sustainability data for intelligent setup building.
 */

/**
 * Fetch all categories (used for setup category selection)
 */
export const CATEGORIES_QUERY = `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    icon,
    "image": image.asset->url,
  }
`

/**
 * Fetch products in a category under a specific price
 */
export const PRODUCTS_BY_CATEGORY_AND_PRICE = `
  *[_type == "product" && references($categoryId) && price <= $maxPrice] | order(price asc) {
    _id,
    name,
    slug,
    price,
    description,
    "category": category->{ _id, title, slug },
    "brand": brand->{ _id, name, slug, trustScore, sustainabilityRating },
    styleTags,
    "image": image.asset->url,
    performanceMetrics,
    sustainabilityScore,
    inStock,
    "compatibility": compatibility[]->{
      _id,
      name,
      slug,
      price,
    },
    "requiredAccessories": requiredAccessories[]->{
      _id,
      name,
      slug,
      price,
    },
    "alternatives": alternatives[]->{
      _id,
      name,
      slug,
      price,
      performanceMetrics,
      sustainabilityScore,
    },
  }
`

/**
 * Fetch products filtered by style tags
 */
export const PRODUCTS_BY_STYLE_TAGS = `
  *[_type == "product" && price <= $maxPrice && $styleTags in styleTags] | order(price asc) {
    _id,
    name,
    slug,
    price,
    description,
    "category": category->{ _id, title, slug },
    "brand": brand->{ _id, name, trustScore },
    styleTags,
    "image": image.asset->url,
    performanceMetrics,
    sustainabilityScore,
  }
`

/**
 * Fetch compatible products for a given product
 * Updates based on compatibility relationships
 */
export const COMPATIBLE_PRODUCTS_QUERY = `
  *[_type == "product" && references($productId)] {
    _id,
    name,
    slug,
    price,
    description,
    "category": category->{ _id, title, slug },
    "brand": brand->{ _id, name, trustScore },
    "image": image.asset->url,
    performanceMetrics,
    sustainabilityScore,
    styleTags,
  }
`

/**
 * Fetch alternative products when main choice is over budget
 * Looks for products with similar attributes and sustainability
 */
export const ALTERNATIVE_PRODUCTS_QUERY = `
  *[_type == "product" && price <= $maxPrice && category._ref == $categoryId && sustainabilityScore >= $minSustainability] | order(price asc) {
    _id,
    name,
    slug,
    price,
    description,
    "category": category->{ _id, title, slug },
    "brand": brand->{ _id, name, trustScore, sustainabilityRating },
    "image": image.asset->url,
    performanceMetrics,
    sustainabilityScore,
    attributes[]->{ name, type },
    styleTags,
  }
`

/**
 * Fetch the best product per category based on budget and constraints
 */
export const BEST_PRODUCT_PER_CATEGORY = `
  *[_type == "product" && references($categoryId) && price <= $maxPrice && sustainabilityScore >= $minSustainability && ($styleTags | length == 0 || any($styleTags[] in styleTags))] | order(sustainabilityScore desc, performanceMetrics.averageRating desc) {
    _id,
    name,
    slug,
    price,
    description,
    "category": category->{ _id, title, slug },
    "brand": brand->{ _id, name, trustScore, sustainabilityRating },
    "image": image.asset->url,
    performanceMetrics,
    sustainabilityScore,
    attributes[]->{ name, type },
    styleTags,
    "compatibility": compatibility[]->{
      _id,
      name,
      slug,
    },
    "requiredAccessories": requiredAccessories[]->{
      _id,
      name,
      slug,
      price,
    },
    "alternatives": alternatives[]->{
      _id,
      name,
      slug,
      price,
      performanceMetrics,
    },
  }[0]
`

/**
 * Check compatibility between multiple products
 * Returns products that are referenced by the selected product
 */
export const CHECK_PRODUCT_COMPATIBILITY = `
  *[_type == "product" && _id in $selectedProductIds] {
    _id,
    name,
    "compatibility": compatibility[]->{
      _id,
      name,
    },
  }
`

/**
 * Fetch complete product details with all relationships
 */
export const PRODUCT_DETAILS_QUERY = `
  *[_type == "product" && _id == $productId][0] {
    _id,
    name,
    slug,
    price,
    description,
    "category": category->{ _id, title, slug },
    "brand": brand->{ _id, name, slug, trustScore, sustainabilityRating },
    attributes[]->{ _id, name, type },
    styleTags,
    "image": image.asset->url,
    images[]{asset->url},
    performanceMetrics,
    sustainabilityScore,
    inStock,
    sku,
    externalUrl,
    "compatibility": compatibility[]->{
      _id,
      name,
      slug,
      price,
      "category": category->{ title },
    },
    "requiredAccessories": requiredAccessories[]->{
      _id,
      name,
      slug,
      price,
    },
    "alternatives": alternatives[]->{
      _id,
      name,
      slug,
      price,
      performanceMetrics,
      sustainabilityScore,
      "category": category->{ title },
    },
  }
`

/**
 * Fetch all accessible accessories for a product
 */
export const PRODUCT_ACCESSORIES_QUERY = `
  *[_type == "product" && _id == $productId][0].requiredAccessories[]->{
    _id,
    name,
    slug,
    price,
    "image": image.asset->url,
    performanceMetrics,
  }
`
