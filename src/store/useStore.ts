import { create } from 'zustand';
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
  loadDigests: () => Promise<void>;
}

let storeInstance: Store | null = null;

const getStore = async () => {
  if (!storeInstance) {
    storeInstance = await Store.load('digests.json');
  }
  return storeInstance;
};

const saveDigests = async (digests: Digest[]) => {
  const store = await getStore();
  await store.set('digests', digests);
  await store.save();
};

const loadDigests = async (): Promise<Digest[]> => {
  try {
    const store = await getStore();
    const digests = await store.get<Digest[]>('digests');
    return digests ?? [];
  } catch (error) {
    console.error('Failed to load digests:', error);
    return [];
  }
};

export const useStore = create<AppState>()((set, get) => ({
  digests: [],
  currentView: 'digest',

  loadDigests: async () => {
    const digests = await loadDigests();
    set({ digests });
  },

  addDigest: (digest: Digest) => {
    set((state) => {
      const newDigests = [digest, ...state.digests];
      saveDigests(newDigests);
      return { digests: newDigests };
    });
  },

  updateDigest: (id: string, updates: Partial<Digest>) => {
    set((state) => {
      const newDigests = state.digests.map((digest) =>
        digest.id === id ? { ...digest, ...updates } : digest
      );
      saveDigests(newDigests);
      return { digests: newDigests };
    });
  },

  setView: (view: View) => set({ currentView: view }),
}));
