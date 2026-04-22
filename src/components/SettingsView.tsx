import { useStore, Theme } from '../store/useStore';

export default function SettingsView() {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Theme Setting */}
          <div className="space-y-3">
            <h3 className="text-base font-sans font-semibold text-[var(--text-primary)]">Appearance</h3>

            <div className="inline-grid grid-cols-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] p-1">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`min-w-28 rounded-md px-4 py-2 text-sm font-sans font-medium transition-all duration-150 ${
                    theme === option.value
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Future settings placeholder */}
          <div className="pt-8 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)] font-sans text-center">
              AI summarization features coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
