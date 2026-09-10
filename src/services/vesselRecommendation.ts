import type { PortData, VesselScore, VesselRecommendationResult, CargoType } from '../data/types';
import { VESSEL_CLASSES } from '../data/vessels';
import { checkPortCompatibility } from './portCompatibility';

export function recommendVessel(
  cargo: CargoType,
  quantity: number,
  originPort: PortData | undefined,
  destinationPort: PortData | undefined
): VesselRecommendationResult {
  // Fix P0-6: Division by zero guard
  const safeQuantity = quantity > 0 ? quantity : 1;
  const scores: VesselScore[] = [];

  for (const vessel of VESSEL_CLASSES) {
    // 1. Cargo Fit (30%)
    let cargoFitScore = 0;
    const supportsCargo = vessel.supportedCargos.includes(cargo);
    
    if (!supportsCargo) {
      cargoFitScore = 0;
    } else {
      // Calculate how well the quantity matches the vessel capacity
      if (safeQuantity >= vessel.minCapacity && safeQuantity <= vessel.maxCapacity) {
        cargoFitScore = 100; // Perfect fit
      } else if (safeQuantity < vessel.minCapacity) {
        // Vessel is too large, you are paying for dead freight
        const ratio = safeQuantity / vessel.minCapacity;
        cargoFitScore = Math.max(0, ratio * 70); 
      } else {
        // Vessel is too small, requires multiple voyages
        const ratio = vessel.maxCapacity / safeQuantity;
        cargoFitScore = Math.max(0, ratio * 60);
      }
    }

    // 2. Port Compatibility (25%)
    let portCompatibilityScore = 40; // Default conservative low score for unresolved ports
    let originComp = null;
    let destComp = null;
    let physicallyIncompatible = false;

    if (originPort && destinationPort) {
      originComp = checkPortCompatibility(vessel, originPort);
      destComp = checkPortCompatibility(vessel, destinationPort);
      portCompatibilityScore = (originComp.score + destComp.score) / 2;
      
      // HARD PHYSICAL CONSTRAINT
      if (originComp.status === 'INCOMPATIBLE' || destComp.status === 'INCOMPATIBLE') {
        physicallyIncompatible = true;
        portCompatibilityScore = 0;
      }
    }

    // 3. Cost Efficiency (20%)
    let costEfficiencyScore = 100 - ((vessel.costIndex - 0.8) * 100);
    if (cargoFitScore < 80) {
      costEfficiencyScore *= (cargoFitScore / 100);
    }

    // 4. Risk (15%)
    let riskScore = 100; // 100 means NO risk (good)
    if (vessel.id === 'capesize') riskScore = 70;
    if (vessel.id === 'panamax') riskScore = 85;

    // 5. Flexibility (10%)
    const flexibilityScore = vessel.flexibilityScore;

    // Clamp all individual scores
    cargoFitScore = Math.max(0, Math.min(100, cargoFitScore));
    portCompatibilityScore = Math.max(0, Math.min(100, portCompatibilityScore));
    costEfficiencyScore = Math.max(0, Math.min(100, costEfficiencyScore));
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Calculate Overall Score
    let overallScore = 
      (cargoFitScore * 0.30) + 
      (portCompatibilityScore * 0.25) + 
      (costEfficiencyScore * 0.20) + 
      (riskScore * 0.15) + 
      (flexibilityScore * 0.10);
      
    // Enforce 0 score if physically incompatible
    if (physicallyIncompatible) {
      overallScore = 0;
    } else {
      overallScore = Math.max(0, Math.min(100, overallScore));
    }

    scores.push({
      vesselId: vessel.name,
      overallScore: Math.round(overallScore),
      cargoFit: Math.round(cargoFitScore),
      portCompatibility: Math.round(portCompatibilityScore),
      costEfficiency: Math.round(costEfficiencyScore),
      risk: Math.round(riskScore),
      flexibility: Math.round(flexibilityScore)
    });
  }

  // Sort descending by overall score
  scores.sort((a, b) => b.overallScore - a.overallScore);
  const bestVessel = scores[0];
  
  const explanation: string[] = [];
  
  if (bestVessel.overallScore === 0) {
    explanation.push(`No recommended vessel. The physical constraints of the ports (Draft/LOA) prohibit all evaluated vessel classes from operating this route safely.`);
  } else {
    // Explanation: Cargo Fit
    if (bestVessel.cargoFit === 100) {
      explanation.push(`Cargo quantity (${quantity.toLocaleString()} MT) perfectly matches the optimal capacity range of a ${bestVessel.vesselId}.`);
    } else if (bestVessel.cargoFit >= 70) {
      explanation.push(`Cargo quantity is acceptable for a ${bestVessel.vesselId}, maintaining cost-effectiveness.`);
    } else {
      explanation.push(`Warning: Cargo quantity forces sub-optimal utilization (dead freight or multiple voyages) on a ${bestVessel.vesselId}.`);
    }

    // Explanation: Port Compatibility
    if (bestVessel.portCompatibility === 100) {
      explanation.push(`Physical dimensions (Draft, LOA) are fully compatible with both the origin and destination ports.`);
    } else if (bestVessel.portCompatibility > 0) {
      explanation.push(`Port compatibility is acceptable, but operational constraints (draft margins, handling) exist.`);
    } else {
      explanation.push(`Fatal Error: Vessel exceeds hard physical constraints at port.`);
    }

    // Explanation: Cost Efficiency
    if (bestVessel.costEfficiency > 85) {
      explanation.push(`Offers highly favorable economies of scale for this route length.`);
    }

    // Explanation: Risk
    if (bestVessel.risk > 90) {
      explanation.push(`Low operational risk profile for this class.`);
    }
  }

  return {
    recommendedVessel: bestVessel.vesselId,
    ranking: scores,
    explanation
  };
}
