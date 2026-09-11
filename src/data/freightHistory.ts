import { getOrCalculateRoute } from './routes';
import type { HistoricalFreight } from './types';
import { BDI_FEATURES } from '../services/bdiService';

// Deterministic historical data generator based strictly on distances and reference data.
export function generateDeterministicFreightHistory(
  originId: string, 
  destinationId: string,
  vesselId: string,
  days: number = 30
): HistoricalFreight[] {
  const route = getOrCalculateRoute(originId, destinationId);
  const routeId = route.id;
  
  // Base rate depends strictly on distance (e.g. bunker cost estimate)
  // Distance / 1000 * constant rate + port fees
  let baseRate = (route.distanceNM / 1000) * 2.5 + 8;
  
  // Modulate based on the GLOBAL BDI signal
  // Normalizing against a reference BDI of ~1500 points
  if (BDI_FEATURES && BDI_FEATURES.currentBdi) {
    const bdiFactor = Math.max(0.3, BDI_FEATURES.currentBdi / 1500);
    baseRate = baseRate * bdiFactor;
  }
  
  const data: HistoricalFreight[] = [];
  
  // Create a flat/slightly sloped linear deterministic history (no random, no sine waves)
  // We use distance modulo as a deterministic slope offset so routes look slightly different.
  const routeSlope = (route.distanceNM % 5) * 0.05 - 0.1; 
  
  for (let i = -days; i <= 0; i++) {
    // Linear trend to baseRate
    let currentRate = baseRate + (i * routeSlope);
    
    // Ensure rate doesn't go below an unrealistic floor
    if (currentRate < 4) currentRate = 4;
    
    const d = new Date();
    d.setDate(d.getDate() + i);
    
    data.push({
      date: d.toISOString().split('T')[0],
      routeId,
      vesselId,
      ratePerTonne: Number(currentRate.toFixed(2))
    });
  }
  
  return data;
}
