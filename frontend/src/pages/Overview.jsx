// import { useMemo, useState } from "react";
// import { useData } from "../context/DataContext.jsx";
// import { useFilters } from "../context/FiltersContext.jsx";
// import applyFilters from "../lib/applyFilters.js";
// import { countBy, countUniqueBy, toChartData } from "../lib/aggregate.js";
// import LeftRail from "../components/LeftRail.jsx";
// import FilterModal from "../components/FilterModal.jsx";
// import BookmarkModal from "../components/BookmarkModal.jsx"; // ✅ NEW
// import BarBlock from "../components/charts/BarBlock.jsx";
// import LineBlock from "../components/charts/LineBlock.jsx";
// import PieBlock from "../components/charts/PieBlock.jsx";
// import VennBlock from "../components/VennBlock.jsx";

// export default function Overview() {
//   const { tools, loading, error } = useData();
//   const { filters, setFilters } = useFilters();
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [bookmarksOpen, setBookmarksOpen] = useState(false); // ✅ NEW

//   const filtered = useMemo(() => applyFilters(tools, filters), [tools, filters]);

//   const infraCount = useMemo(
//     () => new Set(filtered.map(r => r.infraName).filter(Boolean)).size,
//     [filtered]
//   );
//   const parentOrgCount = useMemo(
//     () => new Set(filtered.map(r => r.parentOrg).filter(Boolean)).size,
//     [filtered]
//   );

//   // --- Aggregations ---
//   const providersByFunding = useMemo(() => {
//     const kv = countUniqueBy(filtered, r => r.fundingType, r => r.parentOrg);
//     return toChartData(kv, "funding");
//   }, [filtered]);

//   const toolsByFM = useMemo(() => {
//     const kv = countBy(filtered, r => r.foundationalModel);
//     return toChartData(kv, "fm");
//   }, [filtered]);

//   const toolsLaunchedByYear = useMemo(() => {
//     const kv = countBy(filtered, r => r.yearLaunched);
//     return toChartData(kv, "year");
//   }, [filtered]);

//   const companiesFoundedByYear = useMemo(() => {
//     const kv = countUniqueBy(filtered, r => r.yearCompanyFounded, r => r.parentOrg);
//     return toChartData(kv, "year");
//   }, [filtered]);

//   const ipPotential = useMemo(() => {
//     const kv = countBy(filtered, r => r.ipCreationPotential);
//     return toChartData(kv, "ip");
//   }, [filtered]);

//   const toolsByInference = useMemo(() => {
//     const kv = countBy(filtered, r => r.inferenceLocation);
//     return toChartData(kv, "inf");
//   }, [filtered]);

//   const providersByMaturity = useMemo(() => {
//     const kv = countUniqueBy(filtered, r => r.orgMaturity, r => r.parentOrg);
//     return toChartData(kv, "mat");
//   }, [filtered]);

//   // --- Venn numbers + buckets from FULL dataset (not filtered)
//   const venn = useMemo(() => {
//     const allVals = [...new Set(tools.map(t => t.softwareType).filter(Boolean))];

//     const cloudVals = [];
//     const desktopVals = [];
//     const bothVals = [];

//     allVals.forEach(v => {
//       const s = String(v).toLowerCase();
//       const hasCloud = s.includes("cloud");
//       const hasDesktop = s.includes("desktop");

//       if (hasCloud && hasDesktop) bothVals.push(v);
//       else if (hasCloud) cloudVals.push(v);
//       else if (hasDesktop) desktopVals.push(v);
//     });

//     let cloudOnly = 0, desktopOnly = 0, both = 0;
//     filtered.forEach(r => {
//       const s = String(r.softwareType || "").toLowerCase();
//       const hasCloud = s.includes("cloud");
//       const hasDesktop = s.includes("desktop");
//       if (hasCloud && hasDesktop) both += 1;
//       else if (hasCloud) cloudOnly += 1;
//       else if (hasDesktop) desktopOnly += 1;
//     });

//     return { cloudOnly, desktopOnly, both, cloudVals, desktopVals, bothVals };
//   }, [tools, filtered]);

