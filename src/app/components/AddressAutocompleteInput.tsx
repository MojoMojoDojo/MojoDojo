import { useEffect, useMemo, useRef, useState } from 'react';

export interface AddressSuggestion {
  id: string;
  primaryText: string;
  secondaryText?: string;
}

export interface AddressAutocompleteProviderContext {
  language: 'en' | 'fr';
}

export type AddressAutocompleteProvider = (
  query: string,
  context: AddressAutocompleteProviderContext
) => Promise<AddressSuggestion[]>;

const MAPBOX_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const defaultProvider: AddressAutocompleteProvider = async (query, context) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
  if (!token || query.trim().length < 3) return [];

  const language = context.language === 'fr' ? 'fr' : 'en';
  const endpoint = `${MAPBOX_API}/${encodeURIComponent(query)}.json`
    + `?access_token=${encodeURIComponent(token)}`
    + `&autocomplete=true`
    + `&types=address,place,postcode`
    + `&limit=6`
    + `&country=ca`
    + `&language=${language}`;

  const response = await fetch(endpoint);
  if (!response.ok) return [];

  const payload = await response.json() as {
    features?: Array<{ id?: string; text?: string; place_name?: string }>;
  };

  const features = payload.features ?? [];
  return features
    .filter((feature) => feature.place_name)
    .map((feature) => ({
      id: feature.id ?? feature.place_name ?? Math.random().toString(36).slice(2),
      primaryText: feature.place_name ?? feature.text ?? '',
      secondaryText: feature.text,
    }));
};

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: AddressSuggestion) => void;
  placeholder: string;
  required?: boolean;
  language: 'en' | 'fr';
  loadingText: string;
  noResultsText: string;
  startTypingText: string;
  provider?: AddressAutocompleteProvider;
}

export function AddressAutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  placeholder,
  required,
  language,
  loadingText,
  noResultsText,
  startTypingText,
  provider = defaultProvider,
}: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const hasQuery = value.trim().length >= 3;

  const contentState = useMemo<'start' | 'loading' | 'results' | 'empty'>(() => {
    if (!hasQuery) return 'start';
    if (isLoading) return 'loading';
    if (suggestions.length > 0) return 'results';
    return 'empty';
  }, [hasQuery, isLoading, suggestions.length]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const nextRequestId = requestRef.current + 1;
    requestRef.current = nextRequestId;

    if (!hasQuery) {
      setSuggestions([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setActiveIndex(-1);

      try {
        const nextSuggestions = await provider(value, { language });
        if (requestRef.current !== nextRequestId) return;
        setSuggestions(nextSuggestions);
      } catch {
        if (requestRef.current !== nextRequestId) return;
        setSuggestions([]);
      } finally {
        if (requestRef.current === nextRequestId) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [value, hasQuery, isOpen, provider, language]);

  const handleSuggestionSelection = (suggestion: AddressSuggestion) => {
    onChange(suggestion.primaryText);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (!isOpen || suggestions.length === 0) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
            return;
          }

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
            return;
          }

          if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < suggestions.length) {
            e.preventDefault();
            handleSuggestionSelection(suggestions[activeIndex]);
            return;
          }

          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        required={required}
        placeholder={placeholder}
        className="w-full bg-black border-2 border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:border-brand-gold focus:outline-none transition-colors"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 shadow-lg overflow-hidden">
          {contentState === 'start' && (
            <p className="px-4 py-3 text-xs text-zinc-400">{startTypingText}</p>
          )}

          {contentState === 'loading' && (
            <p className="px-4 py-3 text-xs text-zinc-300">{loadingText}</p>
          )}

          {contentState === 'empty' && (
            <p className="px-4 py-3 text-xs text-zinc-400">{noResultsText}</p>
          )}

          {contentState === 'results' && (
            <ul role="listbox" className="max-h-56 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionSelection(suggestion)}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${
                      activeIndex === index
                        ? 'bg-brand-gold/20 text-brand-off-white'
                        : 'text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <p className="text-sm leading-tight">{suggestion.primaryText}</p>
                    {suggestion.secondaryText && (
                      <p className="text-xs text-zinc-400 mt-0.5">{suggestion.secondaryText}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
