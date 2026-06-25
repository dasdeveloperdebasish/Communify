import { create } from 'zustand';

interface OfflineStore {
  isOnline: boolean;
  setOnline: (value: boolean) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: true,
  setOnline: (value) => set({ isOnline: value }),
}));
