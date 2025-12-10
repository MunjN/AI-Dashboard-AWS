// import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import Cookies from "js-cookie";

// const MAX_SELECT = 10;

// export default function ToolsTable({ rows = [], view = "tech" }) {
//   const [selectedIds, setSelectedIds] = useState([]);
//   const [creditsLeft, setCreditsLeft] = useState(null); // null until first export response
//   const [msg, setMsg] = useState("");
//   const [exporting, setExporting] = useState(false);

//   // Reset selection if rows change a lot (filters, etc.)
//   useEffect(() => {
//     setSelectedIds([]);
//     setMsg("");
//   }, [rows]);

//   const allIdsOnPage = useMemo(() => {
//     return rows
//       .map(r => r?._raw?.INFRA_ID || r?._raw?.infra_id || r?.infraId)
//       .filter(Boolean);
//   }, [rows]);

//   // How many we can select on this page (cap to 10)
//   const cappedIdsOnPage = useMemo(
//     () => allIdsOnPage.slice(0, MAX_SELECT),
//     [allIdsOnPage]
//   );

//   // Are we currently selecting "all we can" on this page?
//   const isSelectingAllCapped = useMemo(() => {
//     if (!cappedIdsOnPage.length) return false;
//     if (selectedIds.length !== cappedIdsOnPage.length) return false;
//     return cappedIdsOnPage.every(id => selectedIds.includes(id));
//   }, [selectedIds, cappedIdsOnPage]);

//   const toggleOne = (id) => {
//     setMsg("");
//     setSelectedIds(prev => {
//       const has = prev.includes(id);
//       if (has) return prev.filter(x => x !== id);

//       if (prev.length >= MAX_SELECT) {
//         setMsg(`You can only select up to ${MAX_SELECT} tools per export.`);
//         return prev;
//       }
//       return [...prev, id];
//     });
//   };

//   const toggleAll = () => {
//     setMsg("");

//     setSelectedIds(prev => {
//       // if we already selected the capped set, clicking again clears
//       if (isSelectingAllCapped) return [];

//       // otherwise select first MAX_SELECT
//       return cappedIdsOnPage;
//     });

//     if (allIdsOnPage.length > MAX_SELECT && !isSelectingAllCapped) {
//       setMsg(`Select All grabbed the first ${MAX_SELECT} results (export cap).`);
//     }
//   };

//   async function exportSelected() {
//     setMsg("");

//     if (!selectedIds.length) {
//       setMsg("Select at least one tool first.");
//       return;
//     }

//     // UI-side cap (extra safety)
//     if (selectedIds.length > MAX_SELECT) {
//       setMsg(`You can only export up to ${MAX_SELECT} tools at a time.`);
//       return;
//     }

//     // Credits are now PER TOOL, not per request
//     if (creditsLeft != null && selectedIds.length > creditsLeft) {
//       setMsg(
//         `You only have ${creditsLeft} export credits left in the last 24h. ` +
//         `Reduce selection to ${creditsLeft} or fewer.`
//       );
//       return;
//     }

//     if (creditsLeft === 0) {
//       setMsg("You’ve hit your export limit for the last 24 hours.");
//       return;
//     }

//     const jwt = Cookies.get("idToken");
//     if (!jwt) {
//       setMsg("Missing login token. Please sign out and sign in again.");
//       return;
//     }

//     setExporting(true);

//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE}/api/export`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${jwt}`
//           },
//           body: JSON.stringify({
//             infraIds: selectedIds,
//             format: "json"
//           })
//         }
//       );

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         // backend may return exportsLeft even on errors
//         if (data.exportsLeft != null) setCreditsLeft(data.exportsLeft);
//         setMsg(data.error || "Export failed.");
//         return;
//       }

//       const exportedRows = data.rows || [];
//       const left = data.exportsLeft;

//       setCreditsLeft(left);

//       // download json
//       const blob = new Blob(
//         [JSON.stringify(exportedRows, null, 2)],
//         { type: "application/json" }
//       );
//       downloadBlob(blob, `ai-tools-export-${Date.now()}.json`);

//       setMsg(
//         `Exported ${exportedRows.length} tools. Credits left (24h): ${left}.`
//       );
//       setSelectedIds([]);
//     } catch (e) {
//       setMsg(e.message || "Export failed.");
//     } finally {
//       setExporting(false);
//     }
//   }

