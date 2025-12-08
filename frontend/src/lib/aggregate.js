// Count ALL rows by a single key
export function countBy(rows, keyFn) {
  const map = new Map();
  rows.forEach(r => {
    const k = keyFn(r);
    if (k == null || k === "") return;
    map.set(k, (map.get(k) || 0) + 1);
  });
  return map;
}

// Count UNIQUE items (e.g. unique parentOrg per funding bucket)
export function countUniqueBy(rows, keyFn, uniqueFn) {
  const buckets = new Map();
  rows.forEach(r => {
    const k = keyFn(r);
    const u = uniqueFn(r);
    if (k == null || k === "" || u == null || u === "") return;
    if (!buckets.has(k)) buckets.set(k, new Set());
    buckets.get(k).add(u);
  });

  const map = new Map();
  for (const [k, set] of buckets.entries()) {
    map.set(k, set.size);
  }
  return map;
}

// Count by multiple values (arrays)
export function countByMulti(rows, keyListFn) {
  const map = new Map();
  rows.forEach(r => {
    const list = keyListFn(r) || [];
    list.forEach(k => {
      if (k == null || k === "") return;
      map.set(k, (map.get(k) || 0) + 1);
    });
  });
  return map;
}

/**
 * Convert Map -> [{keyName: ..., count: ...}]
 * Sorting rules:
 *  - if 80%+ keys look numeric => sort numerically ascending
 *  - else sort alphabetically
 */
export function toChartData(map, keyName = "key") {
  const entries = Array.from(map.entries());

  // remove null/empty + normalize key
  const cleaned = entries
    .filter(([k]) => k != null && String(k).trim() !== "")
    .map(([k, v]) => [k, v]);

  // detect numeric keys
  const nums = cleaned.map(([k]) => Number(k));
  const numericCount = nums.filter(n => Number.isFinite(n)).length;
  const mostlyNumeric = cleaned.length > 0 && (numericCount / cleaned.length) >= 0.8;

  cleaned.sort((a, b) => {
    const [ka] = a;
    const [kb] = b;

    if (mostlyNumeric) return Number(ka) - Number(kb);

    return String(ka).localeCompare(String(kb));
  });

  return cleaned.map(([k, v]) => ({
    [keyName]: mostlyNumeric ? Number(k) : k,
    count: v
  }));
}
