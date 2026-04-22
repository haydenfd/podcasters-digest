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
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const addDigest = useStore((state) => state.addDigest);
  const digests = useStore((state) => state.digests);
  const updateDigest = useStore((state) => state.updateDigest);

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

    // Check if URL already exists
    const existingDigest = digests.find(d => d.url === url.trim());
    if (existingDigest) {
      setShowDuplicateModal(true);
      return;
    }

    await performDigest();
  };

  const performDigest = async (overwrite: boolean = false) => {
    try {
      setPhase('fetching');
      setProgress(33);
      setErrorMessage('');

      const content = await invoke<string>('fetch_url', { url });

      setPhase('processing');
      setProgress(66);

      const urlObj = new URL(url);
      const title = extractTitle(content);

      if (overwrite) {
        const existingDigest = digests.find(d => d.url === url.trim());
        if (existingDigest && updateDigest) {
          updateDigest(existingDigest.id, {
            title,
            summary: content,
            timestamp: Date.now(),
          });
        }
      } else {
        addDigest({
          id: Date.now().toString(),
          title,
          url,
          domain: urlObj.hostname,
          summary: content,
          timestamp: Date.now(),
        });
      }

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

  const handleOverwrite = async () => {
    setShowDuplicateModal(false);
    await performDigest(true);
  };

  const handleCancelOverwrite = () => {
    setShowDuplicateModal(false);
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
      <div className="p-8">
        <div className="flex gap-3 items-center max-w-3xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDigest()}
              placeholder="Paste URL here..."
              className="w-full pl-4 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all duration-150 font-sans text-base"
            />
          </div>

          <button
            onClick={handleDigest}
            disabled={!url.trim() || (phase !== 'idle' && phase !== 'saved')}
            className="px-6 py-3 bg-accent text-background font-semibold rounded-xl hover:bg-[#c5f944] active:bg-[#a3d620] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-sans text-base whitespace-nowrap shadow-lg shadow-accent/10"
          >
            Digest
          </button>
        </div>

        {(phase !== 'idle' && phase !== 'saved') && (
          <div className="mt-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-zinc-400">{getPhaseText()}</span>
              <span className="font-mono text-xs text-zinc-500">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  phase === 'error' ? 'bg-red-500' : 'bg-accent'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 font-mono text-xs text-zinc-500">{getSubText()}</div>
          </div>
        )}
      </div>

      {showNotification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-background px-6 py-3 rounded-xl shadow-2xl shadow-accent/20 font-sans text-sm font-semibold animate-fade-in z-50 border border-accent/20">
          ✓ Saved to library
        </div>
      )}

      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-serif text-white mb-2">Already Digested</h3>
            <p className="text-sm text-zinc-400 font-sans mb-6">
              This URL has already been digested. Do you want to overwrite the existing entry?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleOverwrite}
                className="flex-1 px-4 py-2.5 bg-accent text-background font-semibold rounded-lg hover:bg-[#c5f944] active:bg-[#a3d620] transition-all duration-150 font-sans text-sm"
              >
                Yes
              </button>
              <button
                onClick={handleCancelOverwrite}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-white font-semibold rounded-lg hover:bg-zinc-700 active:bg-zinc-600 transition-all duration-150 font-sans text-sm"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
