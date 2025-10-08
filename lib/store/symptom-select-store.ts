import { create } from 'zustand';

type SymptomStore = {
  selectedSymptoms: Set<string>;
  addSymptom: (symptom: string) => void;
  removeSymptom: (symptom: string) => void;
  isSymptomSelected: (symptom: string) => boolean;
  clearSymptoms: () => void;
};

export const useSymptomStore = create<SymptomStore>((set, get) => ({
  selectedSymptoms: new Set(),

  addSymptom: (symptom) =>
    set((state) => ({
      selectedSymptoms: new Set(state.selectedSymptoms).add(symptom),
    })),

  removeSymptom: (symptom) =>
    set((state) => {
      const newSet = new Set(state.selectedSymptoms);
      newSet.delete(symptom);
      return { selectedSymptoms: newSet };
    }),

  isSymptomSelected: (symptom) => get().selectedSymptoms.has(symptom),

  clearSymptoms: () => set({ selectedSymptoms: new Set() }),
}));