// import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
// import { useFilters } from "../../context/FiltersContext.jsx";

// export default function LineBlock({ title, data, xKey="key", filterKey, height=260 }) {
//   const { setFilters } = useFilters();

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
//           <LineChart data={data} onClick={(e)=> {
//             const label = e?.activeLabel;
//             if (label != null) toggleFilterVal(label);
//           }}>
//             <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
//             <YAxis />
//             <Tooltip />
//             <Line type="monotone" dataKey="count" stroke="#2f6fb6" strokeWidth={3} dot={{ r: 2 }} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useFilters } from "../../context/FiltersContext.jsx";
import { FX_DMZ_COLORS } from "../../medmzTheme.js";

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

export default function LineBlock({
  title,
  data,
  labelKey = "key",
  filterKey,
  height = 260
}) {
  const { setFilters } = useFilters();

  const safeData = useMemo(
    () => (Array.isArray(data) ? data : []).filter(d => d && d.count >= 0),
    [data]
  );

  const onPointClick = (entry) => {
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
          <LineChart data={safeData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" />
            <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={FX_DMZ_COLORS.darkBlue}
              strokeWidth={3}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              onClick={onPointClick}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
