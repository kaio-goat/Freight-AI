import type { MarketTimingResult, RecommendationTiming } from '../data/types';

export function determineMarketTiming(
  currentRate: number,
  forecast7d: number,
  volatility: number,
  congestionIndex: number
): MarketTimingResult {
  if (currentRate === 0) {
    return {
      timing: 'MONITOR',
      confidence: 50,
      expectedReason: 'Insufficient market data to determine timing.',
      supportingIndicators: ['Current rate is zero.']
    };
  }

  const diffPct = ((forecast7d - currentRate) / currentRate) * 100;
  
  let timing: RecommendationTiming = 'MONITOR';
  let expectedReason = '';
  const supportingIndicators: string[] = [];

  // Logic: 
  // If rates are forecasted to drop significantly, WAIT.
  // If rates are forecasted to rise significantly, ENTER NOW.
  // Otherwise, MONITOR.

  if (diffPct > 2.0) {
    timing = 'ENTER NOW';
    expectedReason = `Current freight rates are lower than the near-term forecast. Entering now avoids the projected +${diffPct.toFixed(1)}% rate increase.`;
    supportingIndicators.push(`Forecasted 7-day movement: +${diffPct.toFixed(1)}%`);
  } else if (diffPct < -2.0) {
    timing = 'WAIT';
    expectedReason = `Freight rates are trending downward by ${Math.abs(diffPct).toFixed(1)}%. Delaying procurement may secure a more favorable rate.`;
    supportingIndicators.push(`Forecasted 7-day movement: ${diffPct.toFixed(1)}%`);
  } else {
    timing = 'MONITOR';
    expectedReason = `Rates are relatively stable (variance < 2%). Await clearer market signals before committing to a charter.`;
    supportingIndicators.push(`Forecasted 7-day movement: ${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%`);
  }

  // Adjust for high volatility
  if (volatility > 1.5 && timing === 'ENTER NOW') {
    timing = 'MONITOR';
    expectedReason = 'High market volatility makes immediate entry risky despite upward trend.';
    supportingIndicators.push('High volatility detected.');
  }

  // Adjust for severe congestion
  if (congestionIndex > 70 && timing === 'ENTER NOW') {
    timing = 'WAIT';
    expectedReason = 'Severe port congestion suggests waiting to avoid demurrage costs.';
    supportingIndicators.push('Destination port congestion is critically high.');
  }

  let confidence = 85;
  if (volatility > 1.5) confidence -= 20;
  if (Math.abs(diffPct) < 1.0) confidence -= 10;

  return {
    timing,
    confidence: Math.max(50, Math.min(95, confidence)),
    expectedReason,
    supportingIndicators
  };
}