//   return (
//     <div className="w-full">
//       {/* Top bar */}
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center gap-3 text-sm">
//           <button
//             onClick={toggleAll}
//             className="px-2 py-1 rounded-md border text-blue-900 hover:bg-blue-50"
//           >
//             {isSelectingAllCapped ? "Clear All" : "Select All"}
//           </button>

//           <div className="text-blue-900/80">
//             Selected: <b>{selectedIds.length}</b> / {MAX_SELECT}
//           </div>

//           <div className="text-blue-900/60">
//             Credits left (24h):{" "}
//             <b>{creditsLeft == null ? "—" : creditsLeft}</b>
//           </div>
//         </div>

//         <button
//           onClick={exportSelected}
//           disabled={exporting}
//           className={`px-4 py-2 rounded-lg text-sm font-semibold transition
//             ${exporting
//               ? "bg-blue-200 text-blue-900"
//               : "bg-blue-700 text-white hover:bg-blue-800"}
//           `}
//         >
//           Export JSON
//         </button>
//       </div>

//       {msg && (
//         <div className="text-sm mb-3 text-red-600">
//           {msg}
//         </div>
//       )}

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-xl">
//         <table className="w-full text-sm">
//           <thead className="bg-slate-50">
//             <tr>
//               <th className="p-2 w-10"></th>
//               <th className="p-2 text-left">Tool Name</th>
//               <th className="p-2 text-left">Tasks</th>
//               <th className="p-2 text-left">Software Type</th>
//               <th className="p-2 text-left">Expected Input</th>
//               <th className="p-2 text-left">Generated Output</th>
//               {view === "tech" ? (
//                 <th className="p-2 text-left">Model Type</th>
//               ) : (
//                 <>
//                   <th className="p-2 text-left">Parent Org</th>
//                   <th className="p-2 text-left">Funding</th>
//                 </>
//               )}
//               <th className="p-2 text-left w-14">View</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((r, idx) => {
//               const id =
//                 r?._raw?.INFRA_ID ||
//                 r?._raw?.infra_id ||
//                 r?.infraId ||
//                 r?.toolName ||
//                 `${idx}`;

//               const checked = selectedIds.includes(id);

//               return (
//                 <tr key={id} className="border-t">
//                   <td className="p-2">
//                     <input
//                       type="checkbox"
//                       checked={checked}
//                       onChange={() => toggleOne(id)}
//                     />
//                   </td>

//                   <td className="p-2 font-semibold text-blue-700">
//                     {r?.toolName || "—"}
//                   </td>

//                   <td className="p-2">
//                     {(r?.tasks || []).join(", ") || "—"}
//                   </td>

//                   <td className="p-2">
//                     {r?.softwareType || "—"}
//                   </td>

//                   <td className="p-2">
//                     {(r?.expectedInput || []).join(", ") || "—"}
//                   </td>

//                   <td className="p-2">
//                     {(r?.generatedOutput || []).join(", ") || "—"}
//                   </td>

//                   {view === "tech" ? (
//                     <td className="p-2">{r?.modelType || "—"}</td>
//                   ) : (
//                     <>
//                       <td className="p-2">{r?.parentOrg || "—"}</td>
//                       <td className="p-2">{r?.fundingType || "—"}</td>
//                     </>
//                   )}

//                   <td className="p-2">
//                     <Link
//                       to={`/tool/${encodeURIComponent(id)}`}
//                       className="text-blue-700 hover:underline"
//                     >
//                       👁
//                     </Link>
//                   </td>
//                 </tr>
//               );
//             })}

//             {!rows.length && (
//               <tr>
//                 <td className="p-4 text-blue-900/70" colSpan={9}>
//                   No results.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function downloadBlob(blob, filename) {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

const MAX_SELECT = 10;

/** Safely read from camelCase OR _raw uppercase CSV */
function getField(r, field) {
  if (!r) return null;
  const direct = r[field];
  const lower = r[field?.toLowerCase()];
  const raw =
    r?._raw?.[field] ??
    r?._raw?.[field?.toLowerCase()] ??
    r?._raw?.[field?.toUpperCase()];
  return direct ?? lower ?? raw ?? null;
}

function toList(val) {
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === "string")
    return val.split(",").map(s => s.trim()).filter(Boolean);
  if (val == null || val === "") return [];
  return [String(val).trim()];
}

