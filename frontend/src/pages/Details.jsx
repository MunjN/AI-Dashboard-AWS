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


import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import applyFilters from "../lib/applyFilters.js";
import { countByMulti, toChartData } from "../lib/aggregate.js";
import LeftRail from "../components/LeftRail.jsx";
import FilterModal from "../components/FilterModal.jsx";
import BookmarkModal from "../components/BookmarkModal.jsx";
import BarBlock from "../components/charts/BarBlock.jsx";
import ToolsTable from "../components/ToolsTable.jsx";

export default function Details() {
  const { tools, loading, error } = useData();
  const { filters } = useFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [tableView, setTableView] = useState("tech");

  const filtered = useMemo(() => applyFilters(tools, filters), [tools, filters]);

  const infraCount = filtered.length;
  const parentOrgCount = useMemo(() => {
    const set = new Set(filtered.map(r => r.parentOrg).filter(Boolean));
    return set.size;
  }, [filtered]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-me-orange">{error}</div>;

  // ✅ TOP CHART: Tools by Task (multi-count from tasks array)
  const toolsByTask = useMemo(() => {
    const map = countByMulti(filtered, r => r.tasks || []);
    const data = toChartData(map, { keyName: "key" });
    // sort descending so biggest tasks are leftmost
    return [...data].sort((a, b) => b.count - a.count);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-me-bg px-6 pt-6 flex items-start gap-6">
      <LeftRail
        infraCount={infraCount}
        parentOrgCount={parentOrgCount}
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        onSwitchView={() => setTableView(v => (v === "tech" ? "biz" : "tech"))}
        viewLabel={tableView === "tech" ? "Technology & Capability" : "Business & Governance"}
      />

      <div className="flex-1">
        {/* ✅ big Tools by Task chart */}
        <div className="bg-white rounded-md p-8 shadow-me border border-me-border">
          <h2 className="text-[20px] font-bold text-me-ink mb-6">
            Tools by Task
          </h2>

          <BarBlock
            title=""
            data={toolsByTask}
            xKey="key"
            filterKey="tasks"
            height={360}
            horizontalLabels={false}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-me-ink font-semibold mb-2">
            {tableView === "tech" ? "Technology & Capability" : "Business & Governance"}
          </h3>
          <ToolsTable rows={filtered} view={tableView} />
        </div>
      </div>

      <FilterModal open={filtersOpen} onClose={() => setFiltersOpen(false)} allRows={tools} />
      <BookmarkModal open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
    </div>
  );
}


