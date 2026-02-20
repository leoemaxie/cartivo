import React from 'react'
import { SmartSetupBuilder } from '@/app/components/SmartSetupBuilder'
import { SetupBuilderResult } from '@/services/setupBuilder'

/**
 * Smart Setup Builder Demo Page
 * 
 * This page demonstrates the Smart Setup Builder feature.
 * Users can build a complete home office setup with:
 * - Budget constraints
 * - Category selection
 * - Style preferences
 * - Sustainability scoring
 * - Compatibility checking
 */

export default function SmartSetupPage() {
  const handleSetupBuilt = (result: SetupBuilderResult) => {
    console.log('Setup built:', result)

    // Track event for analytics
    if (window.gtag) {
      window.gtag('event', 'setup_generated', {
        product_count: result.products.length,
        total_cost: result.totalCost,
        budget: result.totalCost + result.remainingBudget,
        is_compatible: result.isCompactible,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SmartSetupBuilder onSetupBuilt={handleSetupBuilt} />
    </div>
  )
}
