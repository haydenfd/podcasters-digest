import { useEffect } from 'react';
import { useStore } from './store/useStore';
import DigestView from './components/DigestView';
import LibraryView from './components/LibraryView';
import SettingsView from './components/SettingsView';

function App() {
  const currentView = useStore((state) => state.currentView);
  const setView = useStore((state) => state.setView);
  const loadDigests = useStore((state) => state.loadDigests);

  useEffect(() => {
    loadDigests();
  }, [loadDigests]);

  return (
    <div className="flex flex-col h-screen bg-background text-white">
      <header className="flex items-center px-8 py-5 border-b border-gray-800">
        <h1 className="text-2xl font-serif text-white tracking-tight">Podcaster's Digest</h1>
      </header>

      <nav className="flex border-b border-gray-800">
        <button
          onClick={() => setView('digest')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-colors ${
            currentView === 'digest'
              ? 'text-white border-b-2 border-accent'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Digest
        </button>
        <button
          onClick={() => setView('library')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-colors ${
            currentView === 'library'
              ? 'text-white border-b-2 border-accent'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => setView('settings')}
          className={`flex-1 px-6 py-4 font-sans text-sm transition-colors ${
            currentView === 'settings'
              ? 'text-white border-b-2 border-accent'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Settings
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
