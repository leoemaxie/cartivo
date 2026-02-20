import { createClient } from '@sanity/client'
import "dotenv/config";

/**
 * Test Data Seeding Script for Smart Setup Builder
 *
 * This script populates Sanity with sample products for testing the Smart Setup Builder.
 * Run this ONCE to populate your Sanity project with test data.
 *
 * Usage:
 * npx ts-node sanity/migrations/seedTestData.ts
 *
 * Or from Node:
 * node --loader ts-node/esm sanity/migrations/seedTestData.ts
 */

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'project-id',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_TOKEN || '', // Set via environment or CLI prompt
  apiVersion: '2024-02-01',
})

// ============================================
// TEST DATA
// ============================================

const ATTRIBUTES = [
  { _key: 'ergonomic', name: 'Ergonomic', type: 'ergonomic' },
  { _key: 'adjustable', name: 'Adjustable', type: 'adjustable' },
  { _key: 'wireless', name: 'Wireless', type: 'wireless' },
  { _key: 'portable', name: 'Portable', type: 'portable' },
  { _key: 'noise_canceling', name: 'Noise Canceling', type: 'noiseCanceling' },
  { _key: 'energy_efficient', name: 'Energy Efficient', type: 'energyEfficient' },
]

const BRANDS = [
  {
    name: 'Autonomous',
    trustScore: 88,
    sustainabilityRating: 82,
    website: 'https://www.autonomous.ai',
  },
  {
    name: 'Herman Miller',
    trustScore: 95,
    sustainabilityRating: 90,
    website: 'https://www.hermanmiller.com',
  },
  {
    name: 'IKEA',
    trustScore: 85,
    sustainabilityRating: 80,
    website: 'https://www.ikea.com',
  },
  {
    name: 'Steelcase',
    trustScore: 92,
    sustainabilityRating: 88,
    website: 'https://www.steelcase.com',
  },
  {
    name: 'BenQ',
    trustScore: 84,
    sustainabilityRating: 75,
    website: 'https://www.benq.com',
  },
  {
    name: 'Logitech',
    trustScore: 87,
    sustainabilityRating: 78,
    website: 'https://www.logitech.com',
  },
]

const CATEGORIES = [
  {
    title: 'Desks',
    slug: 'desks',
    description: 'Workspace desking solutions',
    icon: 'table',
  },
  {
    title: 'Chairs',
    slug: 'chairs',
    description: 'Seating and ergonomic chairs',
    icon: 'chair',
  },
  {
    title: 'Monitors',
    slug: 'monitors',
    description: 'Display screens and monitors',
    icon: 'monitor',
  },
  {
    title: 'Lighting',
    slug: 'lighting',
    description: 'Desk and ambient lighting',
    icon: 'lightbulb',
  },
  {
    title: 'Accessories',
    slug: 'accessories',
    description: 'Cables, stands, organizers',
    icon: 'package',
  },
]

