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
export type Theme = 'light' | 'dark';

interface AppState {
  digests: Digest[];
  currentView: View;
  previousView: View | null;
  theme: Theme;
  addDigest: (digest: Digest) => Promise<void>;
  updateDigest: (id: string, updates: Partial<Digest>) => Promise<void>;
  setView: (view: View) => void;
  setTheme: (theme: Theme) => void;
  loadDigests: () => Promise<void>;
  loadSettings: () => Promise<void>;
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

const saveTheme = async (theme: Theme) => {
  try {
    const store = await getStore();
    await store.set('theme', theme);
    await store.save();
    console.log('Saved theme to storage:', theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

const loadTheme = async (): Promise<Theme> => {
  try {
    const store = await getStore();
    const theme = await store.get<string>('theme');
    const savedTheme = theme === 'light' || theme === 'dark' ? theme : 'dark';
    console.log('Loaded theme from storage:', savedTheme);
    return savedTheme;
  } catch (error) {
    console.error('Failed to load theme:', error);
    return 'dark';
  }
};

export const useStore = create<AppState>()((set, get) => ({
  digests: [],
  currentView: 'digest',
  previousView: null,
  theme: 'dark',

  loadDigests: async () => {
    const digests = await loadDigests();
    set({ digests });
  },

  loadSettings: async () => {
    const theme = await loadTheme();
    set({ theme });
  },

  addDigest: async (digest: Digest) => {
    const newDigests = [digest, ...get().digests];
    set({ digests: newDigests });
    await saveDigests(newDigests);
  },

  updateDigest: async (id: string, updates: Partial<Digest>) => {
    const newDigests = get().digests.map((digest) =>
      digest.id === id ? { ...digest, ...updates } : digest
    );
    set({ digests: newDigests });
    await saveDigests(newDigests);
  },

  setView: (view: View) => {
    const currentView = get().currentView;
    set({ previousView: currentView, currentView: view });
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    saveTheme(theme);
  },
}));
