import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VoyageScenario } from '../data/types';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

interface ScenarioState {
  scenarios: VoyageScenario[];
  activeScenarioId: string | null;
  addScenario: (scenario: VoyageScenario) => void;
  deleteScenario: (id: string) => void;
  setActiveScenario: (id: string | null) => void;
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set) => ({
      scenarios: DEMO_SCENARIOS, // Initialize with demo scenarios for the prototype
      activeScenarioId: null,
      addScenario: (scenario: VoyageScenario) =>
        set((state: ScenarioState) => ({ scenarios: [scenario, ...state.scenarios] })),
      deleteScenario: (id: string) => set((state: ScenarioState) => {
        const filtered = state.scenarios.filter((s: VoyageScenario) => s.id !== id);
        return { 
          scenarios: filtered,
          activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId
        };
      }),
      setActiveScenario: (id: string | null) => set({ activeScenarioId: id }),
    }),
    {
      name: 'freight-iq-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === 1) {
          // Migration from old schema where origin/destination were just strings
          const state = persistedState as ScenarioState;
          if (state.scenarios) {
            state.scenarios = state.scenarios.map(s => {
              if (s.originId && s.destinationId) return s; // Already migrated
              
              // Guess the origin/destination based on old strings
              let originId = 'port-australia-newcastle';
              let originName = s.origin || 'Newcastle';
              let destinationId = 'port-india-paradip';
              let destinationName = s.destination || 'Paradip';
              
              if (s.origin === 'Australia' || s.origin === 'Newcastle') { originId = 'port-australia-newcastle'; originName = 'Newcastle'; }
              if (s.origin === 'Mozambique' || s.origin === 'Maputo') { originId = 'port-mozambique-maputo'; originName = 'Maputo'; }
              if (s.origin === 'USA' || s.origin === 'United States' || s.origin === 'Baltimore') { originId = 'port-usa-baltimore'; originName = 'Baltimore'; }
              if (s.origin === 'Indonesia' || s.origin === 'Kalimantan Anchorages') { originId = 'port-indonesia-kalimantan'; originName = 'Kalimantan Anchorages'; }
              if (s.origin === 'Russia' || s.origin === 'Vostochny') { originId = 'port-russia-vostochny'; originName = 'Vostochny'; }
              
              if (s.destination === 'Paradip') destinationId = 'port-india-paradip';
              if (s.destination === 'Visakhapatnam') destinationId = 'port-india-visakhapatnam';
              if (s.destination === 'Gangavaram') destinationId = 'port-india-gangavaram';
              if (s.destination === 'Gopalpur') destinationId = 'port-india-gopalpur';
              if (s.destination === 'Dhamra') destinationId = 'port-india-dhamra';
              if (s.destination === 'Sagar-Sandheads') destinationId = 'port-india-sagar';
              if (s.destination === 'Haldia') destinationId = 'port-india-haldia';
              
              const cleanOrigin = originName.toLowerCase().replace(/[^a-z0-9]/g, '');
              const cleanDest = destinationName.toLowerCase().replace(/[^a-z0-9]/g, '');
              
              return {
                ...s,
                originId,
                originName,
                destinationId,
                destinationName,
                routeId: `${cleanOrigin}-${cleanDest}`
              };
            });
          }
          return state;
        }
        return persistedState;
      }
    }
  )
);
