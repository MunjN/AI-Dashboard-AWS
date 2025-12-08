// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";

// const API_BASE =
//   import.meta.env.VITE_API_BASE ||
//   "https://ai-dashboard-react.onrender.com";

// export default function AdminStats() {
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       try {
//         const token = Cookies.get("idToken");
//         if (!token) {
//           setErr("No session token. Please sign in again.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(
//           `${API_BASE}/api/login-stats`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!res.ok) {
//           const t = await res.text();
//           setErr(t || "Not authorized to view stats.");
//           setLoading(false);
//           return;
//         }

//         const json = await res.json();
//         setData(json);
//       } catch (e) {
//         console.error(e);
//         setErr("Failed to load stats. Check backend/API base.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, []);

//   if (loading) return <div className="p-6">Loading…</div>;

//   if (err) {
//     return (
//       <div className="p-6 text-red-700">
//         {err}
//       </div>
//     );
//   }

//   const {
//     totalLogins = 0,
//     uniqueUsers = 0,
//     topUsers = [],
//     trendLast30Days = [],
//   } = data || {};

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold text-blue-950">
//           Admin Stats
//         </h1>
//         <a
//           href="/"
//           className="text-blue-700 hover:underline"
//         >
//           ← Back to dashboard
//         </a>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <StatsCard label="Total Logins" value={totalLogins} />
//         <StatsCard label="Unique Users" value={uniqueUsers} />
//         <StatsCard label="Top User" value={topUsers?.[0]?.email || "—"} />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
//           <h2 className="text-lg font-semibold text-blue-950">
//             Top Users
//           </h2>
//           <div className="mt-3 overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-blue-900/80">
//                   <th className="p-2">Email</th>
//                   <th className="p-2">Logins</th>
//                   <th className="p-2">Last Login</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {topUsers?.map((u) => (
//                   <tr key={u.email} className="border-t">
//                     <td className="p-2">{u.email}</td>
//                     <td className="p-2">{u.loginCount}</td>
//                     <td className="p-2">
//                       {u.lastLoginAt
//                         ? new Date(u.lastLoginAt).toLocaleString()
//                         : "—"}
//                     </td>
//                   </tr>
//                 ))}

//                 {!topUsers?.length && (
//                   <tr>
//                     <td className="p-3 text-blue-900/70" colSpan={3}>
//                       No logins yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
//           <h2 className="text-lg font-semibold text-blue-950">
//             Logins (Last 30 Days)
//           </h2>
//           <div className="mt-3 overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-left text-blue-900/80">
//                   <th className="p-2">Day</th>
//                   <th className="p-2">Count</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {trendLast30Days?.map((d) => (
//                   <tr key={d.day} className="border-t">
//                     <td className="p-2">{d.day}</td>
//                     <td className="p-2">{d.count}</td>
//                   </tr>
//                 ))}

//                 {!trendLast30Days?.length && (
//                   <tr>
//                     <td className="p-3 text-blue-900/70" colSpan={2}>
//                       No recent logins.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatsCard({ label, value }) {
//   return (
//     <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
//       <div className="text-sm text-blue-900/70">
//         {label}
//       </div>
//       <div className="text-2xl font-semibold text-blue-950 mt-1">
//         {value}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ai-dashboard-react.onrender.com";

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = Cookies.get("idToken");
        if (!token) {
          setErr("No session token. Please sign in again.");
          setLoading(false);
          return;
        }

        // ✅ FIX: stats are served at /api/login-stats (GET),
        // not /api/track-login (POST)
        const res = await fetch(`${API_BASE}/api/login-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const t = await res.text();
          setErr(
            t || "Not authorized to view stats."
          );
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setErr("Failed to load stats. Check backend/API base.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  if (err) {
    return (
      <div className="p-6 text-red-700">
        {err}
      </div>
    );
  }

  const {
    totalLogins = 0,
    uniqueUsers = 0,
    topUsers = [],
    trendLast30Days = [],
  } = data || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-blue-950">
          Admin Stats
        </h1>
        <a
          href="/"
          className="text-blue-700 hover:underline"
        >
          ← Back to dashboard
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Logins" value={totalLogins} />
        <StatsCard label="Unique Users" value={uniqueUsers} />
        <StatsCard label="Top User" value={topUsers?.[0]?.email || "—"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-950">
            Top Users
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-blue-900/80">
                  <th className="p-2">Email</th>
                  <th className="p-2">Logins</th>
                  <th className="p-2">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {topUsers?.map((u) => (
                  <tr key={u.email} className="border-t">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.loginCount}</td>
                    <td className="p-2">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {!topUsers?.length && (
                  <tr>
                    <td className="p-3 text-blue-900/70" colSpan={3}>
                      No logins yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-blue-950">
            Logins (Last 30 Days)
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-blue-900/80">
                  <th className="p-2">Day</th>
                  <th className="p-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {trendLast30Days?.map((d) => (
                  <tr key={d.day} className="border-t">
                    <td className="p-2">{d.day}</td>
                    <td className="p-2">{d.count}</td>
                  </tr>
                ))}

                {!trendLast30Days?.length && (
                  <tr>
                    <td className="p-3 text-blue-900/70" colSpan={2}>
                      No recent logins.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value }) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
      <div className="text-sm text-blue-900/70">
        {label}
      </div>
      <div className="text-2xl font-semibold text-blue-950 mt-1">
        {value}
      </div>
    </div>
  );
}
