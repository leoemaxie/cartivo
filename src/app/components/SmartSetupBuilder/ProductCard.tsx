import React from 'react'
import { Card, CardBody } from '@progress/kendo-react-layout'
import { SanityProduct } from '@/services/sanity/sanityService'

interface ProductCardProps {
  product: SanityProduct
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
          ${product.price.toFixed(2)}
        </div>
      </div>

      <CardBody className="space-y-3">
        {/* Product Name */}
        <div>
          <h4 className="font-bold text-lg line-clamp-2">{product.name}</h4>
          <p className="text-sm text-muted-foreground">{product.brand.name}</p>
        </div>

        {/* Category & Brand Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
            {product.category.title}
          </span>
          <span className="text-xs text-muted-foreground">
            Trust: {product.brand.trustScore}/100
          </span>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Durability</p>
            <p className="font-semibold">
              {product.performanceMetrics?.durabilityScore || 0}/100
            </p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="font-semibold">
              {product.performanceMetrics?.averageRating?.toFixed(1) || 0}/5 ⭐
            </p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Sustainability</p>
            <p className="font-semibold">{product.sustainabilityScore}/100</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Warranty</p>
            <p className="font-semibold">{product.performanceMetrics?.warrantyYears || 0}y</p>
          </div>
        </div>

        {/* Style Tags */}
        {product.styleTags && product.styleTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.styleTags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}

        {/* Compatibility Count */}
        {product.compatibility && product.compatibility.length > 0 && (
          <div className="text-sm text-green-600 font-medium">
            ✓ Compatible with {product.compatibility.length} items
          </div>
        )}

        {/* Required Accessories */}
        {product.requiredAccessories && product.requiredAccessories.length > 0 && (
          <div className="text-sm text-amber-600">
            ⚠ Requires {product.requiredAccessories.length} accessories
            <p className="text-xs text-muted-foreground mt-1">
              Cost: ${product.requiredAccessories.reduce((sum, a) => sum + a.price, 0).toFixed(2)}
            </p>
          </div>
        )}

        {/* Call to Action */}
        {product.externalUrl && (
          <a
            href={product.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm font-medium w-full text-center py-2 bg-primary/10 rounded"
          >
            View Product →
          </a>
        )}
      </CardBody>
    </Card>
  )
}

export default ProductCard
