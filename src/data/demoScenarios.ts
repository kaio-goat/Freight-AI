import type { VoyageScenario } from './types';
import { runDecisionEngine } from '../services/decisionEngine';

// Generate Demo Scenarios deterministically using the actual decision engine
export const DEMO_SCENARIOS: VoyageScenario[] = [
  {
    id: 'sc-demo-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    cargo: 'Coking Coal',
    quantity: 120000,
    originId: 'port-australia-newcastle',
    originName: 'Newcastle',
    destinationId: 'port-india-paradip',
    destinationName: 'Paradip',
    routeId: 'newcastle-paradip',
    contract: 'Spot',
    decisionResult: runDecisionEngine('port-australia-newcastle', 'port-india-paradip', 'Coking Coal', 120000)
  },
  {
    id: 'sc-demo-2',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    cargo: 'Thermal Coal',
    quantity: 55000,
    originId: 'port-indonesia-kalimantan',
    originName: 'Kalimantan Anchorages',
    destinationId: 'port-india-visakhapatnam',
    destinationName: 'Visakhapatnam',
    routeId: 'kalimantananchorages-visakhapatnam',
    contract: '1 month',
    decisionResult: runDecisionEngine('port-indonesia-kalimantan', 'port-india-visakhapatnam', 'Thermal Coal', 55000)
  },
  {
    id: 'sc-demo-3',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cargo: 'Thermal Coal',
    quantity: 75000,
    originId: 'port-mozambique-maputo',
    originName: 'Maputo',
    destinationId: 'port-india-haldia',
    destinationName: 'Haldia', // Haldia has high risk due to draft
    routeId: 'maputo-haldia',
    contract: '3 months',
    decisionResult: runDecisionEngine('port-mozambique-maputo', 'port-india-haldia', 'Thermal Coal', 75000)
  }
];
