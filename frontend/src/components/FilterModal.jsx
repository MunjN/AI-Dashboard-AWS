// import { useMemo, useState } from "react";
// import { useFilters } from "../context/FiltersContext.jsx";

// export default function FilterModal({ open, onClose, allRows }) {
//   const { filters, setFilters, clearFilters } = useFilters();

//   const options = useMemo(() => {
//     const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
//     const flat = (fn) => uniq(allRows.flatMap(fn));

//     return {
//       softwareType: uniq(allRows.map(r => r.softwareType)),
//       expectedInput: flat(r => r.expectedInput || []),
//       generatedOutput: flat(r => r.generatedOutput || []),
//       modelType: uniq(allRows.map(r => r.modelType)),
//       foundationalModel: uniq(allRows.map(r => r.foundationalModel)),
//       inferenceLocation: uniq(allRows.map(r => r.inferenceLocation)),
//       toolName: uniq(allRows.map(r => r.toolName)),
//       tasks: flat(r => r.tasks || []),

//       parentOrg: uniq(allRows.map(r => r.parentOrg)),
//       orgMaturity: uniq(allRows.map(r => r.orgMaturity)),
//       fundingType: uniq(allRows.map(r => r.fundingType)),
//       businessModel: uniq(allRows.map(r => r.businessModel)),
//       ipCreationPotential: uniq(allRows.map(r => r.ipCreationPotential))
//     };
//   }, [allRows]);

//   if (!open) return null;

//   const toggleMulti = (key, value) => {
//     setFilters(prev => {
//       const current = prev[key] || [];
//       const exists = current.includes(value);
//       const next = exists ? current.filter(v => v !== value) : [...current, value];
//       return { ...prev, [key]: next.length ? next : null };
//     });
//   };

//   const setSingle = (key, val) =>
//     setFilters(prev => ({ ...prev, [key]: val || null }));

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//       <div
//         className="
//           w-full max-w-5xl bg-[#cfe0f7] text-blue-950
//           rounded-[2.5rem] shadow-2xl
//           max-h-[90vh] overflow-y-auto
//           p-8
//         "
//       >
//         <div className="flex items-center justify-between mb-6">
//           <div className="text-3xl font-bold">Filters</div>
//           <button onClick={onClose} className="text-2xl text-blue-900/70 hover:text-blue-900">✕</button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           {/* TECHNOLOGY */}
//           <FilterSection title="Technology">
//             <CheckList label="Software Type" values={filters.softwareType} options={options.softwareType}
//               onToggle={(v) => toggleMulti("softwareType", v)} />
//             <CheckList label="Expected Input" values={filters.expectedInput} options={options.expectedInput}
//               onToggle={(v) => toggleMulti("expectedInput", v)} />
//             <CheckList label="Generated Output" values={filters.generatedOutput} options={options.generatedOutput}
//               onToggle={(v) => toggleMulti("generatedOutput", v)} />
//             <CheckList label="Model Type" values={filters.modelType} options={options.modelType}
//               onToggle={(v) => toggleMulti("modelType", v)} />
//             <CheckList label="Foundational Model" values={filters.foundationalModel} options={options.foundationalModel}
//               onToggle={(v) => toggleMulti("foundationalModel", v)} />
//             <CheckList label="Inference Location" values={filters.inferenceLocation} options={options.inferenceLocation}
//               onToggle={(v) => toggleMulti("inferenceLocation", v)} />

//             <SingleSelect label="Has API" value={filters.hasApi} options={["YES","NO"]}
//               onChange={(v)=>setSingle("hasApi", v)} />

//             <CheckList label="Tool Name" values={filters.toolName} options={options.toolName}
//               onToggle={(v) => toggleMulti("toolName", v)} />
//             <CheckList label="Tasks" values={filters.tasks} options={options.tasks}
//               onToggle={(v) => toggleMulti("tasks", v)} />
//           </FilterSection>

