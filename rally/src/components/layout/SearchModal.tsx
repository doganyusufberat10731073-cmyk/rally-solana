import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { api } from '@/api/client';
import type { Activity } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      api.getActivities(query.trim())
        .then(res => setResults(res.items.slice(0, 5)))
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="h-5 w-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities by title, category, skills or city..."
            className="w-full bg-transparent text-primary-text placeholder:text-muted-text text-base outline-none focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-secondary-background rounded-full text-secondary-text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-muted-text bg-secondary-background rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results / Suggestions Container */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-secondary-text">Searching activities...</div>
          ) : query.trim() && results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-secondary-text mb-3">No activities matched "{query}"</p>
              <button
                onClick={() => {
                  navigate(`/discover?search=${encodeURIComponent(query)}`);
                  onClose();
                }}
                className="text-sm text-accent hover:underline inline-flex items-center gap-1"
              >
                Search all on Discover <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-secondary-text uppercase tracking-wider px-2">
                Activities ({results.length})
              </div>
              {results.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => {
                    navigate(`/activity/${activity.id}`);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary-background/80 transition-colors cursor-pointer group border border-transparent hover:border-border"
                >
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary-text group-hover:text-accent transition-colors truncate">
                        {activity.title}
                      </span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {activity.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-secondary-text">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {activity.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {activity.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-secondary-text shrink-0">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {activity.participants.length}/{activity.maxParticipants}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-text group-hover:text-accent transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
              
              <div className="pt-2 border-t border-border mt-3 flex justify-between items-center px-2">
                <span className="text-xs text-muted-text">Press Enter or click to view details</span>
                <button
                  onClick={() => {
                    navigate(`/discover?search=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  View full results on Discover <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 px-2">
              <p className="text-xs uppercase font-semibold text-secondary-text tracking-wider mb-3">
                Quick categories
              </p>
              <div className="flex flex-wrap gap-2">
                {['Gaming', 'Development', 'Sports', 'Learning', 'Creative'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      navigate(`/discover`);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-secondary-background hover:bg-card border border-border text-xs text-secondary-text hover:text-primary-text transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
