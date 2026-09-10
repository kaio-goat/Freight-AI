import { ROUTES } from './routes';
import type { HistoricalFreight } from './types';

// Synthetic historical data generator to ensure deterministic charts.
// This is generated based on a seed so that it looks like real data but doesn't use Math.random() in production.

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generateDeterministicFreightHistory(
  originId: string, 
  destinationId: string,
  vesselId: string,
  days: number = 30
): HistoricalFreight[] {
  // Use string lengths and char codes to create a deterministic seed
  const seedStr = originId + destinationId;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }
  
  const rng = mulberry32(seed);
  
  // Base rate depends on distance
  const route = ROUTES.find(r => r.originId === originId && r.destinationId === destinationId);
  const routeId = route ? route.id : 'unknown';
  const baseRate = route ? (route.distanceNM / 1000) * 2.5 + 8 : 15.0; // Synthetic base rate calculation
  
  const data: HistoricalFreight[] = [];
  let currentRate = baseRate;
  
  // Generate historical trend
  for (let i = -days; i <= 0; i++) {
    // Add some deterministic volatility
    const volatility = (rng() * 2) - 1; // -1 to 1
    const trend = Math.sin(i / 5) * 0.5; // Slow moving sine wave trend
    
    currentRate += volatility * 0.4 + trend;
    
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
