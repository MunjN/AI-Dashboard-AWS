import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import { useFilters } from "../../context/FiltersContext.jsx";

export default function PieBlock({ title, data, labelKey="key", filterKey, height=260 }) {
  const { setFilters } = useFilters();
  const colors = ["#2f6fb6", "#6f9ed6", "#b9d0ee", "#e6eefb"];

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
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey={labelKey}
              outerRadius="80%"
              label
              onClick={(d)=> toggleFilterVal(d?.[labelKey])}
              style={{ cursor: filterKey ? "pointer" : "default" }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
