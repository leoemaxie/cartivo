import { motion } from 'motion/react'
import {
  Chart,
  ChartSeriesItem,
  ChartCategoryAxisItem,
  ChartValueAxisItem,
  ChartLegend,
  ChartTooltip,
} from '@progress/kendo-react-charts'
import { CheckCircle, AlertTriangle, Leaf, Star, Shield, DollarSign } from 'lucide-react'
import { PDFReportResult } from '../../../services/pdf/pdfReportService'

interface BundlePreviewProps {
  result: PDFReportResult
}

const CHART_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#0891b2', '#059669', '#d97706']

const BADGE_STYLES: Record<string, string> = {
  'Most Sustainable': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Top Rated': 'bg-amber-100 text-amber-700 border-amber-200',
  'Budget Pick': 'bg-purple-100 text-purple-700 border-purple-200',
  'Best Value': 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function BundlePreview({ result }: BundlePreviewProps) {
  const { reportData } = result
  const { summary, products, replacements, preferences } = reportData

  // Chart data: price breakdown per product
  const priceData = products.map((p, i) => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
    price: p.price,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Radial data: sustainability & durability
  const radialData = [
    {
      name: 'Sustainability',
      value: summary.avgSustainabilityScore,
      fill: '#059669',
    },
    {
      name: 'Durability',
      value: summary.avgDurabilityScore,
      fill: '#4f46e5',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <DollarSign className="w-4 h-4" />,
            label: 'Total Cost',
            value: `$${summary.totalCost.toFixed(2)}`,
            color: 'indigo',
          },
          {
            icon: <DollarSign className="w-4 h-4" />,
            label: 'Remaining',
            value: `$${summary.remainingBudget.toFixed(2)}`,
            color: 'emerald',
          },
          {
            icon: <Leaf className="w-4 h-4" />,
            label: 'Avg Sustainability',
            value: `${summary.avgSustainabilityScore}/100`,
            color: 'emerald',
          },
          {
            icon: summary.isCompatible ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            ),
            label: 'Compatibility',
            value: summary.isCompatible ? '✓ Compatible' : '⚠ Review',
            color: summary.isCompatible ? 'emerald' : 'amber',
          },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-${card.color}-50 border border-${card.color}-200 rounded-xl p-3`}
          >
            <div className={`flex items-center gap-1.5 text-${card.color}-600 text-xs font-medium mb-1`}>
              {card.icon}
              {card.label}
            </div>
            <p className={`font-bold text-${card.color}-700 text-lg leading-tight`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI reasoning */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">
          🤖 AI Reasoning
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{summary.aiExplanation}</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">💰 Price Breakdown</h4>
          <Chart style={{ height: 180 }}>
            <ChartCategoryAxisItem categories={priceData.map((p) => p.name)} />
            <ChartValueAxisItem />
            <ChartTooltip render={(props: any) => `$${props.value.toFixed(2)}`} />
            <ChartLegend visible={false} />
            <ChartSeriesItem
              type="column"
              data={priceData}
              field="price"
              colorField="fill"
              tooltip={{ visible: true }}
            />
          </Chart>
        </div>

        {/* Scores radial */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">📊 Score Overview</h4>
          <Chart style={{ height: 180 }}>
            <ChartTooltip render={(props: any) => `${props.value}/100`} />
            <ChartLegend visible={true} />
            <ChartSeriesItem
              type="donut"
              data={radialData}
              field="value"
              categoryField="name"
              colorField="fill"
              tooltip={{ visible: true }}
            />
          </Chart>
        </div>
      </div>

      {/* Product cards */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">🛍️ Selected Products</h4>
        <div className="space-y-3">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No img
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 leading-tight">
                    {product.name}
                  </span>
                  {product.badge && (
                    <span
                      className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${
                        BADGE_STYLES[product.badge] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {product.brand} · {product.category}
                </p>
                <p className="text-sm font-bold text-indigo-600 mt-1">${product.price.toFixed(2)}</p>

                <div className="flex gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Leaf className="w-3 h-3 text-emerald-500" />
                    {product.sustainabilityScore}/100
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Shield className="w-3 h-3 text-blue-500" />
                    {product.durabilityScore}/100
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Star className="w-3 h-3 text-amber-500" />
                    {product.averageRating.toFixed(1)}/5
                  </span>
                </div>

                {product.compatibleWith.length > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Compatible with: {product.compatibleWith.slice(0, 2).join(', ')}
                    {product.compatibleWith.length > 2 && ` +${product.compatibleWith.length - 2} more`}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Replacement suggestions */}
      {replacements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">💡 Budget-Saving Alternatives</h4>
          <div className="space-y-2">
            {replacements.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600">
                    Replace <strong>{r.originalProductName}</strong> ($
                    {r.originalPrice.toFixed(2)}) with{' '}
                    <strong>{r.alternativeName}</strong> (${r.alternativePrice.toFixed(2)})
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.reason}</p>
                </div>
                <div className="text-sm font-bold text-emerald-600 flex-shrink-0">
                  -${r.savings.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