// Mock product template (you would populate images separately)
const PRODUCTS = [
  {
    name: 'Autonomous SmartDesk Pro',
    price: 799,
    category: 'Desks',
    brand: 'Autonomous',
    description: 'Electric standing desk with dual motor and app control',
    attributes: ['adjustable', 'ergonomic', 'energy_efficient'],
    styleTags: ['modern', 'ergonomic-tech'],
    performanceMetrics: {
      durabilityScore: 92,
      returnRate: 3.2,
      warrantyYears: 5,
      averageRating: 4.6,
    },
    sustainabilityScore: 85,
  },
  {
    name: 'IKEA Bekant Desk',
    price: 199,
    category: 'Desks',
    brand: 'IKEA',
    description: 'Simple, affordable desk with storage',
    attributes: [],
    styleTags: ['minimalist', 'budget-friendly', 'modern'],
    performanceMetrics: {
      durabilityScore: 70,
      returnRate: 8.5,
      warrantyYears: 2,
      averageRating: 4.1,
    },
    sustainabilityScore: 72,
  },
  {
    name: 'Herman Miller Eames Aluminum Chair',
    price: 595,
    category: 'Chairs',
    brand: 'Herman Miller',
    description: 'Premium ergonomic chair with full recline and lumbar support',
    attributes: ['ergonomic', 'adjustable'],
    styleTags: ['luxury', 'ergonomic-tech', 'industrial-modern'],
    performanceMetrics: {
      durabilityScore: 98,
      returnRate: 0.8,
      warrantyYears: 12,
      averageRating: 4.9,
    },
    sustainabilityScore: 92,
  },
  {
    name: 'Autonomous ErgoChair Pro',
    price: 399,
    category: 'Chairs',
    brand: 'Autonomous',
    description: 'Balanced ergonomic office chair with breathable mesh',
    attributes: ['ergonomic', 'adjustable'],
    styleTags: ['ergonomic-tech', 'modern'],
    performanceMetrics: {
      durabilityScore: 88,
      returnRate: 2.1,
      warrantyYears: 7,
      averageRating: 4.7,
    },
    sustainabilityScore: 80,
  },
  {
    name: 'IKEA Järvfjället Gaming Chair',
    price: 259,
    category: 'Chairs',
    brand: 'IKEA',
    description: 'Gaming chair adapted for office use with high back',
    attributes: ['adjustable'],
    styleTags: ['budget-friendly', 'modern'],
    performanceMetrics: {
      durabilityScore: 75,
      returnRate: 5.3,
      warrantyYears: 3,
      averageRating: 4.3,
    },
    sustainabilityScore: 65,
  },
  {
    name: 'BenQ PD2500Q Monitor',
    price: 599,
    category: 'Monitors',
    brand: 'BenQ',
    description: '25" QHD professional monitor with USB-C',
    attributes: ['energy_efficient'],
    styleTags: ['modern', 'ergonomic-tech'],
    performanceMetrics: {
      durabilityScore: 91,
      returnRate: 2.1,
      warrantyYears: 5,
      averageRating: 4.8,
    },
    sustainabilityScore: 78,
  },
  {
    name: 'IKEA MÖRBYLÅNGA Monitor Arm',
    price: 89,
    category: 'Accessories',
    brand: 'IKEA',
    description: 'Single monitor clamp stand for desk',
    attributes: ['adjustable'],
    styleTags: ['budget-friendly', 'minimalist'],
    performanceMetrics: {
      durabilityScore: 72,
      returnRate: 4.2,
      warrantyYears: 2,
      averageRating: 4.0,
    },
    sustainabilityScore: 68,
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    price: 99,
    category: 'Accessories',
    brand: 'Logitech',
    description: 'Premium wireless mouse with precision scrolling',
    attributes: ['wireless', 'ergonomic'],
    styleTags: ['ergonomic-tech', 'modern'],
    performanceMetrics: {
      durabilityScore: 89,
      returnRate: 1.5,
      warrantyYears: 3,
      averageRating: 4.7,
    },
    sustainabilityScore: 74,
  },
  {
    name: 'Philips Hue Go Light',
    price: 79,
    category: 'Lighting',
    brand: 'Logitech', // Note: Not a Logitech product, just for variety
    description: 'Portable smart light with 16M colors',
    attributes: ['portable', 'energy_efficient', 'wireless'],
    styleTags: ['modern', 'ergonomic-tech'],
    performanceMetrics: {
      durabilityScore: 86,
      returnRate: 2.8,
      warrantyYears: 2,
      averageRating: 4.6,
    },
    sustainabilityScore: 81,
  },
  {
    name: 'BenQ ScreenBar Monitor Light',
    price: 109,
    category: 'Lighting',
    brand: 'BenQ',
    description: 'USB-powered monitor-mounted reading lamp',
    attributes: ['energy_efficient', 'adjustable'],
    styleTags: ['modern', 'minimalist'],
    performanceMetrics: {
      durabilityScore: 92,
      returnRate: 1.2,
      warrantyYears: 3,
      averageRating: 4.8,
    },
    sustainabilityScore: 85,
  },
]

// ============================================
// SEEDING FUNCTIONS
// ============================================

async function seedAttributes() {
  console.log('🏷️  Seeding attributes...')

  const mutations = ATTRIBUTES.map((attr) => ({
    create: {
      _type: 'attribute',
      name: attr.name,
      slug: { _type: 'slug', current: attr._key },
      type: attr.type,
    },
  }))

  const { results } = await client.transaction(mutations).commit()
  console.log(`Created ${ATTRIBUTES.length} attributes`)
  return results.map((a: any) => a._id)
}

