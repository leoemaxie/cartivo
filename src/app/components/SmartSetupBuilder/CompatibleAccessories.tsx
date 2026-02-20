import React from 'react'
import { Card, CardBody } from '@progress/kendo-react-layout'
import { SanityProduct } from '@/services/sanity/sanityService'
import ProductCard from './ProductCard'

interface CompatibleAccessoriesProps {
  accessories: SanityProduct[]
}

const CompatibleAccessories: React.FC<CompatibleAccessoriesProps> = ({ accessories }) => {
  if (accessories.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-muted-foreground">No compatible accessories found within budget.</p>
        </CardBody>
      </Card>
    )
  }

  const totalAccessoryCost = accessories.reduce((sum, acc) => sum + acc.price, 0)

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">🔧 Compatible Accessories</h3>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-primary">${totalAccessoryCost.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Optional add-ons that enhance your setup
          </p>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessories.map((accessory) => (
          <ProductCard key={accessory._id} product={accessory} />
        ))}
      </div>
    </div>
  )
}

export default CompatibleAccessories
