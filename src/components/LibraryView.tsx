import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight, Search } from 'lucide-react';
import { useStore, Digest } from '../store/useStore';

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/www\./g, '')
    .trim();

const fuzzyScore = (query: string, value: string) => {
  if (!query) return 1;

  const normalizedQuery = normalizeSearchText(query);
  const normalizedValue = normalizeSearchText(value);

  if (!normalizedQuery || !normalizedValue) return 0;
  if (normalizedValue.includes(normalizedQuery)) return normalizedQuery.length + 100;

  let score = 0;
  let queryIndex = 0;
  let streak = 0;

  for (let i = 0; i < normalizedValue.length && queryIndex < normalizedQuery.length; i += 1) {
    if (normalizedValue[i] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      streak += 1;
      score += 2 + streak;
    } else {
      streak = 0;
    }
  }

  if (queryIndex !== normalizedQuery.length) return 0;
  return score;
};

export default function LibraryView() {
  const digests = useStore((state) => state.digests);
  const [selectedDigest, setSelectedDigest] = useState<Digest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const filteredDigests = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) return digests;

    return digests
      .map((digest) => {
        const titleScore = fuzzyScore(query, digest.title);
        const domainScore = fuzzyScore(query, digest.domain);
        const urlScore = fuzzyScore(query, digest.url);
        const score = Math.max(titleScore * 1.5, domainScore * 1.2, urlScore);

        return { digest, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.digest.timestamp - a.digest.timestamp)
      .map((entry) => entry.digest);
  }, [digests, searchQuery]);

  if (selectedDigest) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-[var(--border)]">
          <button
            onClick={() => setSelectedDigest(null)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-sans text-sm"
          >
            <span>←</span>
            <span>Back to Library</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-serif italic text-[var(--text-primary)] mb-2">
              {selectedDigest.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] font-mono mb-8">
              <span>{selectedDigest.domain}</span>
              <span>·</span>
              <span>{formatTimeAgo(selectedDigest.timestamp)}</span>
            </div>
            <div className="prose prose-sm max-w-none text-[var(--text-primary)] prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--text-primary)] prose-blockquote:text-[var(--text-secondary)] prose-code:text-[var(--text-primary)] prose-li:text-[var(--text-primary)]">
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
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Library
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                {digests.length} {digests.length === 1 ? 'article' : 'articles'} saved
              </div>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles or sources"
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] pl-11 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)] focus:border-[var(--accent)] transition-all duration-150"
            />
          </div>
        </div>
      </div>

      {digests.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[var(--text-muted)] font-mono text-sm">
            <div className="mb-2">No digests yet</div>
            <div className="text-xs">Create your first digest to get started</div>
          </div>
        </div>
      ) : filteredDigests.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center text-[var(--text-muted)] font-mono text-sm">
            <div className="mb-2">No matches found</div>
            <div className="text-xs">Try a title, source, or part of the URL</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="max-w-5xl mx-auto space-y-1.5">
          {filteredDigests.map((digest) => (
            <button
              key={digest.id}
              onClick={() => setSelectedDigest(digest)}
              className="w-full rounded-xl border border-transparent px-4 py-3 hover:bg-[var(--hover)] hover:border-[var(--border)] transition-all duration-150 active:scale-[0.99] text-left flex items-center gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-[var(--text-primary)] leading-snug truncate group-hover:text-[var(--accent-text)] transition-colors">
                  {digest.title}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="truncate font-medium">{digest.domain}</span>
                  <span>·</span>
                  <span>{formatTimeAgo(digest.timestamp)}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] flex-shrink-0 transition-colors" />
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