async function seedBrands() {
  console.log('🏢 Seeding brands...')

  const mutations = BRANDS.map((brand) => ({
    create: {
      _type: 'brand',
      name: brand.name,
      slug: { _type: 'slug', current: brand.name.toLowerCase().replace(/ /g, '-') },
      trustScore: brand.trustScore,
      sustainabilityRating: brand.sustainabilityRating,
      website: brand.website,
    },
  }))

  const { results } = await client.transaction(mutations).commit()
  console.log(`Created ${results.length} brands`)
  return results.reduce((map, b, index) => {
    map[BRANDS[index].name] = b.id
    return map
  }, {} as Record<string, string>)
}

async function seedCategories() {
  console.log('Seeding categories...')

  const mutations = CATEGORIES.map((cat) => ({
    create: {
      _type: 'category',
      title: cat.title,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
      icon: cat.icon,
    },
  }))

  const { results } = await client.transaction(mutations).commit()
  console.log(`Created ${results.length} categories`)
  return results.reduce((map, c) => {
    map[c.id] = c.id
    return map
  }, {} as Record<string, string>)
}

async function seedProducts(
  brandMap: Record<string, string>,
  categoryMap: Record<string, string>
) {
  console.log('Seeding products...')

  const mutations = PRODUCTS.map((prod) => ({
    create: {
      _type: 'product',
      name: prod.name,
      slug: { _type: 'slug', current: prod.name.toLowerCase().replace(/ /g, '-') },
      price: prod.price,
      category: { _type: 'reference', _ref: categoryMap[prod.category] },
      brand: { _type: 'reference', _ref: brandMap[prod.brand] },
      description: prod.description,
      styleTags: prod.styleTags,
      performanceMetrics: prod.performanceMetrics,
      sustainabilityScore: prod.sustainabilityScore,
      inStock: true,
    },
  }))

  const { results } = await client.transaction(mutations).commit()
  console.log(`Created ${results.length} products`)
  return results.map((p: any) => p.id)
}

// ============================================
// ADD COMPATIBILITY & RELATIONSHIPS
// ============================================

async function seedRelationships(
  productIds: string[],
  productMap: Map<string, number>
) {
  console.log('Setting up product relationships...')

  // Example relationships (desk + chair compatibility)
  const relationships = [
    { productIndex: 0, compatibleIndexes: [2, 3, 6, 7, 8] }, // Autonomous desk works with chairs
    { productIndex: 1, compatibleIndexes: [3, 4, 6, 7] }, // IKEA desk works with cheaper chair
    { productIndex: 2, compatibleIndexes: [0, 1, 5, 8] }, // Herman Miller Chair works with desks
    { productIndex: 3, compatibleIndexes: [0, 1, 5] }, // Autonomous Chair with desks
    { productIndex: 4, compatibleIndexes: [1, 5, 9] }, // IKEA Chair with IKEA desk
  ]

  const mutations = relationships
    .map(({ productIndex, compatibleIndexes }) => {
      const productId = productIds[productIndex]
      const compatibleRefs = compatibleIndexes
        .filter((idx) => idx < productIds.length)
        .map((idx) => ({ _type: 'reference', _ref: productIds[idx] }))

      return {
        patch: {
          id: productId,
          set: {
            compatibility: compatibleRefs,
          },
        },
      }
    })
    .filter((m) => m)

  if (mutations.length > 0) {
    await client.transaction(mutations).commit()
    console.log(`✅ Set ${mutations.length} compatibility relationships`)
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

export async function seedData() {
  try {
    console.log('🌱 Starting Smart Setup Builder data seed...\n')

    // Seed base data
    await seedAttributes()
    const brandMap = await seedBrands()
    const categoryMap = await seedCategories()
    const productIds = await seedProducts(brandMap, categoryMap)
    await seedRelationships(productIds, new Map())

    console.log('\n✨ Data seeding complete!')
    console.log('\n📊 Summary:')
    console.log(`   - Attributes: ${ATTRIBUTES.length}`)
    console.log(`   - Brands: ${BRANDS.length}`)
    console.log(`   - Categories: ${CATEGORIES.length}`)
    console.log(`   - Products: ${PRODUCTS.length}`)
    console.log('\n👉 Next steps:')
    console.log('   1. Go to your Sanity Studio')
    console.log('   2. Add product images')
    console.log('   3. Configure alternative products')
    console.log('   4. Set required accessories')
    console.log('   5. Test the Smart Setup Builder!')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
}

export default seedData
