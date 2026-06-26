import { create } from 'zustand';
import { storageService } from '@/services/storage';

export interface OfflineAction {
  id: string;
  type: 'JOIN' | 'LEAVE';
  communityId: string;
  timestamp: number;
}

interface OfflineStore {
  isOnline: boolean;
  queue: OfflineAction[];
  setOnline: (value: boolean) => void;
  addToQueue: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => Promise<void>;
  loadQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
}

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  isOnline: true,
  queue: [],

  setOnline: (value) => set({ isOnline: value }),

  addToQueue: async (action) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${action.type}_${action.communityId}_${Date.now()}`,
      timestamp: Date.now(),
    };
    const currentQueue = get().queue;
    const existingIndex = currentQueue.findIndex((a) => a.communityId === action.communityId);
    let updatedQueue: OfflineAction[];
    if (existingIndex !== -1) {
      updatedQueue = [...currentQueue];
      updatedQueue[existingIndex] = newAction;
    } else {
      updatedQueue = [...currentQueue, newAction];
    }
    set({ queue: updatedQueue });
    await storageService.setOfflineQueue(updatedQueue);
  },

  loadQueue: async () => {
    const queue = await storageService.getOfflineQueue<OfflineAction>();
    set({ queue });
  },

  clearQueue: async () => {
    set({ queue: [] });
    await storageService.clearOfflineQueue();
  },
}));
