import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useStore } from '../store/useStore';

type ProcessingPhase = 'idle' | 'fetching' | 'processing' | 'saved' | 'error';

export default function DigestView() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<ProcessingPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const addDigest = useStore((state) => state.addDigest);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setPhase('idle');
        setUrl('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleDigest = async () => {
    if (!url.trim()) return;

    try {
      setPhase('fetching');
      setProgress(33);
      setErrorMessage('');

      const content = await invoke<string>('fetch_url', { url });

      setPhase('processing');
      setProgress(66);

      const urlObj = new URL(url);
      const title = extractTitle(content);

      addDigest({
        id: Date.now().toString(),
        title,
        url,
        domain: urlObj.hostname,
        summary: content,
        timestamp: Date.now(),
      });

      setPhase('saved');
      setProgress(100);
      setShowNotification(true);
    } catch (error) {
      setPhase('error');
      setProgress(0);
      setErrorMessage(error as string);
      setTimeout(() => {
        setPhase('idle');
      }, 3000);
    }
  };

  const extractTitle = (markdown: string): string => {
    // Try to match first H1 heading
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Try to match Title: format
    const titleMatch = markdown.match(/^Title:\s*(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Try first line if it's text
    const lines = markdown.trim().split('\n');
    const firstLine = lines.find(line => line.trim().length > 0);
    if (firstLine && firstLine.length < 100) {
      return firstLine.replace(/^[#\s]+/, '').trim();
    }

    return 'Untitled';
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'fetching':
        return 'Fetching...';
      case 'processing':
        return 'Processing...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  const getSubText = () => {
    switch (phase) {
      case 'fetching':
        return 'via jina reader';
      case 'processing':
        return 'extracting content';
      case 'saved':
        return 'added to library';
      case 'error':
        return errorMessage;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDigest()}
          placeholder="Paste URL here..."
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-sans text-sm"
        />

        <button
          onClick={handleDigest}
          disabled={!url.trim() || (phase !== 'idle' && phase !== 'saved')}
          className="mt-3 w-full px-6 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-sans text-sm"
        >
          Digest
        </button>

        {(phase !== 'idle' && phase !== 'saved') && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-gray-400">{getPhaseText()}</span>
              <span className="font-mono text-xs text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  phase === 'error' ? 'bg-red-500' : 'bg-accent'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 font-mono text-xs text-gray-500">{getSubText()}</div>
          </div>
        )}
      </div>

      {showNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-background px-6 py-3 rounded-lg shadow-lg font-sans text-sm font-semibold animate-fade-in z-50">
          ✓ Saved to library
        </div>
      )}
    </div>
  );
}
