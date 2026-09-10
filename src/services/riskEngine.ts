import type { RiskResult, RiskLevel } from '../data/types';

export function evaluateRisk(
  volatility: number,
  congestionIndex: number,
  portCompScore: number,
  idleDays: number
): RiskResult {
  let score = 0;

  // 1. Freight Volatility Risk
  let freightVolatilityRisk: RiskLevel = 'Low';
  if (volatility > 2.0) {
    freightVolatilityRisk = 'High';
    score += 30;
  } else if (volatility > 1.0) {
    freightVolatilityRisk = 'Moderate';
    score += 15;
  }

  // 2. Port Congestion Risk
  let portCongestionRisk: RiskLevel = 'Low';
  if (congestionIndex > 70) {
    portCongestionRisk = 'High';
    score += 35;
  } else if (congestionIndex > 40) {
    portCongestionRisk = 'Moderate';
    score += 15;
  }

  // 3. Compatibility Risk
  let compatibilityRisk: RiskLevel = 'Low';
  if (portCompScore < 50) {
    compatibilityRisk = 'High';
    score += 25;
  } else if (portCompScore < 80) {
    compatibilityRisk = 'Moderate';
    score += 10;
  }

  // 4. Idle Time Risk
  let idleTimeRisk: RiskLevel = 'Low';
  if (idleDays > 7) {
    idleTimeRisk = 'High';
    score += 10;
  } else if (idleDays > 3) {
    idleTimeRisk = 'Moderate';
    score += 5;
  }

  // Overall Risk Mapping
  let overallRisk: RiskLevel = 'Low';
  if (score >= 60) overallRisk = 'High';
  else if (score >= 30) overallRisk = 'Moderate';

  return {
    overallRisk,
    freightVolatilityRisk,
    portCongestionRisk,
    idleTimeRisk,
    compatibilityRisk,
    score
  };
}
