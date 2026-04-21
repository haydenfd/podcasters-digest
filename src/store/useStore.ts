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
  updateDigest: (id: string, updates: Partial<Digest>) => void;
  setView: (view: View) => void;
}

let storeInstance: Store | null = null;

const getStore = async () => {
  if (!storeInstance) {
    storeInstance = await Store.load('store.json');
  }
  return storeInstance;
};

const tauriStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const store = await getStore();
    const value = await store.get<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const store = await getStore();
    await store.set(name, value);
    await store.save();
  },
  removeItem: async (name: string): Promise<void> => {
    const store = await getStore();
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
      updateDigest: (id: string, updates: Partial<Digest>) =>
        set((state) => ({
          digests: state.digests.map((digest) =>
            digest.id === id ? { ...digest, ...updates } : digest
          ),
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
