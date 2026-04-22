import { useEffect } from 'react';
import { FileText, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from './store/useStore';
import DigestView from './components/DigestView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';

function App() {
  const currentView = useStore((state) => state.currentView);
  const previousView = useStore((state) => state.previousView);
  const setView = useStore((state) => state.setView);

  useEffect(() => {
    useStore.getState().loadDigests();
    useStore.getState().loadSettings();
  }, []);

  const getViewIndex = (view: string) => {
    const views = ['digest', 'library', 'settings'];
    return views.indexOf(view);
  };

  const getSlideDirection = () => {
    if (!previousView) return '';
    const prevIndex = getViewIndex(previousView);
    const currIndex = getViewIndex(currentView);
    return currIndex > prevIndex ? 'slide-left' : 'slide-right';
  };

  const slideDirection = getSlideDirection();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#121214] to-background text-white">
      <header className="flex items-center px-8 py-5 border-b border-zinc-800/50">
        <h1 className="text-2xl font-serif text-white tracking-tight">Podcaster's Digest</h1>
      </header>

      <nav className="flex border-b border-zinc-800/50 bg-black/20 relative">
        <button
          onClick={() => setView('digest')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            currentView === 'digest'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileText size={16} />
          <span>Digest</span>
        </button>
        <button
          onClick={() => setView('library')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            currentView === 'library'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BookOpen size={16} />
          <span>Library</span>
        </button>
        <button
          onClick={() => setView('settings')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            currentView === 'settings'
              ? 'text-white font-semibold'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <SettingsIcon size={16} />
          <span>Settings</span>
        </button>

        {/* Sliding indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-out"
          style={{
            width: '33.333%',
            left: `${getViewIndex(currentView) * 33.333}%`
          }}
        />
      </nav>

      <main className="flex-1 overflow-hidden relative">
        <div key={currentView} className={`absolute inset-0 ${slideDirection}`}>
          {currentView === 'digest' && <DigestView />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
