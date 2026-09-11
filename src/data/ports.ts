import type { PortData } from './types';

// Structured port dataset for East Coast destinations and some typical origins.
export const PORTS: PortData[] = [
  // Origins
  {
    id: 'port-australia-newcastle',
    name: 'Newcastle',
    country: 'Australia',
    region: 'Oceania',
    maxDraft: 16.5,
    maxLOA: 300,
    cargoHandlingScore: 95,
    supportedCargos: ['Thermal Coal', 'Coking Coal'],
    congestionIndex: 30, // 0-100
    infrastructureScore: 90,
    sourceType: 'REFERENCE',
    coordinates: [-32.9272, 151.7765]
  },
  {
    id: 'port-australia-porthedland',
    name: 'Port Hedland',
    country: 'Australia',
    region: 'Oceania',
    maxDraft: 19.0,
    maxLOA: 330,
    cargoHandlingScore: 98,
    supportedCargos: ['Iron Ore'],
    congestionIndex: 40,
    infrastructureScore: 95,
    sourceType: 'REFERENCE',
    coordinates: [-20.3100, 118.5760]
  },
  {
    id: 'port-mozambique-maputo',
    name: 'Maputo',
    country: 'Mozambique',
    region: 'Africa',
    maxDraft: 14.0,
    maxLOA: 250,
    cargoHandlingScore: 70,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Other Bulk Cargo'],
    congestionIndex: 65,
    infrastructureScore: 60,
    sourceType: 'REFERENCE',
    coordinates: [-25.9692, 32.5732]
  },
  {
    id: 'port-usa-baltimore',
    name: 'Baltimore',
    country: 'United States',
    region: 'North America',
    maxDraft: 15.0,
    maxLOA: 300,
    cargoHandlingScore: 85,
    supportedCargos: ['Thermal Coal', 'Coking Coal'],
    congestionIndex: 25,
    infrastructureScore: 85,
    sourceType: 'REFERENCE',
    coordinates: [39.2904, -76.6122]
  },
  {
    id: 'port-indonesia-kalimantan',
    name: 'Kalimantan Anchorages',
    country: 'Indonesia',
    region: 'Asia',
    maxDraft: 14.5,
    maxLOA: 280,
    cargoHandlingScore: 75, // Transshipment
    supportedCargos: ['Thermal Coal'],
    congestionIndex: 55,
    infrastructureScore: 65,
    sourceType: 'REFERENCE',
    coordinates: [-3.3194, 114.5901]
  },
  {
    id: 'port-russia-vostochny',
    name: 'Vostochny',
    country: 'Russia',
    region: 'Asia',
    maxDraft: 16.0,
    maxLOA: 290,
    cargoHandlingScore: 80,
    supportedCargos: ['Thermal Coal', 'Coking Coal'],
    congestionIndex: 45,
    infrastructureScore: 75,
    sourceType: 'REFERENCE',
    coordinates: [42.7333, 133.0833]
  },

  // Additional Origins (Expanded Port Master)
  {
    id: 'port-australia-gladstone',
    name: 'Gladstone',
    country: 'Australia',
    region: 'Oceania',
    supportedCargos: ['Thermal Coal', 'Coking Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-23.8488, 151.2500]
  },
  {
    id: 'port-australia-haypoint',
    name: 'Hay Point',
    country: 'Australia',
    region: 'Oceania',
    supportedCargos: ['Coking Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-21.2667, 149.3000]
  },
  {
    id: 'port-australia-dalrymplebay',
    name: 'Dalrymple Bay',
    country: 'Australia',
    region: 'Oceania',
    supportedCargos: ['Coking Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-21.2833, 149.3000]
  },
  {
    id: 'port-southafrica-richardsbay',
    name: 'Richards Bay',
    country: 'South Africa',
    region: 'Africa',
    supportedCargos: ['Thermal Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-28.7950, 32.0360]
  },
  {
    id: 'port-southafrica-durban',
    name: 'Durban',
    country: 'South Africa',
    region: 'Africa',
    supportedCargos: ['Other Bulk Cargo'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-29.8718, 31.0427]
  },
  {
    id: 'port-mozambique-nacala',
    name: 'Nacala',
    country: 'Mozambique',
    region: 'Africa',
    supportedCargos: ['Thermal Coal', 'Coking Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-14.5422, 40.6695]
  },
  {
    id: 'port-indonesia-taboneo',
    name: 'Taboneo Anchorage',
    country: 'Indonesia',
    region: 'Asia',
    supportedCargos: ['Thermal Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-3.6333, 114.4500]
  },
  {
    id: 'port-indonesia-muaraberau',
    name: 'Muara Berau Anchorage',
    country: 'Indonesia',
    region: 'Asia',
    supportedCargos: ['Thermal Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [-0.2500, 117.5833]
  },
  {
    id: 'port-russia-vanino',
    name: 'Vanino',
    country: 'Russia',
    region: 'Asia',
    supportedCargos: ['Thermal Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [49.0833, 140.2667]
  },
  {
    id: 'port-usa-hamptonroads',
    name: 'Hampton Roads',
    country: 'United States',
    region: 'North America',
    supportedCargos: ['Coking Coal', 'Thermal Coal'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [36.9500, -76.3167]
  },
  {
    id: 'port-usa-neworleans',
    name: 'New Orleans',
    country: 'United States',
    region: 'North America',
    supportedCargos: ['Other Bulk Cargo'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [29.9511, -90.0715]
  },
  {
    id: 'port-canada-vancouver',
    name: 'Vancouver',
    country: 'Canada',
    region: 'North America',
    supportedCargos: ['Coking Coal', 'Thermal Coal', 'Other Bulk Cargo'],
    sourceType: 'REFERENCE',
    dataConfidence: 'low',
    coordinates: [49.2827, -123.1207]
  },

  // Destinations (East Coast of India)
  {
    id: 'port-india-paradip',
    name: 'Paradip',
    country: 'India',
    region: 'East Coast',
    maxDraft: 14.5, // Reference draft
    maxLOA: 260,
    cargoHandlingScore: 85,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone', 'Other Bulk Cargo'],
    congestionIndex: 60,
    infrastructureScore: 80,
    sourceType: 'REFERENCE',
    coordinates: [20.2600, 86.6740]
  },
  {
    id: 'port-india-visakhapatnam',
    name: 'Visakhapatnam',
    country: 'India',
    region: 'East Coast',
    maxDraft: 18.1, // Can handle capesize at outer harbor
    maxLOA: 300,
    cargoHandlingScore: 88,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Other Bulk Cargo'],
    congestionIndex: 50,
    infrastructureScore: 85,
    sourceType: 'REFERENCE',
    coordinates: [17.6868, 83.2185]
  },
  {
    id: 'port-india-gangavaram',
    name: 'Gangavaram',
    country: 'India',
    region: 'East Coast',
    maxDraft: 18.5,
    maxLOA: 300,
    cargoHandlingScore: 92,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone'],
    congestionIndex: 35,
    infrastructureScore: 90,
    sourceType: 'REFERENCE',
    coordinates: [17.6212, 83.2403]
  },
  {
    id: 'port-india-gopalpur',
    name: 'Gopalpur',
    country: 'India',
    region: 'East Coast',
    maxDraft: 12.5, // Fairly shallow, restricts larger vessels
    maxLOA: 225,
    cargoHandlingScore: 65,
    supportedCargos: ['Iron Ore', 'Limestone', 'Other Bulk Cargo'],
    congestionIndex: 20,
    infrastructureScore: 60,
    sourceType: 'REFERENCE',
    coordinates: [19.2619, 84.9080]
  },
  {
    id: 'port-india-dhamra',
    name: 'Dhamra',
    country: 'India',
    region: 'East Coast',
    maxDraft: 18.0,
    maxLOA: 300,
    cargoHandlingScore: 90,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone'],
    congestionIndex: 40,
    infrastructureScore: 88,
    sourceType: 'REFERENCE',
    coordinates: [20.8037, 86.9745]
  },
  {
    id: 'port-india-sagar',
    name: 'Sagar-Sandheads',
    country: 'India',
    region: 'East Coast',
    maxDraft: 99.0, // Anchorage, deep water
    maxLOA: 999, // Anchorage, no strict LOA limit
    cargoHandlingScore: 50, // Lighterage operations
    supportedCargos: ['Thermal Coal', 'Coking Coal'],
    congestionIndex: 70,
    infrastructureScore: 50,
    sourceType: 'REFERENCE',
    type: 'ANCHORAGE',
    requiresLighterage: true,
    shoreCargoHandling: false,
    coordinates: [21.5794, 88.0863]
  },
  {
    id: 'port-india-haldia',
    name: 'Haldia',
    country: 'India',
    region: 'East Coast',
    maxDraft: 7.5, // Riverine port, highly restricted draft
    maxLOA: 230,
    cargoHandlingScore: 75,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Other Bulk Cargo'],
    congestionIndex: 85, // River traffic and lock gates
    infrastructureScore: 70,
    sourceType: 'REFERENCE',
    coordinates: [22.0257, 88.0583]
  }
];
