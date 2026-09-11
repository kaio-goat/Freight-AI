import type { VesselClass, PortData, PortCompatibilityResult } from '../data/types';

export function checkPortCompatibility(vessel: VesselClass, port: PortData): PortCompatibilityResult {
  const checks: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Constraint: Draft Check
  if (port.maxDraft === undefined) {
    checks.push(`Draft infrastructure data unavailable. Proceeding with caution.`);
  } else if (vessel.typicalDraft > port.maxDraft) {
    warnings.push(`Vessel draft (${vessel.typicalDraft}m) exceeds the port's maximum permitted draft (${port.maxDraft}m).`);
    return { score: 0, status: 'INCOMPATIBLE', checks, warnings };
  } else if (vessel.typicalDraft > port.maxDraft - 1) {
    warnings.push(`Vessel draft (${vessel.typicalDraft}m) is close to port max draft (${port.maxDraft}m). Tide dependent.`);
    score -= 20;
    checks.push(`Draft margin tight but acceptable.`);
  } else {
    checks.push(`Draft compatible (${vessel.typicalDraft}m < ${port.maxDraft}m).`);
  }

  // Constraint: LOA Check
  if (port.maxLOA === undefined) {
    checks.push(`LOA infrastructure data unavailable. Proceeding with caution.`);
  } else if (vessel.typicalLOA > port.maxLOA) {
    warnings.push(`Vessel LOA (${vessel.typicalLOA}m) exceeds the port's maximum vessel length (${port.maxLOA}m).`);
    return { score: 0, status: 'INCOMPATIBLE', checks, warnings };
  } else {
    checks.push(`LOA compatible (${vessel.typicalLOA}m < ${port.maxLOA}m).`);
  }

  // Anchorage / Terminal Check
  if (port.type === 'ANCHORAGE' && port.requiresLighterage) {
    checks.push(`Port is an anchorage. Lighterage operations required.`);
  }

  // Congestion Check
  if (port.congestionIndex === undefined) {
    checks.push(`Congestion data unavailable.`);
  } else if (port.congestionIndex > 70) {
    warnings.push(`Severe port congestion detected (Index: ${port.congestionIndex}/100).`);
    score -= 15;
  } else if (port.congestionIndex > 40) {
    warnings.push(`Moderate port congestion expected.`);
    score -= 5;
  } else {
    checks.push(`Low congestion expected.`);
  }

  // Infrastructure Check
  if (port.shoreCargoHandling === false) {
    warnings.push(`No shore-based cargo handling facilities. Requires geared vessels or floating cranes.`);
    score -= 10; // Penalty unless vessel is geared, but simplified here
  } else if (port.cargoHandlingScore === undefined) {
    checks.push(`Cargo handling score unavailable.`);
  } else if (port.cargoHandlingScore < 60) {
    warnings.push(`Sub-optimal cargo handling infrastructure.`);
    score -= 10;
  } else {
    checks.push(`Good cargo handling infrastructure.`);
  }

  // Ensure score is bounded
  score = Math.max(0, Math.min(100, score));

  let status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE' = 'COMPATIBLE';
  if (score < 40) status = 'INCOMPATIBLE';
  else if (score < 80) status = 'WARNING';

  return {
    score,
    status,
    checks,
    warnings
  };
}