//           {/* BUSINESS */}
//           <FilterSection title="Business">
//             <CheckList label="Parent Org" values={filters.parentOrg} options={options.parentOrg}
//               onToggle={(v) => toggleMulti("parentOrg", v)} />
//             <CheckList label="Org Maturity" values={filters.orgMaturity} options={options.orgMaturity}
//               onToggle={(v) => toggleMulti("orgMaturity", v)} />
//             <CheckList label="Funding" values={filters.fundingType} options={options.fundingType}
//               onToggle={(v) => toggleMulti("fundingType", v)} />
//             <CheckList label="Business Model" values={filters.businessModel} options={options.businessModel}
//               onToggle={(v) => toggleMulti("businessModel", v)} />
//             <CheckList label="Potential for IP Creation" values={filters.ipCreationPotential} options={options.ipCreationPotential}
//               onToggle={(v) => toggleMulti("ipCreationPotential", v)} />

//             <SingleSelect label="Legal Case Pending" value={filters.legalCasePending} options={["YES","NO"]}
//               onChange={(v)=>setSingle("legalCasePending", v)} />
//           </FilterSection>
//         </div>

//         <div className="flex justify-end gap-6 mt-10 text-lg">
//           <button
//             onClick={clearFilters}
//             className="px-8 py-3 rounded-xl text-red-600 font-semibold hover:bg-white/60"
//           >
//             Clear
//           </button>
//           <button
//             onClick={onClose}
//             className="px-8 py-3 rounded-xl text-gray-600 font-semibold hover:bg-white/60"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function FilterSection({ title, children }) {
//   return (
//     <div>
//       <h3 className="text-4xl font-light text-white mb-4 drop-shadow-sm">{title}</h3>
//       <div className="space-y-5">{children}</div>
//     </div>
//   );
// }

// function CheckList({ label, options, values, onToggle }) {
//   const current = values || [];
//   const [q, setQ] = useState("");

//   const filteredOptions = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return options;
//     return options.filter(o => String(o).toLowerCase().includes(s));
//   }, [options, q]);

//   return (
//     <div>
//       <div className="text-sm font-semibold mb-2">{label}</div>

//       {/* Search inside filter */}
//       <input
//         className="w-full bg-white rounded-md px-2 py-1 text-sm border mb-2"
//         placeholder={`Search ${label.toLowerCase()}...`}
//         value={q}
//         onChange={(e) => setQ(e.target.value)}
//       />

//       <div className="bg-white rounded-lg p-2 max-h-40 overflow-y-auto border">
//         {filteredOptions.map(o => {
//           const checked = current.includes(o);
//           return (
//             <label key={o} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={checked}
//                 onChange={() => onToggle(o)}
//               />
//               <span>{o}</span>
//             </label>
//           );
//         })}

//         {filteredOptions.length === 0 && (
//           <div className="text-xs text-gray-500 p-2">No matches</div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SingleSelect({ label, options, value, onChange }) {
//   return (
//     <div>
//       <div className="text-sm font-semibold mb-2">{label}</div>
//       <select
//         className="w-full bg-white rounded-lg p-2 border"
//         value={value || ""}
//         onChange={(e) => onChange(e.target.value)}
//       >
//         <option value="">All</option>
//         {options.map(o => <option key={o} value={o}>{o}</option>)}
//       </select>
//     </div>
//   );
// }



import React, { useMemo, useState } from "react";
import { useFilters } from "../context/FiltersContext.jsx";
import { FX_DMZ_COLORS } from "../medmzTheme.js";

