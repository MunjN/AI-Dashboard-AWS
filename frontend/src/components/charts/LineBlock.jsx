import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { useFilters } from "../../context/FiltersContext.jsx";

export default function LineBlock({ title, data, xKey="key", filterKey, height=260 }) {
  const { setFilters } = useFilters();

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
          <LineChart data={data} onClick={(e)=> {
            const label = e?.activeLabel;
            if (label != null) toggleFilterVal(label);
          }}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2f6fb6" strokeWidth={3} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
