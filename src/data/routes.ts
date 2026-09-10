import type { RouteData } from './types';
import { PORTS } from './ports';

// Helper to calculate a rough distance based on origin base distance and destination offset.
// This ensures all 42 combinations exist deterministically.
const ORIGIN_BASE_DISTANCES: Record<string, number> = {
  'port-australia-newcastle': 5500,
  'port-australia-porthedland': 4500,
  'port-mozambique-maputo': 3900,
  'port-usa-baltimore': 9500,
  'port-indonesia-kalimantan': 2100,
  'port-russia-vostochny': 6200
};

const DEST_OFFSETS: Record<string, number> = {
  'port-india-paradip': 0,
  'port-india-visakhapatnam': -100,
  'port-india-gangavaram': -105,
  'port-india-gopalpur': -50,
  'port-india-dhamra': 30,
  'port-india-sagar': 80,
  'port-india-haldia': 100
};

const ORIGINS = PORTS.filter(p => p.region !== 'East Coast');
const DESTINATIONS = PORTS.filter(p => p.region === 'East Coast');

export const ROUTES: RouteData[] = [];

for (const origin of ORIGINS) {
  for (const dest of DESTINATIONS) {
    const baseDist = ORIGIN_BASE_DISTANCES[origin.id] || 5000;
    const offset = DEST_OFFSETS[dest.id] || 0;
    const distanceNM = baseDist + offset;
    const typicalDays = Math.max(7, Math.round(distanceNM / (13 * 24))); // Roughly 13 knots

    let baseRisk: 'Low' | 'Moderate' | 'High' = 'Low';
    if (origin.id === 'port-russia-vostochny') baseRisk = 'High';
    else if (origin.id === 'port-usa-baltimore') baseRisk = 'Moderate';
    else if (dest.id === 'port-india-haldia') baseRisk = 'Moderate';
    
    // Create friendly canonical IDs e.g. newcastle-paradip
    const cleanOrigin = origin.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanDest = dest.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    ROUTES.push({
      id: `${cleanOrigin}-${cleanDest}`,
      originId: origin.id,
      originName: origin.name,
      originRegion: origin.country,
      destinationId: dest.id,
      destinationName: dest.name,
      destinationRegion: dest.country,
      distanceNM,
      typicalDays,
      baseRisk,
      sourceType: 'REFERENCE'
    });
  }
}

export function getRoute(originId: string, destinationId: string): RouteData | undefined {
  return ROUTES.find(r => r.originId === originId && r.destinationId === destinationId);
}

export function getRouteById(routeId: string): RouteData | undefined {
  return ROUTES.find(r => r.id === routeId);
}
