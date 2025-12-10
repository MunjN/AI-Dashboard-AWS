// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
// import { useFilters } from "../../context/FiltersContext.jsx";

// export default function BarBlock({
//   title,
//   data,
//   xKey="key",
//   filterKey,          // e.g. "foundationalModel"
//   height=260,
//   horizontalLabels=true
// }) {
//   const { filters, setFilters } = useFilters();

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
//           <BarChart data={data}>
//             <XAxis
//               dataKey={xKey}
//               interval={0}
//               angle={horizontalLabels ? 0 : -30}
//               textAnchor={horizontalLabels ? "middle" : "end"}
//               height={horizontalLabels ? 40 : 70}
//               tick={{ fontSize: 11 }}
//             />
//             <YAxis />
//             <Tooltip />
//             <Bar
//               dataKey="count"
//               fill="#6f9ed6"
//               onClick={(d) => toggleFilterVal(d?.[xKey])}
//               style={{ cursor: filterKey ? "pointer" : "default" }}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }


import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import { useFilters } from "../../context/FiltersContext.jsx";
import { CHART_COLORS, FX_DMZ_COLORS } from "../../medmzTheme.js";

function CustomTooltip({ active, payload, label }) {
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
        {label}
      </div>
      <div style={{ marginTop: 4 }}>
        count : <b>{p?.count ?? 0}</b>
      </div>
    </div>
  );
}

export default function BarBlock({
  title,
  data,
  labelKey = "key",
  filterKey,
  height = 260,
  colors = CHART_COLORS,
  rotateLabels = false,
  maxBarSize = 60
}) {
  const { setFilters } = useFilters();

  const safeData = useMemo(
    () => (Array.isArray(data) ? data : []).filter(d => d && d.count > 0),
    [data]
  );

  const onBarClick = (entry) => {
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
          <BarChart
            data={safeData}
            margin={{ top: 10, right: 10, bottom: rotateLabels ? 60 : 20, left: 0 }}
          >
            <XAxis
              dataKey={labelKey}
              interval={0}
              angle={rotateLabels ? -35 : 0}
              textAnchor={rotateLabels ? "end" : "middle"}
              height={rotateLabels ? 70 : 30}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={maxBarSize}
              onClick={onBarClick}
            >
              {safeData.map((_, i) => (
                <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


