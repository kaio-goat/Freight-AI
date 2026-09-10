import type { VesselClass } from './types';

export const VESSEL_CLASSES: VesselClass[] = [
  {
    id: 'handysize',
    name: 'Handysize',
    minCapacity: 15000,
    maxCapacity: 39999,
    typicalDraft: 10.5,
    typicalLOA: 175,
    typicalSpeed: 14.0,
    costIndex: 1.2, // Relatively more expensive per tonne
    flexibilityScore: 90, // Can enter almost any port
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone', 'Other Bulk Cargo']
  },
  {
    id: 'supramax',
    name: 'Supramax',
    minCapacity: 40000,
    maxCapacity: 59999,
    typicalDraft: 11.5,
    typicalLOA: 190,
    typicalSpeed: 14.5,
    costIndex: 1.05,
    flexibilityScore: 80,
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone', 'Other Bulk Cargo']
  },
  {
    id: 'panamax',
    name: 'Panamax',
    minCapacity: 60000,
    maxCapacity: 84999,
    typicalDraft: 13.5,
    typicalLOA: 225,
    typicalSpeed: 15.0,
    costIndex: 0.95, // Good economies of scale
    flexibilityScore: 60, // Limited by canal locks and draft
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Limestone']
  },
  {
    id: 'capesize',
    name: 'Capesize',
    minCapacity: 110000,
    maxCapacity: 200000,
    typicalDraft: 18.0,
    typicalLOA: 290,
    typicalSpeed: 15.0,
    costIndex: 0.8, // Cheapest per tonne if full
    flexibilityScore: 30, // Can only enter deep-water ports
    supportedCargos: ['Thermal Coal', 'Coking Coal', 'Iron Ore']
  }
];
