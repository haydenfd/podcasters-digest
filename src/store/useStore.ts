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
  previousView: View | null;
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
  try {
    const store = await getStore();
    await store.set('digests', digests);
    await store.save();
    console.log('Saved digests to storage:', digests.length);
  } catch (error) {
    console.error('Failed to save digests:', error);
  }
};

const loadDigests = async (): Promise<Digest[]> => {
  try {
    const store = await getStore();
    const digests = await store.get<Digest[]>('digests');
    console.log('Loaded digests from storage:', digests?.length ?? 0);
    return digests ?? [];
  } catch (error) {
    console.error('Failed to load digests:', error);
    return [];
  }
};

export const useStore = create<AppState>()((set, get) => ({
  digests: [],
  currentView: 'digest',
  previousView: null,

  loadDigests: async () => {
    const digests = await loadDigests();
    set({ digests });
  },

  addDigest: (digest: Digest) => {
    const newDigests = [digest, ...get().digests];
    set({ digests: newDigests });
    saveDigests(newDigests);
  },

  updateDigest: (id: string, updates: Partial<Digest>) => {
    const newDigests = get().digests.map((digest) =>
      digest.id === id ? { ...digest, ...updates } : digest
    );
    set({ digests: newDigests });
    saveDigests(newDigests);
  },

  setView: (view: View) => {
    const currentView = get().currentView;
    set({ previousView: currentView, currentView: view });
  },
}));
