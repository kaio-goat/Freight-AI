import type { DecisionEngineResult, CargoType } from '../data/types';
import { PORTS } from '../data/ports';
import { checkPortCompatibility } from './portCompatibility';
import { recommendVessel } from './vesselRecommendation';
import { calculateFreightForecast } from './freightForecast';
import { determineMarketTiming } from './marketTiming';
import { estimateIdleAndRepositioning } from './idleRepositioning';
import { evaluateRisk } from './riskEngine';
import { VESSEL_CLASSES } from '../data/vessels';

export function runDecisionEngine(
  originId: string,
  destinationId: string,
  cargo: CargoType,
  quantity: number
): DecisionEngineResult {
  const summaryReasoning: string[] = [];

  const originPort = PORTS.find(p => p.id === originId);
  const destPort = PORTS.find(p => p.id === destinationId);

  // 1. Recommend Vessel
  const vesselRec = recommendVessel(cargo, quantity, originPort, destPort);
  const bestVesselClass = VESSEL_CLASSES.find(v => v.id === vesselRec.recommendedVessel.toLowerCase()) || 
                          VESSEL_CLASSES.find(v => v.id === 'panamax') || 
                          VESSEL_CLASSES[0]; // safe fallback

  // 2. Port Compatibility for the recommended vessel
  const originComp = originPort ? checkPortCompatibility(bestVesselClass, originPort) : { score: 100, status: 'COMPATIBLE' as const, checks: [], warnings: [] };
  const destComp = destPort ? checkPortCompatibility(bestVesselClass, destPort) : { score: 100, status: 'COMPATIBLE' as const, checks: [], warnings: [] };
  const combinedPortScore = (originComp.score + destComp.score) / 2;

  // 3. Freight Forecast
  const forecast = calculateFreightForecast(originId, destinationId, bestVesselClass.id, cargo);

  // 4. Idle & Repositioning
  const maxCongestion = Math.max(originPort?.congestionIndex || 0, destPort?.congestionIndex || 0);
  const idle = estimateIdleAndRepositioning(originId, destinationId, bestVesselClass, maxCongestion);

  // 5. Market Timing
  const timing = determineMarketTiming(forecast.currentRate, forecast.forecast7d, forecast.volatility, maxCongestion);

  // 6. Risk Engine
  const risk = evaluateRisk(forecast.volatility, maxCongestion, combinedPortScore, idle.estimatedIdleDays);

  // 7. Overall Decision Score (0 - 100)
  // Heavily weighted towards port compatibility, vessel score, and risk
  const vesselScore = vesselRec.ranking[0]?.overallScore || 50;
  
  let overallDecisionScore = 
    (vesselScore * 0.3) +
    (combinedPortScore * 0.4) +
    ((100 - risk.score) * 0.3);

  // Penalty if timing is wait
  if (timing.timing === 'WAIT') overallDecisionScore -= 5;

  overallDecisionScore = Math.max(0, Math.min(100, Math.round(overallDecisionScore)));

  // Generate Summary
  if (vesselScore > 85) summaryReasoning.push(`Strong cargo fit and cost efficiency for ${bestVesselClass.name}.`);
  if (combinedPortScore > 85) summaryReasoning.push(`Excellent port infrastructure compatibility.`);
  else if (combinedPortScore < 60) summaryReasoning.push(`Warning: Port compatibility issues detected.`);
  
  if (risk.overallRisk === 'Low') summaryReasoning.push(`Low overall operational and market risk.`);
  else summaryReasoning.push(`Moderate/High risk (${risk.freightVolatilityRisk} volatility, ${risk.portCongestionRisk} congestion).`);

  return {
    forecast,
    vessel: vesselRec,
    port: {
      origin: originComp,
      destination: destComp,
      combinedScore: combinedPortScore
    },
    timing,
    risk,
    idle,
    overallDecisionScore,
    summaryReasoning
  };
}
