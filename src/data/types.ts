export type CargoType = 'Coking Coal' | 'Thermal Coal' | 'Iron Ore' | 'Limestone' | 'Other Bulk Cargo';
export type ContractDuration = 'Spot' | '1 month' | '3 months' | '6 months' | '12 months';
export type RiskLevel = 'Low' | 'Moderate' | 'High';
export type RecommendationTiming = 'ENTER NOW' | 'WAIT' | 'MONITOR';

export interface VesselClass {
  id: string;
  name: string;
  minCapacity: number;
  maxCapacity: number;
  typicalDraft: number; // meters
  typicalLOA: number; // meters
  typicalSpeed: number; // knots
  costIndex: number; // relative multiplier for cost efficiency
  flexibilityScore: number; // 0-100
  supportedCargos: CargoType[];
}

export interface PortData {
  id: string;
  name: string;
  country: string;
  region: string;
  maxDraft: number; // meters
  maxLOA: number; // meters
  cargoHandlingScore: number; // 0-100
  supportedCargos: CargoType[];
  congestionIndex: number; // 0-100 (higher means more congested)
  infrastructureScore: number; // 0-100
  sourceType: 'REAL' | 'SYNTHETIC' | 'REFERENCE';
  type?: 'PORT' | 'ANCHORAGE' | 'TERMINAL';
  requiresLighterage?: boolean;
  shoreCargoHandling?: boolean;
  coordinates?: [number, number]; // [latitude, longitude]
}

export interface RouteData {
  id: string;
  originId: string;
  originName: string;
  originRegion: string; // Used to store the country/region metadata
  destinationId: string;
  destinationName: string;
  destinationRegion: string;
  distanceNM: number;
  typicalDays: number;
  baseRisk: RiskLevel;
  sourceType: 'REAL' | 'SYNTHETIC' | 'REFERENCE';
}

export interface HistoricalFreight {
  date: string;
  routeId: string;
  vesselId: string;
  ratePerTonne: number;
}

export interface PortCompatibilityResult {
  score: number;
  status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE';
  checks: string[];
  warnings: string[];
}

export interface VesselScore {
  vesselId: string;
  overallScore: number;
  cargoFit: number;
  portCompatibility: number;
  costEfficiency: number;
  risk: number;
  flexibility: number;
}

export interface VesselRecommendationResult {
  recommendedVessel: string;
  ranking: VesselScore[];
  explanation: string[];
}

export interface FreightForecastResult {
  currentRate: number;
  forecast7d: number;
  forecast30d: number;
  low: number;
  base: number;
  high: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  volatility: number;
  historicalData: { day: number, rate: number }[];
  forecastData: { day: number, low: number, base: number, high: number }[];
}

export interface MarketTimingResult {
  timing: RecommendationTiming;
  confidence: number;
  expectedReason: string;
  supportingIndicators: string[];
}

export interface RiskResult {
  overallRisk: RiskLevel;
  freightVolatilityRisk: RiskLevel;
  portCongestionRisk: RiskLevel;
  idleTimeRisk: RiskLevel;
  compatibilityRisk: RiskLevel;
  score: number; // 0-100 where higher is riskier
}

export interface IdleRepositioningResult {
  estimatedIdleDays: number;
  repositioningRisk: RiskLevel;
  idleCostIndex: number; // Estimated financial impact 0-100
}

export interface DecisionEngineResult {
  forecast: FreightForecastResult;
  vessel: VesselRecommendationResult;
  port: {
    origin: PortCompatibilityResult;
    destination: PortCompatibilityResult;
    combinedScore: number;
  };
  timing: MarketTimingResult;
  risk: RiskResult;
  idle: IdleRepositioningResult;
  overallDecisionScore: number;
  summaryReasoning: string[];
}

export interface VoyageScenario {
  id: string;
  createdAt: string;
  
  // Inputs
  cargo: CargoType;
  quantity: number;
  originId: string;
  originName: string;
  destinationId: string;
  destinationName: string;
  routeId: string;
  contract: ContractDuration;
  
  // Legacy support
  origin?: string;
  destination?: string;
  
  // Outputs from Decision Engine
  decisionResult: DecisionEngineResult;
}
