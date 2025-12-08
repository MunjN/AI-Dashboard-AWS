import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useFilters } from "../../context/FiltersContext.jsx";

export default function BarBlock({
  title,
  data,
  xKey="key",
  filterKey,          // e.g. "foundationalModel"
  height=260,
  horizontalLabels=true
}) {
  const { filters, setFilters } = useFilters();

  const toggleFilterVal = (val) => {
    if (!filterKey) return;
    setFilters(prev => {
      const cur = prev[filterKey] || [];
      const exists = cur.includes(val);
      const next = exists ? cur.filter(v => v !== val) : [...cur, val];
      return { ...prev, [filterKey]: next.length ? next : null };
    });
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white">
      <h3 className="text-center font-semibold text-blue-900 mb-2">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey={xKey}
              interval={0}
              angle={horizontalLabels ? 0 : -30}
              textAnchor={horizontalLabels ? "middle" : "end"}
              height={horizontalLabels ? 40 : 70}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#6f9ed6"
              onClick={(d) => toggleFilterVal(d?.[xKey])}
              style={{ cursor: filterKey ? "pointer" : "default" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
