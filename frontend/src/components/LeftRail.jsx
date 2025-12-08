// import { Link, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function LeftRail({
//   // old props (from your working app)
//   infraCount,
//   parentOrgCount,
//   onSwitchView,
//   viewLabel,

//   // new props
//   onOpenFilters,
//   onOpenBookmarks
// }) {
//   const location = useLocation();
//   const path = location.pathname;

//   const { user } = useAuth();
//   const email =
//     user?.email ||
//     user?.["cognito:username"] ||
//     user?.username ||
//     "";

//   const isInternal = String(email).toLowerCase().endsWith("@me-dmz.com");

//   const navItem = (to, label) => {
//     const active = path === to;
//     return (
//       <Link
//         to={to}
//         className={`
//           w-full px-4 py-3 rounded-xl text-left font-semibold transition
//           ${active ? "bg-white text-blue-950 shadow" : "text-white/90 hover:bg-white/20"}
//         `}
//       >
//         {label}
//       </Link>
//     );
//   };

//   return (
//     <aside
//       className="
//         w-[240px] shrink-0 h-screen sticky top-0
//         bg-[#1d186d] text-white
//         flex flex-col p-4 gap-4
//       "
//     >
//       {/* Brand */}
//       <div className="mb-2">
//         <a href="https://me-dmz.com" target="_blank" rel="noreferrer">
//           <div className="text-xl font-bold tracking-wide">ME-DMZ</div>
//           <div className="text-xs opacity-80">AI Tools Dashboard</div>
//         </a>
//       </div>

//       {/* Counts (only if provided) */}
//       {(infraCount != null || parentOrgCount != null) && (
//         <div className="flex flex-col gap-3 mt-2">
//           {infraCount != null && (
//             <div className="bg-white text-blue-950 rounded-2xl px-4 py-3 shadow">
//               <div className="text-2xl font-extrabold">{infraCount}</div>
//               <div className="text-xs font-semibold opacity-70">Infra Count</div>
//             </div>
//           )}
//           {parentOrgCount != null && (
//             <div className="bg-white text-blue-950 rounded-2xl px-4 py-3 shadow">
//               <div className="text-2xl font-extrabold">{parentOrgCount}</div>
//               <div className="text-xs font-semibold opacity-70">Parent Org Count</div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Nav */}
//       <div className="flex flex-col gap-2 mt-4">
//         {navItem("/details", "Details")}
//         {navItem("/overview", "Overview")}
//       </div>

//       {/* Primary actions */}
//       <div className="mt-3 flex flex-col gap-2">
//         <button
//           onClick={onOpenFilters}
//           className="
//             w-full px-4 py-3 rounded-xl font-semibold text-left
//             bg-white/10 hover:bg-white/20 transition
//           "
//         >
//           🧪 Filters
//         </button>

//         <button
//           onClick={onOpenBookmarks}
//           className="
//             w-full px-4 py-3 rounded-xl font-semibold text-left
//             bg-white/10 hover:bg-white/20 transition
//           "
//         >
//           ⭐ Bookmarks
//         </button>

//         {/* Switch View (only if provided) */}
//         {onSwitchView && (
//           <button
//             onClick={onSwitchView}
//             className="
//               w-full px-4 py-3 rounded-xl font-semibold text-left
//               bg-white/10 hover:bg-white/20 transition
//             "
//           >
//             🔁 Switch View
//             {viewLabel && (
//               <div className="text-[11px] opacity-80 mt-1">
//                 {viewLabel}
//               </div>
//             )}
//           </button>
//         )}
//       </div>

//       <div className="flex-1" />

//       {/* Footer + subtle stats icon */}
//       <div className="flex items-center justify-between text-xs opacity-70">
//         <span>Presented by ME-DMZ</span>

//         {isInternal && (
//           <Link
//             to="/stats"
//             title="Usage stats (internal)"
//             className="text-sm opacity-60 hover:opacity-100 transition"
//           >
//             📊
//           </Link>
//         )}
//       </div>
//     </aside>
//   );
// }



import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LeftRail({
  infraCount,
  parentOrgCount,
  onSwitchView,
  viewLabel,
  onOpenFilters,
  onOpenBookmarks
}) {
  const location = useLocation();
  const path = location.pathname;
  const { user, signOut } = useAuth();

  const email =
    user?.email ||
    user?.["cognito:username"] ||
    user?.username ||
    "";

  const isInternal = String(email).toLowerCase().endsWith("@me-dmz.com");

  const navItem = (to, label) => {
    const active = path === to;
    return (
      <Link
        to={to}
        className={`
          w-full px-4 py-3 rounded-xl text-left font-semibold transition
          ${active ? "bg-white text-blue-950 shadow" : "text-white/90 hover:bg-white/20"}
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside
      className="
        w-[240px] shrink-0 h-screen sticky top-0
        bg-[#1d186d] text-white
        flex flex-col p-4 gap-4
      "
    >
      <div className="mb-2">
        <a href="https://me-dmz.com" target="_blank" rel="noreferrer">
          <div className="text-xl font-bold tracking-wide">ME-DMZ</div>
          <div className="text-xs opacity-80">AI Tools Dashboard</div>
        </a>
      </div>

      {(infraCount != null || parentOrgCount != null) && (
        <div className="flex flex-col gap-3 mt-2">
          {infraCount != null && (
            <div className="bg-white text-blue-950 rounded-2xl px-4 py-3 shadow">
              <div className="text-2xl font-extrabold">{infraCount}</div>
              <div className="text-xs font-semibold opacity-70">Infra Count</div>
            </div>
          )}
          {parentOrgCount != null && (
            <div className="bg-white text-blue-950 rounded-2xl px-4 py-3 shadow">
              <div className="text-2xl font-extrabold">{parentOrgCount}</div>
              <div className="text-xs font-semibold opacity-70">Parent Org Count</div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        {navItem("/details", "Details")}
        {navItem("/overview", "Overview")}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={onOpenFilters}
          className="
            w-full px-4 py-3 rounded-xl font-semibold text-left
            bg-white/10 hover:bg-white/20 transition
          "
        >
          🧪 Filters
        </button>

        <button
          onClick={onOpenBookmarks}
          className="
            w-full px-4 py-3 rounded-xl font-semibold text-left
            bg-white/10 hover:bg-white/20 transition
          "
        >
          ⭐ Bookmarks
        </button>

        {onSwitchView && (
          <button
            onClick={onSwitchView}
            className="
              w-full px-4 py-3 rounded-xl font-semibold text-left
              bg-white/10 hover:bg-white/20 transition
            "
          >
            🔁 Switch View
            {viewLabel && (
              <div className="text-[11px] opacity-80 mt-1">
                {viewLabel}
              </div>
            )}
          </button>
        )}

        {/* ✅ subtle sign out */}
        <button
          onClick={signOut}
          className="
            w-full px-4 py-3 rounded-xl font-semibold text-left
            bg-white/5 hover:bg-white/15 transition
          "
          title="Sign out"
        >
          🚪 Sign Out
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-between text-xs opacity-70">
        <span>Presented by ME-DMZ</span>

        {isInternal && (
          <Link
            to="/stats"
            title="Usage stats (internal)"
            className="text-sm opacity-60 hover:opacity-100 transition"
          >
            📊
          </Link>
        )}
      </div>
    </aside>
  );
}
