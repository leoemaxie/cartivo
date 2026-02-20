import React from 'react'
import { Card, CardBody } from '@progress/kendo-react-layout'
import { ReplacementSuggestion } from '../../../services/setupBuilder'

interface ReplacementSuggestionsProps {
  suggestions: ReplacementSuggestion[]
}

const ReplacementSuggestions: React.FC<ReplacementSuggestionsProps> = ({ suggestions }) => {
  if (suggestions.length === 0) return null

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardBody>
        <h3 className="font-bold text-lg mb-4">💰 Save Money</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => (
            <div key={idx} className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{suggestion.productName}</p>
                  <p className="text-xs text-muted-foreground">→ {suggestion.alternativeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    Save ${suggestion.savings.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${suggestion.currentPrice.toFixed(2)} → $
                    {suggestion.alternativePrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

export default ReplacementSuggestions
