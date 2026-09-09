export type CargoType = 'Coking Coal' | 'Thermal Coal' | 'Iron Ore' | 'Limestone' | 'Other Bulk Cargo';
export type ContractDuration = 'Spot' | '1 month' | '3 months' | '6 months' | '12 months';
export type RiskLevel = 'Low' | 'Moderate' | 'High';
export type RecommendationTiming = 'ENTER NOW' | 'WAIT' | 'MONITOR';

export interface VoyageScenario {
  id: string;
  createdAt: string;
  cargo: CargoType;
  quantity: number;
  origin: string;
  destination: string;
  contract: ContractDuration;
  forecastRate: number;
  recommendedVessel: string;
  recommendationScore: number;
  marketTiming: RecommendationTiming;
  congestionRisk: RiskLevel;
  estimatedVoyageCost: number;
  portCompatibility: number;
  confidence: number;
}

export const DEMO_SCENARIOS: VoyageScenario[] = [
  {
    id: 'sc-1001',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    cargo: 'Coking Coal',
    quantity: 70000,
    origin: 'Australia',
    destination: 'Paradip',
    contract: 'Spot',
    forecastRate: 14.50,
    recommendedVessel: 'Panamax',
    recommendationScore: 94,
    marketTiming: 'WAIT',
    congestionRisk: 'Low',
    estimatedVoyageCost: 1.015,
    portCompatibility: 92,
    confidence: 87
  },
  {
    id: 'sc-1002',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    cargo: 'Coking Coal',
    quantity: 55000,
    origin: 'Mozambique',
    destination: 'Visakhapatnam',
    contract: '1 month',
    forecastRate: 18.20,
    recommendedVessel: 'Supramax',
    recommendationScore: 88,
    marketTiming: 'ENTER NOW',
    congestionRisk: 'Moderate',
    estimatedVoyageCost: 1.001,
    portCompatibility: 94,
    confidence: 81
  },
  {
    id: 'sc-1003',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cargo: 'Iron Ore',
    quantity: 120000,
    origin: 'Australia',
    destination: 'Paradip',
    contract: '3 months',
    forecastRate: 11.80,
    recommendedVessel: 'Capesize',
    recommendationScore: 76,
    marketTiming: 'MONITOR',
    congestionRisk: 'Moderate',
    estimatedVoyageCost: 1.416,
    portCompatibility: 71,
    confidence: 65
  }
];

export const VESSELS = [
  { class: 'Handysize', capacity: '15,000 - 35,000 MT', score: 61, draft: 10.5, flexibility: 'High' },
  { class: 'Supramax', capacity: '50,000 - 60,000 MT', score: 88, draft: 11.5, flexibility: 'High' },
  { class: 'Panamax', capacity: '65,000 - 80,000 MT', score: 94, draft: 13.5, flexibility: 'Moderate' },
  { class: 'Capesize', capacity: '110,000+ MT', score: 76, draft: 18.0, flexibility: 'Low' },
];

export const ROUTES = [
  { origin: 'Australia', destination: 'Paradip', distance: '5,500 nm', days: 18, risk: 'Low' },
  { origin: 'Mozambique', destination: 'Visakhapatnam', distance: '3,800 nm', days: 12, risk: 'Moderate' },
  { origin: 'Indonesia', destination: 'Gangavaram', distance: '2,200 nm', days: 8, risk: 'Low' },
  { origin: 'Russia', destination: 'Haldia', distance: '6,100 nm', days: 22, risk: 'High' },
  { origin: 'USA', destination: 'Dhamra', distance: '9,500 nm', days: 32, risk: 'Moderate' }
];
