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
import applyFilters from "../lib/applyFilters.js";

import { countByMulti, toChartData } from "../lib/aggregate.js";

/**
 * Utility: get a field from row OR row._raw, supporting case + snake fallback.
 */
function getField(r, field) {
  const direct = r?.[field];
  const raw =
    r?._raw?.[field] ??
    r?._raw?.[field?.toLowerCase()] ??
    r?._raw?.[field?.toUpperCase()] ??
    null;

  return direct ?? raw;
}

/**
 * Normalize multi-value fields:
 * - array => as-is
 * - string comma-separated => split
 */
function getMultiList(r, field) {
  const val = getField(r, field);
  if (Array.isArray(val)) return val.filter(Boolean).map(v => String(v).trim()).filter(Boolean);
  if (typeof val === "string") {
    return val.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export default function Details() {
  const { tools, loading } = useData();
  const { filters } = useFilters();

  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const filtered = useMemo(
    () => applyFilters(tools || [], filters),
    [tools, filters]
  );

  // Big chart ONLY on Details: Tools by Task (multi-count)
  const taskAgg = useMemo(() => {
    const map = countByMulti(filtered, r => getMultiList(r, "TASKS"));
    return toChartData(map, "key").sort((a, b) => b.count - a.count);
  }, [filtered]);

  return (
    <div className="flex w-full min-h-screen bg-[#f6f8fb]">
      <LeftRail
        onOpenFilters={() => setShowFilters(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
      />

      <div className="flex-1 p-6">
        {/* Big chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          {loading ? (
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
            Technology &amp; Capability
          </div>
          <ToolsTable data={filtered} />
        </div>
      </div>

      <FilterModal open={showFilters} onClose={() => setShowFilters(false)} />
      <BookmarkModal open={showBookmarks} onClose={() => setShowBookmarks(false)} />
    </div>
  );
}







