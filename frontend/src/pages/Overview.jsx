import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useFilters } from "../context/FiltersContext.jsx";
import applyFilters from "../lib/applyFilters.js";
import { countBy, countUniqueBy, toChartData } from "../lib/aggregate.js";
import LeftRail from "../components/LeftRail.jsx";
import FilterModal from "../components/FilterModal.jsx";
import BookmarkModal from "../components/BookmarkModal.jsx"; // ✅ NEW
import BarBlock from "../components/charts/BarBlock.jsx";
import LineBlock from "../components/charts/LineBlock.jsx";
import PieBlock from "../components/charts/PieBlock.jsx";
import VennBlock from "../components/VennBlock.jsx";

export default function Overview() {
  const { tools, loading, error } = useData();
  const { filters, setFilters } = useFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false); // ✅ NEW

  const filtered = useMemo(() => applyFilters(tools, filters), [tools, filters]);

  const infraCount = useMemo(
    () => new Set(filtered.map(r => r.infraName).filter(Boolean)).size,
    [filtered]
  );
  const parentOrgCount = useMemo(
    () => new Set(filtered.map(r => r.parentOrg).filter(Boolean)).size,
    [filtered]
  );

  // --- Aggregations ---
  const providersByFunding = useMemo(() => {
    const kv = countUniqueBy(filtered, r => r.fundingType, r => r.parentOrg);
    return toChartData(kv, "funding");
  }, [filtered]);

  const toolsByFM = useMemo(() => {
    const kv = countBy(filtered, r => r.foundationalModel);
    return toChartData(kv, "fm");
  }, [filtered]);

  const toolsLaunchedByYear = useMemo(() => {
    const kv = countBy(filtered, r => r.yearLaunched);
    return toChartData(kv, "year");
  }, [filtered]);

  const companiesFoundedByYear = useMemo(() => {
    const kv = countUniqueBy(filtered, r => r.yearCompanyFounded, r => r.parentOrg);
    return toChartData(kv, "year");
  }, [filtered]);

  const ipPotential = useMemo(() => {
    const kv = countBy(filtered, r => r.ipCreationPotential);
    return toChartData(kv, "ip");
  }, [filtered]);

  const toolsByInference = useMemo(() => {
    const kv = countBy(filtered, r => r.inferenceLocation);
    return toChartData(kv, "inf");
  }, [filtered]);

  const providersByMaturity = useMemo(() => {
    const kv = countUniqueBy(filtered, r => r.orgMaturity, r => r.parentOrg);
    return toChartData(kv, "mat");
  }, [filtered]);

  // --- Venn numbers + buckets from FULL dataset (not filtered)
  const venn = useMemo(() => {
    const allVals = [...new Set(tools.map(t => t.softwareType).filter(Boolean))];

    const cloudVals = [];
    const desktopVals = [];
    const bothVals = [];

    allVals.forEach(v => {
      const s = String(v).toLowerCase();
      const hasCloud = s.includes("cloud");
      const hasDesktop = s.includes("desktop");

      if (hasCloud && hasDesktop) bothVals.push(v);
      else if (hasCloud) cloudVals.push(v);
      else if (hasDesktop) desktopVals.push(v);
    });

    let cloudOnly = 0, desktopOnly = 0, both = 0;
    filtered.forEach(r => {
      const s = String(r.softwareType || "").toLowerCase();
      const hasCloud = s.includes("cloud");
      const hasDesktop = s.includes("desktop");
      if (hasCloud && hasDesktop) both += 1;
      else if (hasCloud) cloudOnly += 1;
      else if (hasDesktop) desktopOnly += 1;
    });

    return { cloudOnly, desktopOnly, both, cloudVals, desktopVals, bothVals };
  }, [tools, filtered]);

  const toggleSoftwareBucket = (bucketVals) => {
    setFilters(prev => {
      const cur = prev.softwareType || [];
      const hasAny = bucketVals.some(v => cur.includes(v));
      const next = hasAny
        ? cur.filter(v => !bucketVals.includes(v))  // remove bucket
        : [...new Set([...cur, ...bucketVals])];   // add bucket
      return { ...prev, softwareType: next.length ? next : null };
    });
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-white px-6 pt-6 flex items-start gap-6">
      <LeftRail
        infraCount={infraCount}
        parentOrgCount={parentOrgCount}
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)} // ✅ NEW
        onSwitchView={() => {}}
        viewLabel="Overview"
      />

      <div className="flex-1 space-y-6">
        {/* Top row */}
        <div className="grid grid-cols-2 gap-6">
          <BarBlock
            title="Provider Orgs – Types of Funding"
            data={providersByFunding}
            xKey="funding"
            filterKey="fundingType"
          />
          <BarBlock
            title="Tools by Foundational Model"
            data={toolsByFM}
            xKey="fm"
            filterKey="foundationalModel"
          />
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-2 gap-6">
          <LineBlock
            title="Tools Launched by Year"
            data={toolsLaunchedByYear}
            xKey="year"
            filterKey={null}   // keep blue but don't break range filters
          />
          <LineBlock
            title="Companies Founded by Year"
            data={companiesFoundedByYear}
            xKey="year"
            filterKey={null}
          />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-4 gap-6">
          <PieBlock
            title="IP Creation Potential"
            data={ipPotential}
            labelKey="ip"
            filterKey="ipCreationPotential"
          />
          <BarBlock
            title="Tools by Inference Location"
            data={toolsByInference}
            xKey="inf"
            filterKey="inferenceLocation"
            horizontalLabels
          />
          <VennBlock
            title="Tools by Software Type"
            cloudOnly={venn.cloudOnly}
            desktopOnly={venn.desktopOnly}
            both={venn.both}
            onClickCloud={() => toggleSoftwareBucket(venn.cloudVals)}
            onClickDesktop={() => toggleSoftwareBucket(venn.desktopVals)}
            onClickBoth={() => toggleSoftwareBucket(venn.bothVals)}
          />
          <PieBlock
            title="Providers by Maturity"
            data={providersByMaturity}
            labelKey="mat"
            filterKey="orgMaturity"
          />
        </div>
      </div>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        allRows={tools}
      />

      {/* ✅ NEW modal */}
      <BookmarkModal open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
    </div>
  );
}
