import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore, Digest } from '../store/useStore';

export default function LibraryView() {
  const digests = useStore((state) => state.digests);
  const [selectedDigest, setSelectedDigest] = useState<Digest | null>(null);

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const isFresh = (timestamp: number): boolean => {
    return Date.now() - timestamp < 5 * 60 * 1000;
  };

  if (selectedDigest) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setSelectedDigest(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-sans text-sm"
          >
            <span>←</span>
            <span>Back to Library</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-serif italic text-white mb-2">
              {selectedDigest.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-8">
              <span>{selectedDigest.domain}</span>
              <span>·</span>
              <span>{formatTimeAgo(selectedDigest.timestamp)}</span>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedDigest.summary}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-serif italic text-white">Library</h2>
      </div>

      {digests.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 font-mono text-sm">
            <div className="mb-2">No digests yet</div>
            <div className="text-xs">Create your first digest to get started</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {digests.map((digest) => (
            <button
              key={digest.id}
              onClick={() => setSelectedDigest(digest)}
              className="w-full p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors text-left flex items-start gap-3"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  isFresh(digest.timestamp) ? 'bg-accent' : 'bg-gray-700'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-sans text-white mb-1 truncate">{digest.title}</div>
                <div className="font-mono text-xs text-gray-500 flex items-center gap-2">
                  <span className="truncate">{digest.domain}</span>
                  <span>·</span>
                  <span>{formatTimeAgo(digest.timestamp)}</span>
                </div>
              </div>
              <div className="text-gray-600 flex-shrink-0">
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M5 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
