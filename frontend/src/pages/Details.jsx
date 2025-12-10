// import { useMemo, useState } from "react";
// import { useData } from "../context/DataContext.jsx";
// import { useFilters } from "../context/FiltersContext.jsx";
// import applyFilters from "../lib/applyFilters.js";
// import { countByMulti, toChartData } from "../lib/aggregate.js";
// import LeftRail from "../components/LeftRail.jsx";
// import FilterModal from "../components/FilterModal.jsx";
// import BookmarkModal from "../components/BookmarkModal.jsx"; // ✅ NEW
// import BarBlock from "../components/charts/BarBlock.jsx";
// import ToolsTable from "../components/ToolsTable.jsx";

// export default function Details() {
//   const { tools, loading, error } = useData();
//   const { filters } = useFilters();
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [bookmarksOpen, setBookmarksOpen] = useState(false); // ✅ NEW
//   const [tableView, setTableView] = useState("tech"); // tech | biz

//   const filtered = useMemo(() => applyFilters(tools, filters), [tools, filters]);

//   const infraCount = useMemo(
//     () => new Set(filtered.map(r => r.infraName).filter(Boolean)).size,
//     [filtered]
//   );
//   const parentOrgCount = useMemo(
//     () => new Set(filtered.map(r => r.parentOrg).filter(Boolean)).size,
//     [filtered]
//   );

//   const toolsByTask = useMemo(() => {
//     const kv = countByMulti(filtered, r => r.tasks || []);
//     return toChartData(kv, "task");
//   }, [filtered]);

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   return (
//     <div className="min-h-screen bg-white px-6 pt-6 flex items-start gap-6">
//       <LeftRail
//         infraCount={infraCount}
//         parentOrgCount={parentOrgCount}
//         onOpenFilters={() => setFiltersOpen(true)}
//         onOpenBookmarks={() => setBookmarksOpen(true)} // ✅ NEW
//         onSwitchView={() => setTableView(v => v === "tech" ? "biz" : "tech")}
//         viewLabel={tableView === "tech" ? "Technology & Capability" : "Business & Governance"}
//       />

//       <div className="flex-1">
//         <BarBlock
//           title="Tools by Task"
//           data={toolsByTask}
//           xKey="task"
//           filterKey="tasks"     // click bar filters Tasks
//           height={280}
//           horizontalLabels={false}
//         />

//         <div className="mt-6">
//           <h3 className="text-blue-700 font-semibold mb-2">
//             {tableView === "tech" ? "Technology & Capability" : "Business & Governance"}
//           </h3>
//           <ToolsTable rows={filtered} view={tableView} />
//         </div>
//       </div>

//       <FilterModal open={filtersOpen} onClose={() => setFiltersOpen(false)} allRows={tools} />

//       {/* ✅ NEW modal */}
//       <BookmarkModal open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
//     </div>
//   );
// }


import React, { useMemo, useState } from "react";
import LeftRail from "../components/LeftRail.jsx";
import FilterModal from "../components/FilterModal.jsx";
import BookmarkModal from "../components/BookmarkModal.jsx";
import ToolsTable from "../components/ToolsTable.jsx";
import BarBlock from "../components/charts/BarBlock.jsx";

import { useData } from "../context/DataContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { countByMulti, toChartData } from "../lib/aggregate.js";

/** field getter with raw fallback (keeps things safe) */
function getField(r, field) {
  const direct = r?.[field];
  const lower = r?.[field?.toLowerCase()];
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

/** Local filters that match your CSV schema */
function localApplyFilters(rows, filters) {
  const f = filters || {};
  const listFilter = (key, rowField) => {
    const selected = Array.isArray(f[key]) ? f[key] : [];
    if (!selected.length) return true;
    const rowVals = toList(getField(rowField.row, rowField.col));
    return rowVals.some(v => selected.includes(v));
  };
  const singleFilter = (key, col) => {
    const v = f[key];
    if (!v) return true;
    const rowVal = String(getField(col.row, col.col) || "").trim();
    return rowVal.toUpperCase() === String(v).trim().toUpperCase();
  };

  return rows.filter(row => {
    // Multi-selects
    if (!listFilter("softwareType", { row, col: "SOFTWARE_TYPE" })) return false;
    if (!listFilter("expectedInput", { row, col: "EXPECTED_INPUT" })) return false;
    if (!listFilter("generatedOutput", { row, col: "GENERATED_OUTPUT" })) return false;
    if (!listFilter("modelType", { row, col: "MODEL_PRIVATE_OR_PUBLIC" })) return false;
    if (!listFilter("foundationalModel", { row, col: "FOUNDATIONAL_MODEL" })) return false;
    if (!listFilter("inferenceLocation", { row, col: "INFERENCE_LOCATION" })) return false;
    if (!listFilter("tasks", { row, col: "TASKS" })) return false;
    if (!listFilter("toolName", { row, col: "NAME" })) return false;

    if (!listFilter("parentOrg", { row, col: "PARENT_ORGANIZATION" })) return false;
    if (!listFilter("orgMaturity", { row, col: "ORGANIZATION_MATURITY" })) return false;
    if (!listFilter("fundingType", { row, col: "FUNDING" })) return false;
    if (!listFilter("businessModel", { row, col: "BUSINESS_MODEL" })) return false;
    if (!listFilter("ipCreationPotential", { row, col: "POTENTIAL_FOR_IP" })) return false;

    // Single selects
    if (!singleFilter("legalCasePending", { row, col: "LEGAL_CASE_PENDING" })) return false;
    if (!singleFilter("hasApi", { row, col: "HAS_API" })) return false;

    return true;
  });
}

export default function Details() {
  const { tools, loading } = useData();
  const { filters } = useFilters();

  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // ✅ restore Tech/Biz switch state
  const [tableView, setTableView] = useState("tech"); // "tech" | "biz"
  const onSwitchView = () =>
    setTableView(v => (v === "tech" ? "biz" : "tech"));

  const toolsArr = useMemo(() => (Array.isArray(tools) ? tools : []), [tools]);

  const filtered = useMemo(
    () => localApplyFilters(toolsArr, filters),
    [toolsArr, filters]
  );

  const taskAgg = useMemo(() => {
    const map = countByMulti(filtered, r => toList(getField(r, "TASKS")));
    const chart = toChartData(map, "key");
    return Array.isArray(chart) ? chart.sort((a, b) => b.count - a.count) : [];
  }, [filtered]);

  return (
    <div className="flex w-full min-h-screen bg-[#f6f8fb]">
      <LeftRail
        onOpenFilters={() => setShowFilters(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onSwitchView={onSwitchView}
        viewLabel={tableView === "tech" ? "Technology View" : "Business View"}
        infraCount={filtered.length}
        parentOrgCount={
          new Set(
            filtered
              .map(r => getField(r, "PARENT_ORGANIZATION"))
              .filter(Boolean)
          ).size
        }
      />

      <div className="flex-1 p-6">
        {/* Big chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          {loading || !toolsArr.length ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <BarBlock
              title="Tools by Task"
              data={taskAgg}
              labelKey="key"
              filterKey="tasks"
              height={420}
              rotateLabels
              maxBarSize={48}
            />
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="text-lg font-semibold text-[#232073] mb-2">
            {tableView === "tech"
              ? "Technology & Capability"
              : "Business & Organization"}
          </div>

          {loading || !toolsArr.length ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <ToolsTable data={filtered} view={tableView} />
          )}
        </div>
      </div>

      <FilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        allRows={toolsArr}
      />
      <BookmarkModal open={showBookmarks} onClose={() => setShowBookmarks(false)} />
    </div>
  );
}