//   const toggleSoftwareBucket = (bucketVals) => {
//     setFilters(prev => {
//       const cur = prev.softwareType || [];
//       const hasAny = bucketVals.some(v => cur.includes(v));
//       const next = hasAny
//         ? cur.filter(v => !bucketVals.includes(v))  // remove bucket
//         : [...new Set([...cur, ...bucketVals])];   // add bucket
//       return { ...prev, softwareType: next.length ? next : null };
//     });
//   };

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;

//   return (
//     <div className="min-h-screen bg-white px-6 pt-6 flex items-start gap-6">
//       <LeftRail
//         infraCount={infraCount}
//         parentOrgCount={parentOrgCount}
//         onOpenFilters={() => setFiltersOpen(true)}
//         onOpenBookmarks={() => setBookmarksOpen(true)} // ✅ NEW
//         onSwitchView={() => {}}
//         viewLabel="Overview"
//       />

//       <div className="flex-1 space-y-6">
//         {/* Top row */}
//         <div className="grid grid-cols-2 gap-6">
//           <BarBlock
//             title="Provider Orgs – Types of Funding"
//             data={providersByFunding}
//             xKey="funding"
//             filterKey="fundingType"
//           />
//           <BarBlock
//             title="Tools by Foundational Model"
//             data={toolsByFM}
//             xKey="fm"
//             filterKey="foundationalModel"
//           />
//         </div>

//         {/* Middle row */}
//         <div className="grid grid-cols-2 gap-6">
//           <LineBlock
//             title="Tools Launched by Year"
//             data={toolsLaunchedByYear}
//             xKey="year"
//             filterKey={null}   // keep blue but don't break range filters
//           />
//           <LineBlock
//             title="Companies Founded by Year"
//             data={companiesFoundedByYear}
//             xKey="year"
//             filterKey={null}
//           />
//         </div>

//         {/* Bottom row */}
//         <div className="grid grid-cols-4 gap-6">
//           <PieBlock
//             title="IP Creation Potential"
//             data={ipPotential}
//             labelKey="ip"
//             filterKey="ipCreationPotential"
//           />
//           <BarBlock
//             title="Tools by Inference Location"
//             data={toolsByInference}
//             xKey="inf"
//             filterKey="inferenceLocation"
//             horizontalLabels
//           />
//           <VennBlock
//             title="Tools by Software Type"
//             cloudOnly={venn.cloudOnly}
//             desktopOnly={venn.desktopOnly}
//             both={venn.both}
//             onClickCloud={() => toggleSoftwareBucket(venn.cloudVals)}
//             onClickDesktop={() => toggleSoftwareBucket(venn.desktopVals)}
//             onClickBoth={() => toggleSoftwareBucket(venn.bothVals)}
//           />
//           <PieBlock
//             title="Providers by Maturity"
//             data={providersByMaturity}
//             labelKey="mat"
//             filterKey="orgMaturity"
//           />
//         </div>
//       </div>

//       <FilterModal
//         open={filtersOpen}
//         onClose={() => setFiltersOpen(false)}
//         allRows={tools}
//       />

//       {/* ✅ NEW modal */}
//       <BookmarkModal open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
//     </div>
//   );
// }


import React, { useMemo, useState } from "react";
import LeftRail from "../components/LeftRail.jsx";
import FilterModal from "../components/FilterModal.jsx";
import BookmarkModal from "../components/BookmarkModal.jsx";

import BarBlock from "../components/charts/BarBlock.jsx";
import PieBlock from "../components/charts/PieBlock.jsx";
import LineBlock from "../components/charts/LineBlock.jsx";
import VennBlock from "../components/VennBlock.jsx";

import { useData } from "../context/DataContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import { countBy, countUniqueBy, toChartData } from "../lib/aggregate.js";

/** same helpers as Details */
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

function localApplyFilters(rows, filters) {
  const f = filters || {};
  const listFilter = (key, col) => {
    const selected = Array.isArray(f[key]) ? f[key] : [];
    if (!selected.length) return true;
    const rowVals = toList(getField(col.row, col.col));
    return rowVals.some(v => selected.includes(v));
  };
  const singleFilter = (key, col) => {
    const v = f[key];
    if (!v) return true;
    const rowVal = String(getField(col.row, col.col) || "").trim();
    return rowVal.toUpperCase() === String(v).trim().toUpperCase();
  };

  return rows.filter(row => {
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

    if (!singleFilter("legalCasePending", { row, col: "LEGAL_CASE_PENDING" })) return false;
    if (!singleFilter("hasApi", { row, col: "HAS_API" })) return false;

    return true;
  });
}

