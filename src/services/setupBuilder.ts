import {
  fetchBestProductPerCategory,
  fetchAlternativeProducts,
  fetchProductDetails,
  SanityProduct,
} from '@/services/sanity/sanityService'

export interface SetupConstraints {
  categories: string[] // Category IDs
  maxBudget: number
  stylePreference: string[] // Style tags
  minSustainability?: number // Default: 0
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

/**
 * Check compatibility between selected products
 * Returns true if all products in the bundle are compatible
 */
async function checkBundleCompatibility(products: SanityProduct[]): Promise<boolean> {
  // Create a compatibility map
  const compatibilityMap = new Map<string, Set<string>>()

  for (const product of products) {
    const compatibleIds = new Set(product.compatibility.map((c) => c._id))
    compatibilityMap.set(product._id, compatibleIds)
  }

  // Check if all products are compatible with each other
  for (const product of products) {
    const productCompatibility = compatibilityMap.get(product._id)
    if (!productCompatibility) continue

    // Check if this product is compatible with all other products in the setup
    for (const otherProduct of products) {
      if (otherProduct._id === product._id) continue
      if (!productCompatibility.has(otherProduct._id)) {
        return false
      }
    }
  }

  return true
}

/**
 * Calculate total cost including required accessories
 */
function calculateTotalCost(products: SanityProduct[]): number {
  const productIds = new Set(products.map((p) => p._id))
  let total = 0

  // Add product prices
  for (const product of products) {
    total += product.price
  }

  // Add required accessories that aren't already in the setup
  for (const product of products) {
    for (const accessory of product.requiredAccessories) {
      if (!productIds.has(accessory._id)) {
        total += accessory.price
      }
    }
  }

  return total
}

/**
 * Build setup by selecting one product per category
 * Intelligently replaces products if over budget
 */
async function buildSetupWithinBudget(
  categories: string[],
  maxBudget: number,
  stylePreference: string[],
  minSustainability: number = 0
): Promise<{ products: SanityProduct[]; totalCost: number }> {
  const selectedProducts: SanityProduct[] = []
  let currentBudget = maxBudget

  // First pass: try to get the best product in each category
  for (const categoryId of categories) {
    const bestProduct = await fetchBestProductPerCategory(
      categoryId,
      currentBudget,
      minSustainability,
      stylePreference
    )

    if (bestProduct) {
      selectedProducts.push(bestProduct)
      currentBudget -= bestProduct.price
    }
  }

  const totalCost = calculateTotalCost(selectedProducts)

  // Second pass: if over budget, replace expensive items with cheaper alternatives
  if (totalCost > maxBudget) {
    let adjustedBudget = maxBudget

    // Sort by price (descending) to replace most expensive first
    selectedProducts.sort((a, b) => b.price - a.price)

    for (let i = 0; i < selectedProducts.length; i++) {
      const product = selectedProducts[i]
      const category = product.category

      // Calculate remaining budget for this product slot
      const otherProductsCost = selectedProducts
        .filter((_, idx) => idx !== i)
        .reduce((sum, p) => sum + p.price + p.requiredAccessories.reduce((s, a) => s + a.price, 0), 0)

      const availableBudget = maxBudget - otherProductsCost

      // If current product exceeds available budget, find a cheaper alternative
      if (product.price > availableBudget) {
        const alternatives = await fetchAlternativeProducts(
          category._id,
          availableBudget,
          minSustainability
        )

        if (alternatives.length > 0) {
          // Select the cheapest alternative with highest sustainability
          const bestAlternative = alternatives.sort(
            (a, b) =>
              b.sustainabilityScore - a.sustainabilityScore || a.price - b.price
          )[0]
          selectedProducts[i] = bestAlternative
        }
      }
    }
  }

  return {
    products: selectedProducts,
    totalCost: calculateTotalCost(selectedProducts),
  }
}

/**
 * Main function: Build a smart setup based on constraints
 */
export async function buildSmartSetup(constraints: SetupConstraints): Promise<SetupBuilderResult> {
  try {
    const { products, totalCost } = await buildSetupWithinBudget(
      constraints.categories,
      constraints.maxBudget,
      constraints.stylePreference,
      constraints.minSustainability || 0
    )

    const isCompatible = await checkBundleCompatibility(products)
    const remainingBudget = constraints.maxBudget - totalCost

    // Generate explanation
    let explanation = `This setup includes ${products.length} carefully selected products. `

    if (isCompatible) {
      explanation += `All items are compatible with each other. `
    } else {
      explanation += `Note: Some items may have limited compatibility - review details. `
    }

    const avgDurability = products.reduce(
      (sum, p) => sum + (p.performanceMetrics?.durabilityScore || 0),
      0
    ) / products.length
    const avgSustainability = products.reduce((sum, p) => sum + p.sustainabilityScore, 0) / products.length

    explanation += `Average durability score: ${avgDurability.toFixed(1)}/100. `
    explanation += `Average sustainability score: ${avgSustainability.toFixed(1)}/100. `

    if (remainingBudget > 0) {
      explanation += `You have $${remainingBudget.toFixed(2)} remaining in your budget.`
    }

    // Generate replacement suggestions
    const replacementSuggestions: ReplacementSuggestion[] = []

    if (totalCost > constraints.maxBudget) {
      for (const product of products) {
        const alternatives = await fetchAlternativeProducts(
          product.category._id,
          product.price,
          constraints.minSustainability || 0
        )

        for (const alt of alternatives) {
          if (alt.price < product.price) {
            replacementSuggestions.push({
              productId: product._id,
              productName: product.name,
              currentPrice: product.price,
              alternativeId: alt._id,
              alternativeName: alt.name,
              alternativePrice: alt.price,
              savings: product.price - alt.price,
              reason: `Lower cost option. Durability: ${alt.performanceMetrics?.durabilityScore || 0}/100, Sustainability: ${alt.sustainabilityScore}/100`,
            })
            break // Only suggest the best alternative
          }
        }
      }
    }

    return {
      products,
      totalCost,
      remainingBudget: Math.max(0, remainingBudget),
      isCompactible: isCompatible,
      explanation,
      replacementSuggestions,
    }
  } catch (error) {
    throw new Error(`Failed to build setup: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Get upgrade suggestions for a current setup
 */
export async function getUpgradeSuggestions(
  productIds: string[],
  maxAddBudget: number
): Promise<SanityProduct[]> {
  try {
    const products = await Promise.all(
      productIds.map((id) => fetchProductDetails(id))
    )

    // Get alternatives for each product
    const suggestions: SanityProduct[] = []

    for (const product of products) {
      if (!product) continue

      const alternatives = product.alternatives || []

      // Filter and sort by price increase and sustainability
      const upgrades = alternatives
        .filter((alt) => alt.price - product.price <= maxAddBudget)
        .sort(
          (a, b) =>
            b.sustainabilityScore - a.sustainabilityScore || (b.performanceMetrics?.averageRating ?? 0) - (a.performanceMetrics?.averageRating ?? 0)
        )
        .slice(0, 3)

      suggestions.push(...upgrades)
    }

    return suggestions
  } catch (error) {
    throw new Error(
      `Failed to get upgrade suggestions: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Get compatible accessories for selected products
 */
export async function getCompatibleAccessories(
  productIds: string[],
  maxBudget: number
): Promise<SanityProduct[]> {
  try {
    const allProducts = await Promise.all(
      productIds.map((id) => fetchProductDetails(id))
    )

    const accessories: Map<string, SanityProduct> = new Map()
    let remainingBudget = maxBudget

    for (const product of allProducts) {
      if (!product) continue

      for (const accessory of product.requiredAccessories) {
        if (accessory.price <= remainingBudget && !accessories.has(accessory._id)) {
          accessories.set(accessory._id, accessory as any) // Type assertion for simplicity
          remainingBudget -= accessory.price
        }
      }
    }

    return Array.from(accessories.values())
  } catch (error) {
    throw new Error(
      `Failed to get compatible accessories: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
