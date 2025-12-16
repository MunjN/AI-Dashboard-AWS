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







