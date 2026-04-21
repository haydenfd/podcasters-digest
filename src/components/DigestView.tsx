import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../store/useStore';

type ProcessingPhase = 'idle' | 'fetching' | 'summarizing' | 'done' | 'error';

export default function DigestView() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<ProcessingPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState('');
  const addDigest = useStore((state) => state.addDigest);

  const handleDigest = async () => {
    if (!url.trim()) return;

    try {
      setPhase('fetching');
      setProgress(25);
      setErrorMessage('');
      setSummary('');

      const content = await invoke<string>('fetch_url', { url });

      setPhase('summarizing');
      setProgress(60);

      const apiKey = await invoke<string>('get_api_key');
      const summaryText = await invoke<string>('summarize', {
        content,
        apiKey,
      });

      setPhase('done');
      setProgress(100);
      setSummary(summaryText);

      const urlObj = new URL(url);
      const title = extractTitle(content);

      addDigest({
        id: Date.now().toString(),
        title,
        url,
        domain: urlObj.hostname,
        summary: summaryText,
        timestamp: Date.now(),
      });
    } catch (error) {
      setPhase('error');
      setProgress(0);
      setErrorMessage(error as string);
    }
  };

  const extractTitle = (markdown: string): string => {
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return 'Untitled';
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'fetching':
        return 'Fetching content...';
      case 'summarizing':
        return 'Summarizing...';
      case 'done':
        return 'Done.';
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
      case 'summarizing':
        return 'processing with claude';
      case 'done':
        return 'saved to library';
      case 'error':
        return errorMessage;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDigest()}
          placeholder="Paste URL here..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-sans"
        />
        <button
          onClick={handleDigest}
          disabled={!url.trim() || (phase !== 'idle' && phase !== 'done' && phase !== 'error')}
          className="mt-4 w-full px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-sans flex items-center justify-center gap-2"
        >
          <span>Digest</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {phase !== 'idle' && (
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-gray-300">{getPhaseText()}</span>
            <span className="font-mono text-xs text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
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

      {summary && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
