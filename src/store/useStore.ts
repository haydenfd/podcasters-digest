import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Store } from '@tauri-apps/plugin-store';

export interface Digest {
  id: string;
  title: string;
  url: string;
  domain: string;
  summary: string;
  timestamp: number;
}

type View = 'digest' | 'library' | 'settings';

interface AppState {
  digests: Digest[];
  currentView: View;
  addDigest: (digest: Digest) => void;
  setView: (view: View) => void;
}

const store = new Store('store.json');

const tauriStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await store.get<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await store.set(name, value);
    await store.save();
  },
  removeItem: async (name: string): Promise<void> => {
    await store.delete(name);
    await store.save();
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      digests: [],
      currentView: 'digest',
      addDigest: (digest: Digest) =>
        set((state) => ({
          digests: [digest, ...state.digests],
        })),
      setView: (view: View) => set({ currentView: view }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({ digests: state.digests }),
    }
  )
);
