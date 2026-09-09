const KEY = "recently-viewed:v1";
const MAX = 8;

export function pushRecentlyViewed(productId: string) {
  try {
    const list = readRecentlyViewed().filter((id) => id !== productId);
    list.unshift(productId);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage unavailable */
  }
}

export function readRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

const SEARCH_KEY = "recent-searches:v1";

export function pushRecentSearch(term: string) {
  const clean = term.trim();
  if (!clean) return;
  try {
    const list = readRecentSearches().filter((t) => t !== clean);
    list.unshift(clean);
    localStorage.setItem(SEARCH_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* storage unavailable */
  }
}

export function readRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}