export default function FilterModal({ open, onClose, allRows = [] }) {
  const { filters, setFilters, clearFilters } = useFilters();

  // Always an array
  const rows = Array.isArray(allRows) ? allRows : [];

  // Search state for option lists (keeps your old UX)
  const [search, setSearch] = useState({
    softwareType: "",
    expectedInput: "",
    generatedOutput: "",
    modelType: "",
    foundationalModel: "",
    inferenceLocation: "",
    tasks: "",
    toolName: "",
    parentOrg: "",
    orgMaturity: "",
    fundingType: "",
    businessModel: "",
    ipCreationPotential: ""
  });

  // --- helpers ---
  const getField = (r, field) => {
    if (!r) return null;
    const direct = r[field];
    const lower = r[field?.toLowerCase()];
    const raw =
      r?._raw?.[field] ??
      r?._raw?.[field?.toLowerCase()] ??
      r?._raw?.[field?.toUpperCase()];
    return direct ?? lower ?? raw ?? null;
  };

  const asList = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (val == null || val === "") return [];
    return [val];
  };

  const uniq = (arr) =>
    [...new Set(arr.filter(Boolean).map(v => String(v).trim()))].filter(Boolean).sort();

  // Build options from rows safely
  const options = useMemo(() => {
    const flat = (fn) => uniq(rows.flatMap(fn));

    return {
      softwareType: uniq(rows.map(r => getField(r, "SOFTWARE_TYPE") ?? getField(r, "softwareType"))),
      expectedInput: flat(r => asList(getField(r, "EXPECTED_INPUT") ?? getField(r, "expectedInput"))),
      generatedOutput: flat(r => asList(getField(r, "GENERATED_OUTPUT") ?? getField(r, "generatedOutput"))),
      modelType: uniq(rows.map(r => getField(r, "MODEL_TYPE") ?? getField(r, "modelType"))),
      foundationalModel: uniq(rows.map(r => getField(r, "FOUNDATIONAL_MODEL") ?? getField(r, "foundationalModel"))),
      inferenceLocation: uniq(rows.map(r => getField(r, "INFERENCE_LOCATION") ?? getField(r, "inferenceLocation"))),
      tasks: flat(r => asList(getField(r, "TASKS") ?? getField(r, "tasks"))),
      toolName: uniq(rows.map(r => getField(r, "TOOL_NAME") ?? getField(r, "toolName"))),

      parentOrg: uniq(rows.map(r => getField(r, "PARENT_ORG") ?? getField(r, "parentOrg"))),
      orgMaturity: uniq(rows.map(r => getField(r, "ORG_MATURITY") ?? getField(r, "orgMaturity"))),
      fundingType: uniq(rows.map(r => getField(r, "FUNDING_TYPE") ?? getField(r, "fundingType"))),
      businessModel: uniq(rows.map(r => getField(r, "BUSINESS_MODEL") ?? getField(r, "businessModel"))),
      ipCreationPotential: uniq(rows.map(r => getField(r, "IP_CREATION_POTENTIAL") ?? getField(r, "ipCreationPotential")))
    };
  }, [rows]);

  if (!open) return null;

  const toggleMulti = (key, value) => {
    setFilters(prev => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const setSingle = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || null }));
  };

  const filterOptions = (key, list) => {
    const q = (search[key] || "").toLowerCase();
    if (!q) return list;
    return list.filter(v => String(v).toLowerCase().includes(q));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        className="w-full max-w-6xl bg-[#cfe0f7] rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto p-8"
        style={{ color: FX_DMZ_COLORS.darkBlue }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold">Filters</div>
          <button onClick={onClose} className="text-2xl opacity-70 hover:opacity-100">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* TECHNOLOGY */}
          <Section title="Technology">
            <SearchList
              label="Software Type"
              searchValue={search.softwareType}
              onSearch={(v) => setSearch(s => ({ ...s, softwareType: v }))}
              options={filterOptions("softwareType", options.softwareType)}
              values={filters.softwareType}
              onToggle={(v) => toggleMulti("softwareType", v)}
            />

            <SearchList
              label="Expected Input"
              searchValue={search.expectedInput}
              onSearch={(v) => setSearch(s => ({ ...s, expectedInput: v }))}
              options={filterOptions("expectedInput", options.expectedInput)}
              values={filters.expectedInput}
              onToggle={(v) => toggleMulti("expectedInput", v)}
            />

            <SearchList
              label="Generated Output"
              searchValue={search.generatedOutput}
              onSearch={(v) => setSearch(s => ({ ...s, generatedOutput: v }))}
              options={filterOptions("generatedOutput", options.generatedOutput)}
              values={filters.generatedOutput}
              onToggle={(v) => toggleMulti("generatedOutput", v)}
            />

            <SearchList
              label="Model Type"
              searchValue={search.modelType}
              onSearch={(v) => setSearch(s => ({ ...s, modelType: v }))}
              options={filterOptions("modelType", options.modelType)}
              values={filters.modelType}
              onToggle={(v) => toggleMulti("modelType", v)}
            />

            <SearchList
              label="Foundational Model"
              searchValue={search.foundationalModel}
              onSearch={(v) => setSearch(s => ({ ...s, foundationalModel: v }))}
              options={filterOptions("foundationalModel", options.foundationalModel)}
              values={filters.foundationalModel}
              onToggle={(v) => toggleMulti("foundationalModel", v)}
            />

            <SearchList
              label="Inference Location"
              searchValue={search.inferenceLocation}
              onSearch={(v) => setSearch(s => ({ ...s, inferenceLocation: v }))}
              options={filterOptions("inferenceLocation", options.inferenceLocation)}
              values={filters.inferenceLocation}
              onToggle={(v) => toggleMulti("inferenceLocation", v)}
            />

            <SearchList
              label="Tasks"
              searchValue={search.tasks}
              onSearch={(v) => setSearch(s => ({ ...s, tasks: v }))}
              options={filterOptions("tasks", options.tasks)}
              values={filters.tasks}
              onToggle={(v) => toggleMulti("tasks", v)}
            />

            <SearchList
              label="Tool Name"
              searchValue={search.toolName}
              onSearch={(v) => setSearch(s => ({ ...s, toolName: v }))}
              options={filterOptions("toolName", options.toolName)}
              values={filters.toolName}
              onToggle={(v) => toggleMulti("toolName", v)}
            />

            <SingleSelect
              label="Has API"
              value={filters.hasApi}
              options={["YES", "NO"]}
              onChange={(v) => setSingle("hasApi", v)}
            />
          </Section>

          {/* BUSINESS */}
          <Section title="Business">
            <SearchList
              label="Parent Org"
              searchValue={search.parentOrg}
              onSearch={(v) => setSearch(s => ({ ...s, parentOrg: v }))}
              options={filterOptions("parentOrg", options.parentOrg)}
              values={filters.parentOrg}
              onToggle={(v) => toggleMulti("parentOrg", v)}
            />

            <SearchList
              label="Org Maturity"
              searchValue={search.orgMaturity}
              onSearch={(v) => setSearch(s => ({ ...s, orgMaturity: v }))}
              options={filterOptions("orgMaturity", options.orgMaturity)}
              values={filters.orgMaturity}
              onToggle={(v) => toggleMulti("orgMaturity", v)}
            />

            <SearchList
              label="Funding Type"
              searchValue={search.fundingType}
              onSearch={(v) => setSearch(s => ({ ...s, fundingType: v }))}
              options={filterOptions("fundingType", options.fundingType)}
              values={filters.fundingType}
              onToggle={(v) => toggleMulti("fundingType", v)}
            />

            <SearchList
              label="Business Model"
              searchValue={search.businessModel}
              onSearch={(v) => setSearch(s => ({ ...s, businessModel: v }))}
              options={filterOptions("businessModel", options.businessModel)}
              values={filters.businessModel}
              onToggle={(v) => toggleMulti("businessModel", v)}
            />

            <SearchList
              label="IP Creation Potential"
              searchValue={search.ipCreationPotential}
              onSearch={(v) => setSearch(s => ({ ...s, ipCreationPotential: v }))}
              options={filterOptions("ipCreationPotential", options.ipCreationPotential)}
              values={filters.ipCreationPotential}
              onToggle={(v) => toggleMulti("ipCreationPotential", v)}
            />

            <SingleSelect
              label="Legal Case Pending"
              value={filters.legalCasePending}
              options={["YES", "NO"]}
              onChange={(v) => setSingle("legalCasePending", v)}
            />
          </Section>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white font-semibold"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#232073] hover:bg-[#1c195f] text-white font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xl font-bold mb-3">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SearchList({ label, options = [], values = [], onToggle, searchValue, onSearch }) {
  const safeOptions = Array.isArray(options) ? options : [];
  const safeValues = Array.isArray(values) ? values : [];

  return (
    <div>
      <div className="text-sm font-semibold mb-2">{label}</div>
      <input
        className="w-full bg-white rounded-lg p-2 border mb-2"
        placeholder={`Search ${label.toLowerCase()}...`}
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-white rounded-lg p-2 border">
        {safeOptions.map(o => {
          const checked = safeValues.includes(o);
          return (
            <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(o)}
              />
              <span>{o}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SingleSelect({ label, options = [], value, onChange }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">{label}</div>
      <select
        className="w-full bg-white rounded-lg p-2 border"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
