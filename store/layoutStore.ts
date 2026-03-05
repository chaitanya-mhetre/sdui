import { create } from 'zustand';

/**
 * SDUI layout store – holds the raw JSON for the code editor
 * and drives the live preview when in Flutter-style schema.
 */
interface LayoutState {
  layoutJson: string;
  setLayoutJson: (json: string) => void;
  updateLayout: (updater: (prev: string) => string) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  layoutJson: '',
  setLayoutJson: (layoutJson) => set({ layoutJson }),
  updateLayout: (updater) => set((state) => ({ layoutJson: updater(state.layoutJson) })),
}));
