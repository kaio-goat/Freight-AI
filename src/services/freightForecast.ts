import type { FreightForecastResult, HistoricalFreight } from '../data/types';
import { generateDeterministicFreightHistory } from '../data/freightHistory';

const VESSEL_RATE_MULTIPLIERS: Record<string, number> = {
  capesize: 0.85,
  panamax: 1.00,
  supramax: 1.10,
  handysize: 1.25
};

export function calculateFreightForecast(
  originId: string,
  destinationId: string,
  vesselId: string,
  _cargoType: string
): FreightForecastResult {
  // 1. Fetch deterministic synthetic historical data
  const rawHistory: HistoricalFreight[] = generateDeterministicFreightHistory(originId, destinationId, vesselId, 30);
  
  // Transform domain model to chart-friendly format, applying vessel multiplier
  // Note: These coefficients represent prototype calibration assumptions reflecting relative economies of scale.
  const multiplier = VESSEL_RATE_MULTIPLIERS[vesselId.toLowerCase()] || 1.0;
  
  const history = rawHistory.map((h, i) => ({
    day: i - rawHistory.length + 1, // e.g., -29 to 0
    rate: Number((h.ratePerTonne * multiplier).toFixed(2))
  }));

  const currentRate = history[history.length - 1].rate;
  
  // 2. Calculate Recent Average & Trend
  const last7Days = history.slice(-7).map(d => d.rate);
  const avg7Days = last7Days.reduce((a, b) => a + b, 0) / 7;
  const trendVal = currentRate - avg7Days;
  
  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (trendVal > (0.5 * multiplier)) trend = 'UP';
  else if (trendVal < (-0.5 * multiplier)) trend = 'DOWN';

  // 3. Volatility Calculation (Standard Deviation of last 14 days)
  const last14Days = history.slice(-14).map(d => d.rate);
  const avg14Days = last14Days.reduce((a, b) => a + b, 0) / 14;
  const variance = last14Days.reduce((a, b) => a + Math.pow(b - avg14Days, 2), 0) / 14;
  const volatility = Math.sqrt(variance);

  // 4. Forecast Generation (Deterministic)
  const forecastData = [];
  let baseRunning = currentRate;
  
  // Use recent trend as momentum instead of arbitrary string logic
  const momentum = trendVal * 0.08;

  for (let i = 1; i <= 30; i++) {
    // Mean reversion + momentum
    const meanReversion = (avg14Days - baseRunning) * 0.05;
    baseRunning += meanReversion + momentum;
    
    // Widen confidence interval over time
    const interval = (volatility * 1.5) + (i * 0.05 * multiplier);

    forecastData.push({
      day: i,
      low: Number((baseRunning - interval).toFixed(2)),
      base: Number(baseRunning.toFixed(2)),
      high: Number((baseRunning + interval).toFixed(2))
    });
  }

  const forecast7d = forecastData[6].base;
  const forecast30d = forecastData[29].base;
  const finalDay = forecastData[29];

  // Confidence is inversely related to volatility relative to rate
  const relativeVolatility = (volatility / currentRate) * 100;
  const confidence = Math.max(40, Math.min(95, Math.round(95 - (relativeVolatility * 2))));

  return {
    currentRate,
    forecast7d,
    forecast30d,
    low: finalDay.low,
    base: finalDay.base,
    high: finalDay.high,
    confidence,
    trend,
    volatility,
    historicalData: history,
    forecastData
  };
}
