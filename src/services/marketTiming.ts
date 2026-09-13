import type { MarketTimingResult, RecommendationTiming } from '../data/types';
import { ML_SIGNAL } from './bdiService';

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

  let timing: RecommendationTiming = 'MONITOR';
  let expectedReason = '';
  const supportingIndicators: string[] = [];

  // Use V1.5 ML_SIGNAL if available
  if (ML_SIGNAL) {
    const diffPct = ML_SIGNAL.predictedChangePercent;
    
    if (diffPct > 2.0) {
      timing = 'ENTER NOW';
      expectedReason = `V1.5 forecasts a stronger global dry-bulk market next month (+${diffPct.toFixed(1)}%), reducing the benefit of waiting.`;
      supportingIndicators.push(`V1.5 Macro Forecast: +${diffPct.toFixed(1)}% (Next Month)`);
    } else if (diffPct < -2.0) {
      timing = 'WAIT';
      expectedReason = `V1.5 forecasts softer global dry-bulk conditions next month (${diffPct.toFixed(1)}%), supporting a wait strategy.`;
      supportingIndicators.push(`V1.5 Macro Forecast: ${diffPct.toFixed(1)}% (Next Month)`);
    } else {
      timing = 'MONITOR';
      expectedReason = `V1.5 forecasts stable global dry-bulk conditions (variance < 2%). Await clearer macro signals.`;
      supportingIndicators.push(`V1.5 Macro Forecast: ${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}% (Next Month)`);
    }
  } else {
    // Fallback: deterministic logic based on synthetic route forecast
    const diffPct = ((forecast7d - currentRate) / currentRate) * 100;

    if (diffPct > 2.0) {
      timing = 'ENTER NOW';
      expectedReason = `Current freight rates are lower than the near-term forecast. Entering now avoids the projected +${diffPct.toFixed(1)}% rate increase.`;
      supportingIndicators.push(`Deterministic 7-day movement: +${diffPct.toFixed(1)}%`);
    } else if (diffPct < -2.0) {
      timing = 'WAIT';
      expectedReason = `Freight rates are trending downward by ${Math.abs(diffPct).toFixed(1)}%. Delaying procurement may secure a more favorable rate.`;
      supportingIndicators.push(`Deterministic 7-day movement: ${diffPct.toFixed(1)}%`);
    } else {
      timing = 'MONITOR';
      expectedReason = `Rates are relatively stable (variance < 2%). Await clearer market signals before committing to a charter.`;
      supportingIndicators.push(`Deterministic 7-day movement: ${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%`);
    }
    supportingIndicators.push("Fallback: V1.5 ML signal unavailable.");
  }

  // Adjust for high volatility
  if (volatility > 1.5 && timing === 'ENTER NOW') {
    timing = 'MONITOR';
    expectedReason = 'High market volatility makes immediate entry risky despite upward macro trend.';
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
  
  const actualDiffPct = ML_SIGNAL ? ML_SIGNAL.predictedChangePercent : ((forecast7d - currentRate) / currentRate) * 100;
  if (Math.abs(actualDiffPct) < 1.0) confidence -= 10;

  return {
    timing,
    confidence: Math.max(50, Math.min(95, confidence)),
    expectedReason,
    supportingIndicators
  };
}
