// import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
// import { useFilters } from "../../context/FiltersContext.jsx";

// export default function PieBlock({ title, data, labelKey="key", filterKey, height=260 }) {
//   const { setFilters } = useFilters();
//   const colors = ["#2f6fb6", "#6f9ed6", "#b9d0ee", "#e6eefb"];

//   const toggleFilterVal = (val) => {
//     if (!filterKey) return;
//     setFilters(prev => {
//       const cur = prev[filterKey] || [];
//       const exists = cur.includes(val);
//       const next = exists ? cur.filter(v => v !== val) : [...cur, val];
//       return { ...prev, [filterKey]: next.length ? next : null };
//     });
//   };

//   return (
//     <div className="border rounded-xl p-4 shadow-sm bg-white">
//       <h3 className="text-center font-semibold text-blue-900 mb-2">{title}</h3>
//       <div style={{ height }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={data}
//               dataKey="count"
//               nameKey={labelKey}
//               outerRadius="80%"
//               label
//               onClick={(d)=> toggleFilterVal(d?.[labelKey])}
//               style={{ cursor: filterKey ? "pointer" : "default" }}
//             >
//               {data.map((_, i) => (
//                 <Cell key={i} fill={colors[i % colors.length]} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }



import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { useFilters } from "../../context/FiltersContext.jsx";
import { CHART_COLORS, FX_DMZ_COLORS } from "../../medmzTheme.js";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0]?.payload;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        padding: "10px 12px",
        borderRadius: 8,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
      }}
    >
      <div style={{ fontWeight: 700, color: FX_DMZ_COLORS.darkBlue }}>
        {p?.key}
      </div>
      <div style={{ marginTop: 4 }}>
        count : <b>{p?.count ?? 0}</b>
      </div>
    </div>
  );
}

export default function PieBlock({
  title,
  data,
  labelKey = "key",
  filterKey,
  height = 260,
  innerRadius = 45,
  outerRadius = 85,
  colors = CHART_COLORS
}) {
  const { setFilters } = useFilters();

  const safeData = useMemo(
    () => (Array.isArray(data) ? data : []).filter(d => d && d.count > 0),
    [data]
  );

  const onSliceClick = (entry) => {
    if (!filterKey || !entry?.[labelKey]) return;
    setFilters(prev => ({
      ...prev,
      [filterKey]: [entry[labelKey]]
    }));
  };

  return (
    <div className="w-full">
      <div className="text-lg font-semibold text-[#232073] mb-2">{title}</div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie
              data={safeData}
              dataKey="count"
              nameKey={labelKey}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              onClick={onSliceClick}
            >
              {safeData.map((_, i) => (
                <Cell key={`slice-${i}`} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
