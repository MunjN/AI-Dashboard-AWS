import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const FiltersContext = createContext(null);
export const useFilters = () => useContext(FiltersContext);

// --- default empty filters (keep in sync with your app)
const DEFAULT_FILTERS = {
  // tech
  softwareType: null,
  expectedInput: null,
  generatedOutput: null,
  modelType: null,
  foundationalModel: null,
  inferenceLocation: null,
  hasApi: null,
  toolName: null,
  tasks: null,
  yearLaunchedRange: null,        // e.g. [1975, 2025]

  // business
  parentOrg: null,
  orgMaturity: null,
  fundingType: null,
  businessModel: null,
  ipCreationPotential: null,
  legalCasePending: null,
  yearCompanyFoundedRange: null   // e.g. [1950, 2025]
};

// ---------- URL state helpers ----------

function cleanStateForUrl(state) {
  // remove null/empty keys to keep URL short
  const cleaned = {};
  for (const [k, v] of Object.entries(state || {})) {
    if (v == null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    cleaned[k] = v;
  }
  return cleaned;
}

function serializeState(state) {
  try {
    const cleaned = cleanStateForUrl(state);
    const json = JSON.stringify(cleaned);
    return btoa(encodeURIComponent(json));
  } catch {
    return "";
  }
}

function deserializeState(str) {
  try {
    const json = decodeURIComponent(atob(str));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

// HashRouter puts query AFTER the hash, like:
// #/details?state=XXXX
function getHashParts() {
  const hash = window.location.hash || "";
  const noHash = hash.startsWith("#") ? hash.slice(1) : hash; // "/details?state=.."
  const [pathPart, queryPart = ""] = noHash.split("?");
  const params = new URLSearchParams(queryPart);
  return { pathPart: pathPart || "/", params };
}

function setStateParamInHash(nextStateStr) {
  const { pathPart, params } = getHashParts();
  if (nextStateStr) params.set("state", nextStateStr);
  else params.delete("state");
  const nextQuery = params.toString();
  const nextHash = nextQuery ? `#${pathPart}?${nextQuery}` : `#${pathPart}`;

  // replace so back-button isn't spammed
  window.history.replaceState(null, "", nextHash);
}

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const firstHydrateDone = useRef(false);

  // 1) Hydrate filters FROM URL on first load
  useEffect(() => {
    const { params } = getHashParts();
    const stateStr = params.get("state");
    if (!stateStr) {
      firstHydrateDone.current = true;
      return;
    }

    const urlState = deserializeState(stateStr);
    if (!urlState) {
      firstHydrateDone.current = true;
      return;
    }

    setFilters(prev => ({
      ...prev,
      ...urlState
    }));

    firstHydrateDone.current = true;
  }, []);

  // 2) Sync filters TO URL whenever they change
  useEffect(() => {
    if (!firstHydrateDone.current) return;

    const stateStr = serializeState(filters);
    setStateParamInHash(stateStr);
  }, [filters]);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const value = useMemo(
    () => ({ filters, setFilters, clearFilters, DEFAULT_FILTERS }),
    [filters]
  );

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
}
