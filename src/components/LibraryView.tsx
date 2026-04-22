import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight } from 'lucide-react';
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {digests.map((digest) => (
            <button
              key={digest.id}
              onClick={() => setSelectedDigest(digest)}
              className="w-full rounded-lg px-4 py-3 hover:bg-zinc-900/50 transition-all duration-150 active:scale-[0.99] text-left flex items-center gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white mb-1 truncate group-hover:text-accent transition-colors">
                  {digest.title}
                </div>
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <span className="truncate">{digest.domain}</span>
                  <span>·</span>
                  <span>{formatTimeAgo(digest.timestamp)}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
