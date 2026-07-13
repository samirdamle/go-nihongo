const HISTORY_KEY = "go-nihongo:history:v1";
const FAVORITES_KEY = "go-nihongo:favorites:v1";
const MAX_HISTORY = 100;

export type HistoryItem = {
  id: string;
  q: string;
  mode: string;
  kind: string;
  summary: string;
  ts: number;
};

export type FavoriteItem = {
  entryId: string;
  japanese: string;
  romaji: string;
  gloss: string;
  ts: number;
};

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function pushHistory(item: Omit<HistoryItem, "id" | "ts">): HistoryItem[] {
  const next: HistoryItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
  };
  const list = [next, ...loadHistory()].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(item: Omit<FavoriteItem, "ts">): FavoriteItem[] {
  const list = loadFavorites();
  const exists = list.some((f) => f.entryId === item.entryId);
  const next = exists
    ? list.filter((f) => f.entryId !== item.entryId)
    : [{ ...item, ts: Date.now() }, ...list];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function isFavorite(entryId: string): boolean {
  return loadFavorites().some((f) => f.entryId === entryId);
}
