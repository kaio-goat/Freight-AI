import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VoyageScenario } from '../data/mockData';
import { DEMO_SCENARIOS } from '../data/mockData';

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
      deleteScenario: (id: string) =>
        set((state: ScenarioState) => ({ scenarios: state.scenarios.filter((s: VoyageScenario) => s.id !== id) })),
      setActiveScenario: (id: string | null) => set({ activeScenarioId: id }),
    }),
    {
      name: 'freight-iq-storage',
    }
  )
);
