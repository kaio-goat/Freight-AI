import type { IdleRepositioningResult, RiskLevel, VesselClass } from '../data/types';
import { getRoute } from '../data/routes';

export function estimateIdleAndRepositioning(
  originId: string,
  destinationId: string,
  vessel: VesselClass,
  congestionIndex: number
): IdleRepositioningResult {
  const route = getRoute(originId, destinationId);
  
  // Base repositioning based on distance (assuming ballast voyage is roughly similar to laden voyage distance)
  // Distance / Speed / 24 = Days
  const distanceNM = route?.distanceNM || 4000; // Fallback distance if unknown
  const speed = vessel.typicalSpeed || 14;
  const transitDays = distanceNM / speed / 24;
  
  // Assume a fraction of transit is repositioning (e.g. 15% ballast factor)
  const ballastFactor = 0.15;
  const baseIdle = Math.max(1, transitDays * ballastFactor);
  
  // High congestion means vessel waits longer to discharge
  const congestionDelay = congestionIndex > 60 ? 3 : congestionIndex > 30 ? 1 : 0;
  
  // Lower flexibility means harder to find next cargo, more idle days
  const flexibilityPenalty = vessel.flexibilityScore < 50 ? 2 : 0;

  const estimatedIdleDays = Math.round(baseIdle + congestionDelay + flexibilityPenalty);

  let repositioningRisk: RiskLevel = 'Low';
  if (estimatedIdleDays > 7) repositioningRisk = 'High';
  else if (estimatedIdleDays > 4) repositioningRisk = 'Moderate';

  // Financial impact proxy 0-100
  const idleCostIndex = Math.min(100, estimatedIdleDays * 12);

  return {
    estimatedIdleDays,
    repositioningRisk,
    idleCostIndex
  };
}
