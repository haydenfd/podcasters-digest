import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function SettingsView() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    checkExistingKey();
  }, []);

  const checkExistingKey = async () => {
    try {
      await invoke<string>('get_api_key');
      setHasExistingKey(true);
    } catch {
      setHasExistingKey(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await invoke('set_api_key', { key: apiKey });
      setMessage({ type: 'success', text: 'API key saved securely' });
      setHasExistingKey(true);
      setApiKey('');
    } catch (error) {
      setMessage({ type: 'error', text: error as string });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-serif italic text-white">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-sans text-gray-300 mb-2">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasExistingKey ? 'Enter new key to update' : 'sk-ant-...'}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500 font-sans">
              Your API key is stored securely in the system keychain
            </p>
          </div>

          {hasExistingKey && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
              <p className="text-sm text-green-400 font-sans">API key is configured</p>
            </div>
          )}

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-900/20 border border-green-800/30'
                  : 'bg-red-900/20 border border-red-800/30'
              }`}
            >
              <p
                className={`text-sm font-sans ${
                  message.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim()}
            className="w-full px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-sans"
          >
            {isLoading ? 'Saving...' : 'Save API Key'}
          </button>

          <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <h3 className="text-sm font-sans font-semibold text-white mb-2">
              How to get an API key
            </h3>
            <ol className="text-xs text-gray-400 font-sans space-y-1 list-decimal list-inside">
              <li>Visit console.anthropic.com</li>
              <li>Sign in or create an account</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new API key</li>
              <li>Copy and paste it here</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