export default function Overview() {
  const { tools, loading } = useData();
  const { filters } = useFilters();

  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const toolsArr = useMemo(() => (Array.isArray(tools) ? tools : []), [tools]);

  const filtered = useMemo(
    () => localApplyFilters(toolsArr, filters),
    [toolsArr, filters]
  );

  const fundingAgg = useMemo(() => {
    const map = countUniqueBy(
      filtered,
      r => getField(r, "FUNDING"),
      r => getField(r, "PARENT_ORGANIZATION")
    );
    return toChartData(map, "key");
  }, [filtered]);

  const foundationModelAgg = useMemo(() => {
    const map = countBy(filtered, r => getField(r, "FOUNDATIONAL_MODEL"));
    return toChartData(map, "key").sort((a, b) => b.count - a.count);
  }, [filtered]);

  const inferenceAgg = useMemo(() => {
    const map = countBy(filtered, r => getField(r, "INFERENCE_LOCATION"));
    return toChartData(map, "key").sort((a, b) => b.count - a.count);
  }, [filtered]);

  const ipAgg = useMemo(() => {
    const map = countBy(filtered, r => getField(r, "POTENTIAL_FOR_IP"));
    return toChartData(map, "key").sort((a, b) => b.count - a.count);
  }, [filtered]);

  const toolsLaunchedAgg = useMemo(() => {
    const map = countBy(filtered, r => getField(r, "YEAR_LAUNCHED"));
    return toChartData(map, "key");
  }, [filtered]);

  const companiesFoundedAgg = useMemo(() => {
    const map = countUniqueBy(
      filtered,
      r => getField(r, "YEAR_COMPANY_FOUNDED"),
      r => getField(r, "PARENT_ORGANIZATION")
    );
    return toChartData(map, "key");
  }, [filtered]);

  const hasApiCount = useMemo(
    () =>
      filtered.filter(r => String(getField(r, "HAS_API") || "").toUpperCase() === "YES").length,
    [filtered]
  );

  const multimodalCount = useMemo(
    () =>
      filtered.filter(r =>
        String(getField(r, "FOUNDATIONAL_MODEL") || "")
          .toLowerCase()
          .includes("multimodal")
      ).length,
    [filtered]
  );

  const llmCount = useMemo(
    () =>
      filtered.filter(r =>
        String(getField(r, "FOUNDATIONAL_MODEL") || "")
          .toLowerCase()
          .includes("llm")
      ).length,
    [filtered]
  );

  return (
    <div className="flex w-full min-h-screen bg-[#f6f8fb]">
      <LeftRail
        onOpenFilters={() => setShowFilters(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
      />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-[#232073]">Overview</h1>
          <p className="text-gray-600 mt-1">AI Tools Analytics Dashboard</p>
        </div>

        {loading || !toolsArr.length ? (
          <div className="text-gray-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <BarBlock
                title="Provider Orgs - Types of Funding"
                data={fundingAgg}
                labelKey="key"
                filterKey="fundingType"
                height={260}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <BarBlock
                title="Tools by Foundational Model"
                data={foundationModelAgg}
                labelKey="key"
                filterKey="foundationalModel"
                height={260}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <LineBlock
                title="Tools Launched by Year"
                data={toolsLaunchedAgg}
                labelKey="key"
                filterKey="yearLaunchedRange"
                height={260}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <LineBlock
                title="Companies Founded by Year"
                data={companiesFoundedAgg}
                labelKey="key"
                filterKey="yearCompanyFoundedRange"
                height={260}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <PieBlock
                title="IP Creation Potential"
                data={ipAgg}
                labelKey="key"
                filterKey="ipCreationPotential"
                height={260}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <BarBlock
                title="Tools by Inference Location"
                data={inferenceAgg}
                labelKey="key"
                filterKey="inferenceLocation"
                height={260}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 xl:col-span-2">
              <VennBlock
                title="Model / API Capability Snapshot"
                a={llmCount}
                b={multimodalCount}
                c={hasApiCount}
                labels={{ a: "LLM", b: "Multimodal", c: "Has API" }}
                height={260}
              />
            </div>
          </div>
        )}
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






