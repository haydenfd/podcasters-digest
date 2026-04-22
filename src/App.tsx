import { useEffect } from 'react';
import { FileText, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from './store/useStore';
import DigestView from './components/DigestView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';

function App() {
  const currentView = useStore((state) => state.currentView);
  const setView = useStore((state) => state.setView);

  useEffect(() => {
    useStore.getState().loadDigests();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#121214] to-background text-white">
      <header className="flex items-center px-8 py-5 border-b border-zinc-800/50">
        <h1 className="text-2xl font-serif text-white tracking-tight">Podcaster's Digest</h1>
      </header>

      <nav className="flex border-b border-zinc-800/50 bg-black/20">
        <button
          onClick={() => setView('digest')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            currentView === 'digest'
              ? 'text-white border-b-2 border-accent font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          <FileText size={16} />
          <span>Digest</span>
        </button>
        <button
          onClick={() => setView('library')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            currentView === 'library'
              ? 'text-white border-b-2 border-accent font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          <BookOpen size={16} />
          <span>Library</span>
        </button>
        <button
          onClick={() => setView('settings')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            currentView === 'settings'
              ? 'text-white border-b-2 border-accent font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
          }`}
        >
          <SettingsIcon size={16} />
          <span>Settings</span>
        </button>
      </nav>

      <main className="flex-1 overflow-hidden">
        {currentView === 'digest' && <DigestView />}
        {currentView === 'library' && <LibraryView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default App;
