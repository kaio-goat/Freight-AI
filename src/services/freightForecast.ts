import type { FreightForecastResult, HistoricalFreight } from '../data/types';
import { generateDeterministicFreightHistory } from '../data/freightHistory';
import { getRoute } from '../data/routes';

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
  const isSupported = !!getRoute(originId, destinationId);
  const dataCoverage = isSupported ? 'supported' : 'exploratory';

  // 1. Fetch deterministic historical data (derived from distance)
  const rawHistory: HistoricalFreight[] = generateDeterministicFreightHistory(originId, destinationId, vesselId, 30);
  
  const multiplier = VESSEL_RATE_MULTIPLIERS[vesselId.toLowerCase()] || 1.0;
  
  const history = rawHistory.map((h, i) => ({
    day: i - rawHistory.length + 1,
    rate: Number((h.ratePerTonne * multiplier).toFixed(2))
  }));

  const currentRate = history[history.length - 1].rate;
  
  // 2. Calculate Recent Average & Trend
  const last7Days = history.slice(-7).map(d => d.rate);
  const avg7Days = last7Days.reduce((a, b) => a + b, 0) / 7;
  const trendVal = currentRate - avg7Days;
  
  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (trendVal > (0.1 * multiplier)) trend = 'UP';
  else if (trendVal < (-0.1 * multiplier)) trend = 'DOWN';

  // Fixed volatility factor depending on data coverage
  const volatility = isSupported ? 1.5 : 2.5;

  // 4. Forecast Generation (Deterministic Linear Projection)
  const forecastData = [];
  let baseRunning = currentRate;
  
  // Extrapolate slope
  const slope = trendVal / 7;

  for (let i = 1; i <= 30; i++) {
    baseRunning += slope;
    
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

  const relativeVolatility = (volatility / currentRate) * 100;
  // Lower confidence for exploratory routes
  const baseConfidence = isSupported ? 85 : 55;
  const confidence = Math.max(40, Math.min(95, Math.round(baseConfidence - (relativeVolatility * 2))));

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
    dataCoverage,
    historicalData: history,
    forecastData
  };
}
