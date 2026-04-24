import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Loader2, CheckCircle2, Link } from 'lucide-react';
import { useStore } from '../store/useStore';

type ProcessingPhase = 'idle' | 'fetching' | 'processing' | 'saved' | 'error';
type ButtonState = 'idle' | 'loading' | 'success';

export default function DigestView() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<ProcessingPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const addDigest = useStore((state) => state.addDigest);
  const digests = useStore((state) => state.digests);
  const updateDigest = useStore((state) => state.updateDigest);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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
      setButtonState('loading');
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
          await updateDigest(existingDigest.id, {
            title,
            summary: content,
            timestamp: Date.now(),
          });
        }
      } else {
        await addDigest({
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
      setButtonState('success');
      setToastTitle(title);
      setShowToast(true);

      setTimeout(() => {
        setButtonState('idle');
        setPhase('idle');
        setUrl('');
      }, 1500);
    } catch (error) {
      setPhase('error');
      setProgress(0);
      setErrorMessage(error as string);
      setButtonState('idle');
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
      <div className="p-8 space-y-6">
        <div className="flex gap-3 items-center max-w-3xl mx-auto">
          <div className="relative flex-1 flex items-center">
            <Link size={18} className="absolute left-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDigest()}
              placeholder="Paste URL here..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] focus:border-[var(--accent)] transition-all duration-150 font-sans text-base"
            />
          </div>

          <button
            onClick={handleDigest}
            disabled={buttonState !== 'idle' || !url.trim()}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-xl hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 font-sans text-base whitespace-nowrap shadow-lg shadow-[var(--accent-shadow)] flex items-center gap-2 min-w-[140px] justify-center"
          >
            {buttonState === 'loading' && (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Digesting...</span>
              </>
            )}
            {buttonState === 'success' && (
              <>
                <CheckCircle2 size={16} />
                <span>Saved</span>
              </>
            )}
            {buttonState === 'idle' && <span>Digest</span>}
          </button>
        </div>

        {(phase !== 'idle' && phase !== 'saved') && (
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">{getPhaseText()}</span>
              <span className="text-sm text-[var(--text-muted)]">{progress}%</span>
            </div>
            <div className="w-full bg-[var(--surface-strong)] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  phase === 'error' ? 'bg-red-500' : 'bg-[var(--accent)]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-[var(--text-muted)]">{getSubText()}</div>
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed top-4 right-4 bg-[var(--surface)]/90 backdrop-blur border border-[var(--border-strong)] rounded-lg px-4 py-3 shadow-lg flex items-start gap-3 z-50 animate-slide-in">
          <CheckCircle2 size={20} className="text-[var(--accent-text)] mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--text-primary)] text-sm">Saved to library</div>
            <div className="text-sm text-[var(--text-secondary)] truncate">{toastTitle}</div>
          </div>
        </div>
      )}

      {showDuplicateModal && (
        <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-serif text-[var(--text-primary)] mb-2">Already Digested</h3>
            <p className="text-sm text-[var(--text-secondary)] font-sans mb-6">
              This URL has already been digested. Do you want to overwrite the existing entry?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleOverwrite}
                className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] transition-all duration-150 font-sans text-sm"
              >
                Yes
              </button>
              <button
                onClick={handleCancelOverwrite}
                className="flex-1 px-4 py-2.5 bg-[var(--surface-strong)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--hover)] transition-all duration-150 font-sans text-sm"
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
