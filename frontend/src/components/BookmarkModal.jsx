import { useEffect, useMemo, useState } from "react";
import { useFilters } from "../context/FiltersContext.jsx";
import { getBookmarks, saveBookmark, deleteBookmark, renameBookmark } from "../lib/bookmarks.js";

export default function BookmarkModal({ open, onClose }) {
  const { filters, setFilters, DEFAULT_FILTERS } = useFilters();

  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setItems(getBookmarks());
  }, [open]);

  const currentStateStr = useMemo(() => {
    try {
      const cleaned = {};
      for (const [k, v] of Object.entries(filters || {})) {
        if (v == null) continue;
        if (Array.isArray(v) && v.length === 0) continue;
        cleaned[k] = v;
      }
      return btoa(encodeURIComponent(JSON.stringify(cleaned)));
    } catch {
      return "";
    }
  }, [filters]);

  if (!open) return null;

  const onSave = () => {
    setError("");
    try {
      saveBookmark(name, currentStateStr);
      setName("");
      setItems(getBookmarks());
    } catch (e) {
      setError(e.message || "Failed to save bookmark");
    }
  };

  const onLoad = (stateStr) => {
    try {
      const parsed = JSON.parse(decodeURIComponent(atob(stateStr)));
      setFilters(prev => ({ ...DEFAULT_FILTERS, ...parsed }));
      onClose();
    } catch {
      setError("Bookmark data looks corrupted.");
    }
  };

  const onDelete = (id) => {
    deleteBookmark(id);
    setItems(getBookmarks());
  };

  const onRename = (id, oldName) => {
    const nextName = prompt("Rename bookmark:", oldName);
    if (!nextName) return;
    renameBookmark(id, nextName);
    setItems(getBookmarks());
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-blue-950">Bookmarks</div>
          <button
            onClick={onClose}
            className="text-xl text-blue-900/70 hover:text-blue-900"
          >
            ✕
          </button>
        </div>

        {/* Save current view */}
        <div className="border rounded-xl p-4 mb-5 bg-slate-50">
          <div className="text-sm font-semibold mb-2 text-blue-950">
            Save current view
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Bookmark name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-800"
            >
              Save
            </button>
          </div>

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>

        {/* List bookmarks */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {items.length === 0 && (
            <div className="text-sm text-slate-500">
              No bookmarks yet. Save your first view above.
            </div>
          )}

          {items.map(b => (
            <div
              key={b.id}
              className="border rounded-xl p-3 flex items-center justify-between hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="font-semibold text-blue-950 truncate">
                  {b.name}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onLoad(b.stateStr)}
                  className="px-3 py-1 text-sm rounded-lg bg-blue-100 text-blue-900 hover:bg-blue-200"
                >
                  Load
                </button>
                <button
                  onClick={() => onRename(b.id, b.name)}
                  className="px-3 py-1 text-sm rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200"
                >
                  Rename
                </button>
                <button
                  onClick={() => onDelete(b.id)}
                  className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
