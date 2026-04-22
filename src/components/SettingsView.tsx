import { useStore, Theme } from '../store/useStore';

export default function SettingsView() {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const themeOptions: { value: Theme; label: string; description: string }[] = [
    { value: 'system', label: 'System', description: 'Follow system appearance' },
    { value: 'light', label: 'Light', description: 'Light mode' },
    { value: 'dark', label: 'Dark', description: 'Dark mode' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-serif italic text-white">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Theme Setting */}
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-sans font-semibold text-white mb-1">Appearance</h3>
              <p className="text-sm text-zinc-400 font-sans">Choose how Podcaster's Digest looks</p>
            </div>

            <div className="space-y-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`w-full rounded-lg px-4 py-3 transition-all duration-150 text-left flex items-center justify-between group ${
                    theme === option.value
                      ? 'bg-zinc-800 border-2 border-accent'
                      : 'bg-zinc-900/50 border-2 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-medium font-sans text-sm mb-0.5 ${
                      theme === option.value ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-zinc-500 font-sans">
                      {option.description}
                    </div>
                  </div>

                  {theme === option.value && (
                    <div className="w-4 h-4 rounded-full bg-accent flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Future settings placeholder */}
          <div className="pt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 font-sans text-center">
              AI summarization features coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
