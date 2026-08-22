export type SearchType = 'city' | 'activity';

export interface SearchFilters {
  // Flexible filter bag; use descriptive keys in callers
  [key: string]: unknown;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: number;
}

const HISTORY_KEY = (type: SearchType) => `globeTrotter.search.${type}.history`;

const MAX_HISTORY_ITEMS = 10;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function serializeFilters(filters: SearchFilters): string {
  try {
    return JSON.stringify(filters, Object.keys(filters).sort());
  } catch {
    return '';
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const searchUtils = {
  getHistory(type: SearchType): SearchHistoryItem[] {
    return safeParse<SearchHistoryItem[]>(localStorage.getItem(HISTORY_KEY(type)), []);
  },

  addHistory(type: SearchType, query: string, filters: SearchFilters): SearchHistoryItem[] {
    const history = searchUtils.getHistory(type);
    const key = `${query.trim().toLowerCase()}|${serializeFilters(filters)}`;

    // De-duplicate on same query+filters
    const deduped = history.filter(
      (h) => `${h.query.trim().toLowerCase()}|${serializeFilters(h.filters)}` !== key
    );

    const item: SearchHistoryItem = {
      id: generateId('hist'),
      query,
      filters,
      timestamp: Date.now()
    };

    const next = [item, ...deduped].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY(type), JSON.stringify(next));
    return next;
  },

  clearHistory(type: SearchType): void {
    localStorage.removeItem(HISTORY_KEY(type));
  },

  removeHistoryItem(type: SearchType, id: string): SearchHistoryItem[] {
    const history = searchUtils.getHistory(type).filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY(type), JSON.stringify(history));
    return history;
  }
};


