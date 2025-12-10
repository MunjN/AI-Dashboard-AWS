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



import { useMemo, useState } from "react";
import { useFilters } from "../context/FiltersContext.jsx";

export default function FilterModal({ open, onClose, allRows = [] }) {
  const { filters, setFilters, clearFilters } = useFilters();

  // HARD guard: always an array
  const rows = Array.isArray(allRows) ? allRows : [];

  const options = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
    const flat = (fn) => uniq(rows.flatMap(fn));

    return {
      softwareType: uniq(rows.map(r => r.softwareType)),
      expectedInput: flat(r => r.expectedInput || []),
      generatedOutput: flat(r => r.generatedOutput || []),
      modelType: uniq(rows.map(r => r.modelType)),
      foundationalModel: uniq(rows.map(r => r.foundationalModel)),
      inferenceLocation: uniq(rows.map(r => r.inferenceLocation)),
      toolName: uniq(rows.map(r => r.toolName)),

      tasks: flat(r => r.tasks || []),

      parentOrg: uniq(rows.map(r => r.parentOrg)),
      orgMaturity: uniq(rows.map(r => r.orgMaturity)),
      fundingType: uniq(rows.map(r => r.fundingType)),
      businessModel: uniq(rows.map(r => r.businessModel)),
      ipCreationPotential: uniq(rows.map(r => r.ipCreationPotential)),

      yearLaunched: uniq(rows.map(r => r.yearLaunched)).filter(y => Number(y)),
      yearCompanyFounded: uniq(rows.map(r => r.yearCompanyFounded)).filter(y => Number(y)),
    };
  }, [rows]);

  if (!open) return null;

  const toggleMulti = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const setSingle = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value || null }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        className="
          w-full max-w-5xl bg-[#cfe0f7] text-blue-950
          rounded-[2.5rem] shadow-2xl
          max-h-[90vh] overflow-y-auto
          p-8
        "
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold">Filters</div>
          <button onClick={onClose} className="text-2xl text-blue-900/70 hover:text-blue-900">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* TECHNOLOGY */}
          <FilterSection title="Technology">
            <CheckList
              label="Software Type"
              values={filters.softwareType}
              options={options.softwareType}
              onToggle={(v) => toggleMulti("softwareType", v)}
            />
            <CheckList
              label="Expected Input"
              values={filters.expectedInput}
              options={options.expectedInput}
              onToggle={(v) => toggleMulti("expectedInput", v)}
            />
            <CheckList
              label="Generated Output"
              values={filters.generatedOutput}
              options={options.generatedOutput}
              onToggle={(v) => toggleMulti("generatedOutput", v)}
            />
            <CheckList
              label="Model Type"
              values={filters.modelType}
              options={options.modelType}
              onToggle={(v) => toggleMulti("modelType", v)}
            />
            <CheckList
              label="Foundational Model"
              values={filters.foundationalModel}
              options={options.foundationalModel}
              onToggle={(v) => toggleMulti("foundationalModel", v)}
            />
            <CheckList
              label="Inference Location"
              values={filters.inferenceLocation}
              options={options.inferenceLocation}
              onToggle={(v) => toggleMulti("inferenceLocation", v)}
            />
            <SingleSelect
              label="Has API"
              value={filters.hasApi}
              options={["YES", "NO"]}
              onChange={(v) => setSingle("hasApi", v)}
            />
          </FilterSection>

          {/* BUSINESS */}
          <FilterSection title="Business">
            <CheckList
              label="Parent Org"
              values={filters.parentOrg}
              options={options.parentOrg}
              onToggle={(v) => toggleMulti("parentOrg", v)}
            />
            <CheckList
              label="Org Maturity"
              values={filters.orgMaturity}
              options={options.orgMaturity}
              onToggle={(v) => toggleMulti("orgMaturity", v)}
            />
            <CheckList
              label="Funding Type"
              values={filters.fundingType}
              options={options.fundingType}
              onToggle={(v) => toggleMulti("fundingType", v)}
            />
            <CheckList
              label="Business Model"
              values={filters.businessModel}
              options={options.businessModel}
              onToggle={(v) => toggleMulti("businessModel", v)}
            />
            <CheckList
              label="IP Creation Potential"
              values={filters.ipCreationPotential}
              options={options.ipCreationPotential}
              onToggle={(v) => toggleMulti("ipCreationPotential", v)}
            />
            <SingleSelect
              label="Legal Case Pending"
              value={filters.legalCasePending}
              options={["YES", "NO"]}
              onChange={(v) => setSingle("legalCasePending", v)}
            />
          </FilterSection>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-blue-900 font-semibold"
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

/* ---------- small UI helpers ---------- */

function FilterSection({ title, children }) {
  return (
    <div>
      <div className="text-xl font-bold mb-4">{title}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function CheckList({ label, options = [], values = [], onToggle }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-white rounded-lg p-2 border">
        {(options || []).map(o => {
          const checked = (values || []).includes(o);
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
        {(options || []).map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
