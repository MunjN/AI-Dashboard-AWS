const KEY = "ai_dashboard_bookmarks_v1";

export function getBookmarks() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBookmark(name, stateStr) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new Error("Bookmark name required");

  const existing = getBookmarks();

  const newBm = {
    id: crypto.randomUUID(),
    name: trimmed,
    stateStr,
    createdAt: Date.now()
  };

  const next = [newBm, ...existing].slice(0, 50); // cap at 50
  localStorage.setItem(KEY, JSON.stringify(next));
  return newBm;
}

export function deleteBookmark(id) {
  const existing = getBookmarks();
  const next = existing.filter(b => b.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function renameBookmark(id, newName) {
  const existing = getBookmarks();
  const next = existing.map(b =>
    b.id === id ? { ...b, name: newName.trim() } : b
  );
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearAllBookmarks() {
  localStorage.removeItem(KEY);
}