export default function ToolsTable({ rows, data, view = "tech" }) {
  // ✅ accept either prop name
  const baseRows = useMemo(() => {
    const r = rows ?? data ?? [];
    return Array.isArray(r) ? r : [];
  }, [rows, data]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [creditsLeft, setCreditsLeft] = useState(null);
  const [msg, setMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState("");

  // reset selection when filters/data change
  useEffect(() => {
    setSelectedIds([]);
    setMsg("");
  }, [baseRows]);

  // load credits on first view (safe if 404)
  useEffect(() => {
    async function loadCredits() {
      try {
        const jwt = Cookies.get("idToken");
        if (!jwt) return;

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/api/exports-left`,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );

        if (!res.ok) return;
        const json = await res.json();
        if (typeof json?.exportsLeft === "number") {
          setCreditsLeft(json.exportsLeft);
        }
      } catch {
        // silent
      }
    }
    loadCredits();
  }, []);

  // ✅ search filter (upper + camel fallback)
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseRows;

    return baseRows.filter(r => {
      const name = String(
        getField(r, "NAME") ??
          getField(r, "TOOL_NAME") ??
          getField(r, "infraName") ??
          getField(r, "toolName") ??
          ""
      ).toLowerCase();

      const parent = String(
        getField(r, "PARENT_ORGANIZATION") ??
          getField(r, "PARENT_ORG") ??
          getField(r, "parentOrg") ??
          ""
      ).toLowerCase();

      const aiType = String(
        getField(r, "AI_TYPE") ??
          getField(r, "aiType") ??
          ""
      ).toLowerCase();

      return name.includes(q) || parent.includes(q) || aiType.includes(q);
    });
  }, [baseRows, query]);

  const allIdsOnPage = useMemo(() => {
    return filteredRows
      .map((r, i) =>
        getField(r, "INFRA_ID") ??
        getField(r, "TOOL_ID") ??
        getField(r, "ID") ??
        r?.infraId ??
        i
      )
      .filter(v => v !== null && v !== undefined);
  }, [filteredRows]);

  const cappedIdsOnPage = useMemo(
    () => allIdsOnPage.slice(0, MAX_SELECT),
    [allIdsOnPage]
  );

  const isSelectingAllCapped = useMemo(() => {
    if (!cappedIdsOnPage.length) return false;
    if (selectedIds.length !== cappedIdsOnPage.length) return false;
    return cappedIdsOnPage.every(id => selectedIds.includes(id));
  }, [cappedIdsOnPage, selectedIds]);

  function toggleAllCapped() {
    if (isSelectingAllCapped) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cappedIdsOnPage);
    }
  }

  function toggleOne(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function doExport(format = "csv") {
    try {
      setExporting(true);
      setMsg("");

      const jwt = Cookies.get("idToken");
      if (!jwt) {
        setMsg("No session token. Please sign in again.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/export`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            infraIds: selectedIds,
            format
          })
        }
      );

      const text = await res.text();
      if (!res.ok) {
        setMsg(text || "Export failed.");
        return;
      }

      let parsedJson = null;
      try {
        parsedJson = JSON.parse(text);
        if (typeof parsedJson?.exportsLeft === "number") {
          setCreditsLeft(parsedJson.exportsLeft);
        }
      } catch {}

      if (format === "csv") {
        if (parsedJson?.rows?.length) {
          const keys = Object.keys(parsedJson.rows[0]);
          const csv =
            keys.join(",") +
            "\n" +
            parsedJson.rows
              .map(row =>
                keys.map(k => JSON.stringify(row[k] ?? "")).join(",")
              )
              .join("\n");

          const blob = new Blob([csv], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "export.csv";
          a.click();
        } else {
          const blob = new Blob([text], { type: "text/csv" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "export.csv";
          a.click();
        }
      } else {
        const json = parsedJson || {};
        const blob = new Blob([JSON.stringify(json, null, 2)], {
          type: "application/json"
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "export.json";
        a.click();
      }

      const leftHeader = res.headers.get("x-exports-left");
      if (leftHeader != null) setCreditsLeft(Number(leftHeader));
    } catch (e) {
      console.error(e);
      setMsg("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Top controls row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelectingAllCapped}
              onChange={toggleAllCapped}
            />
            Select up to {MAX_SELECT}
          </label>

          <button
            disabled={!selectedIds.length || exporting}
            onClick={() => doExport("csv")}
            className="px-3 py-1 rounded-sm border border-me-ink text-me-ink hover:bg-me-sky transition disabled:opacity-50"
          >
            Export CSV
          </button>

          <button
            disabled={!selectedIds.length || exporting}
            onClick={() => doExport("json")}
            className="px-3 py-1 rounded-sm border border-me-ink text-me-ink hover:bg-me-sky transition disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>

        <div className="text-me-text text-sm">
          Credits left: {creditsLeft == null ? "—" : creditsLeft}
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools by name, parent org, or AI type…"
          className="w-full md:w-[420px] px-3 py-2 rounded-md border border-me-border bg-white shadow-me outline-none focus:ring-2 focus:ring-me-sky-strong"
        />
        {query.trim() && (
          <div className="text-xs text-me-text mt-1">
            Showing {filteredRows.length} of {baseRows.length}
          </div>
        )}
      </div>

      {msg && <div className="text-sm mb-3 text-me-orange">{msg}</div>}

      <div className="overflow-x-auto border border-me-border rounded-md bg-white shadow-me">
        <table className="w-full text-sm">
          <thead className="bg-me-sky text-me-ink">
            <tr>
              <th className="p-2 w-10"></th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">AI Type</th>
              {view === "tech" ? (
                <>
                  <th className="p-2 text-left">Tasks</th>
                  <th className="p-2 text-left">Inference Location</th>
                  <th className="p-2 text-left">Model Type</th>
                  <th className="p-2 text-left w-14">API</th>
                </>
              ) : (
                <>
                  <th className="p-2 text-left">Org Maturity</th>
                  <th className="p-2 text-left">Parent Org</th>
                  <th className="p-2 text-left">Business Model</th>
                  <th className="p-2 text-left">Funding</th>
                </>
              )}
              <th className="p-2 text-left w-16">Details</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((r, i) => {
              const id =
                getField(r, "INFRA_ID") ??
                getField(r, "TOOL_ID") ??
                getField(r, "ID") ??
                r?.infraId ??
                i;

              const checked = selectedIds.includes(id);

              const rawHasApi = String(getField(r, "HAS_API") || "")
                .toUpperCase()
                .trim();

              const hasApiBool =
                rawHasApi
                  ? rawHasApi === "YES"
                  : typeof r.hasApi === "boolean"
                  ? r.hasApi
                  : false;

              const name =
                getField(r, "NAME") ??
                getField(r, "TOOL_NAME") ??
                r.infraName ??
                r.toolName ??
                "—";

              const aiType =
                getField(r, "AI_TYPE") ??
                r.aiType ??
                "—";

              const tasks =
                toList(getField(r, "TASKS") ?? r.tasks).join(", ") || "—";

              const inference =
                getField(r, "INFERENCE_LOCATION") ??
                r.inferenceLocation ??
                "—";

              const modelType =
                getField(r, "MODEL_PRIVATE_OR_PUBLIC") ??
                getField(r, "MODEL_TYPE") ??
                r.modelType ??
                "—";

              const orgMaturity =
                getField(r, "ORGANIZATION_MATURITY") ??
                r.orgMaturity ??
                "—";

              const parentOrg =
                getField(r, "PARENT_ORGANIZATION") ??
                r.parentOrg ??
                "—";

              const businessModel =
                getField(r, "BUSINESS_MODEL") ??
                r.businessModel ??
                "—";

              const funding =
                getField(r, "FUNDING") ??
                r.fundingType ??
                "—";

              return (
                <tr
                  key={id}
                  className="border-t border-me-border hover:bg-me-rowhover transition"
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && selectedIds.length >= MAX_SELECT}
                      onChange={() => toggleOne(id)}
                    />
                  </td>

                  <td className="p-2 font-semibold text-me-ink">{name}</td>
                  <td className="p-2 text-me-text">{aiType}</td>

                  {view === "tech" ? (
                    <>
                      <td className="p-2 text-me-text">{tasks}</td>
                      <td className="p-2 text-me-text">{inference}</td>
                      <td className="p-2 text-me-text">{modelType}</td>
                      <td className="p-2 text-center">
                        {hasApiBool ? "✅" : "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-me-text">{orgMaturity}</td>
                      <td className="p-2 text-me-text">{parentOrg}</td>
                      <td className="p-2 text-me-text">{businessModel}</td>
                      <td className="p-2 text-me-text">{funding}</td>
                    </>
                  )}

                  <td className="p-2">
                    <Link
                      to={`/tool/${encodeURIComponent(id)}`}
                      className="text-me-ink hover:text-me-orange font-semibold"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}

            {!filteredRows.length && (
              <tr>
                <td colSpan={9} className="p-4 text-me-text">
                  No tools match your search/filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}






