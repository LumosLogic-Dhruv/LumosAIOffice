import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, BookOpen, X, Command } from 'lucide-react';
import api from '../services/api';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'document' | 'client' | 'catalog';
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const BRAND = '#714B67';

const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const lower = q.toLowerCase();
      const [docsRes, clientsRes, catalogRes] = await Promise.allSettled([
        api.get('/documents'),
        api.get('/clients'),
        api.get('/catalog'),
      ]);

      const matched: SearchResult[] = [];

      if (docsRes.status === 'fulfilled') {
        const docs: any[] = docsRes.value.data?.documents ?? docsRes.value.data ?? [];
        docs
          .filter((d: any) =>
            d.title?.toLowerCase().includes(lower) ||
            d.clientName?.toLowerCase().includes(lower) ||
            d.type?.toLowerCase().includes(lower)
          )
          .slice(0, 5)
          .forEach((d: any) => {
            matched.push({
              id: d._id ?? d.id,
              title: d.title ?? 'Untitled',
              subtitle: [d.clientName, d.type].filter(Boolean).join(' · '),
              type: 'document',
              path: `/dashboard/documents/${d._id ?? d.id}`,
            });
          });
      }

      if (clientsRes.status === 'fulfilled') {
        const clients: any[] = clientsRes.value.data?.clients ?? clientsRes.value.data ?? [];
        clients
          .filter((c: any) =>
            c.name?.toLowerCase().includes(lower) ||
            c.email?.toLowerCase().includes(lower)
          )
          .slice(0, 5)
          .forEach((c: any) => {
            matched.push({
              id: c._id ?? c.id,
              title: c.name ?? 'Unknown',
              subtitle: c.email ?? '',
              type: 'client',
              path: `/dashboard/clients`,
            });
          });
      }

      if (catalogRes.status === 'fulfilled') {
        const items: any[] = catalogRes.value.data?.items ?? catalogRes.value.data ?? [];
        items
          .filter((i: any) =>
            i.name?.toLowerCase().includes(lower) ||
            i.category?.toLowerCase().includes(lower)
          )
          .slice(0, 5)
          .forEach((i: any) => {
            matched.push({
              id: i._id ?? i.id,
              title: i.name ?? 'Item',
              subtitle: i.category ?? '',
              type: 'catalog',
              path: `/dashboard/catalog`,
            });
          });
      }

      setResults(matched);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  if (!open) return null;

  const documents = results.filter(r => r.type === 'document');
  const clients = results.filter(r => r.type === 'client');
  const catalog = results.filter(r => r.type === 'catalog');

  const sectionIcon = {
    document: FileText,
    client: Users,
    catalog: BookOpen,
  };

  const sections = [
    { label: 'Documents', icon: FileText, items: documents },
    { label: 'Clients', icon: Users, items: clients },
    { label: 'Catalog', icon: BookOpen, items: catalog },
  ];

  const hasResults = results.length > 0;
  const showEmptyState = query.trim().length > 0 && !loading && !hasResults;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '70vh' }}
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search documents, clients, catalog..."
            className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
          {!query.trim() && (
            <div className="px-5 py-10 text-center">
              <Search size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Start typing to search across your documents, clients, and catalog.</p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-mono flex items-center gap-1">
                  <Command size={10} /> K
                </kbd>
                <span className="text-xs text-gray-400">to open · Esc to close</span>
              </div>
            </div>
          )}

          {showEmptyState && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-500">No results for <strong>"{query}"</strong></p>
              <p className="text-xs text-gray-400 mt-1">Try a different keyword.</p>
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {sections.map(({ label, icon: Icon, items }) => {
                if (items.length === 0) return null;
                return (
                  <div key={label}>
                    <div className="px-4 py-2 flex items-center gap-1.5">
                      <Icon size={11} className="text-gray-400" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
                    </div>
                    {items.map((result) => {
                      const ItemIcon = sectionIcon[result.type];
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: '#F3EDF1' }}
                          >
                            <ItemIcon size={14} style={{ color: BRAND }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-gray-900">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
