
// import { Link, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function LeftRail({
//   infraCount,
//   parentOrgCount,
//   onSwitchView,
//   viewLabel,
//   onOpenFilters,
//   onOpenBookmarks
// }) {
//   const location = useLocation();
//   const path = location.pathname;
//   const { user, signOut } = useAuth();

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
//       <div className="mb-2">
//         <a href="https://me-dmz.com" target="_blank" rel="noreferrer">
//           <div className="text-xl font-bold tracking-wide">ME-DMZ</div>
//           <div className="text-xs opacity-80">AI Tools Dashboard</div>
//         </a>
//       </div>

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

//       <div className="flex flex-col gap-2 mt-4">
//         {navItem("/details", "Details")}
//         {navItem("/overview", "Overview")}
//       </div>

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

//         {/* ✅ subtle sign out */}
//         <button
//           onClick={signOut}
//           className="
//             w-full px-4 py-3 rounded-xl font-semibold text-left
//             bg-white/5 hover:bg-white/15 transition
//           "
//           title="Sign out"
//         >
//           🚪 Sign Out
//         </button>
//       </div>

//       <div className="flex-1" />

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
          w-full px-4 py-3 rounded-md font-semibold text-left transition
          ${active ? "bg-me-sky text-me-ink shadow-me" : "bg-white/10 text-white hover:bg-white/20"}
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-me-ink text-white flex flex-col p-4 gap-4 shadow-me">
      {/* Header */}
      <div>
        <div className="text-xl font-bold tracking-wide">ME-DMZ AI Tools</div>
        <div className="text-xs opacity-80 mt-1">Dashboard</div>
      </div>

      {/* Counts */}
      {(infraCount != null || parentOrgCount != null) && (
        <div className="flex flex-col gap-3 mt-2">
          {infraCount != null && (
            <div className="bg-white text-me-ink rounded-md px-4 py-3 shadow-me">
              <div className="text-2xl font-extrabold">{infraCount}</div>
              <div className="text-xs font-semibold text-me-text">Tools Count</div>
            </div>
          )}

          {parentOrgCount != null && (
            <div className="bg-white text-me-ink rounded-md px-4 py-3 shadow-me">
              <div className="text-2xl font-extrabold">{parentOrgCount}</div>
              <div className="text-xs font-semibold text-me-text">Parent Org Count</div>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-col gap-2 mt-2">
        {navItem("/details", "Details")}
        {navItem("/overview", "Overview")}
      </div>

      {/* Actions */}
      <div className="mt-2 flex flex-col gap-2">
        <button
          onClick={onOpenFilters}
          className="w-full px-4 py-3 rounded-md font-semibold text-left bg-white/10 hover:bg-white/20 transition"
        >
          🧪 Filters
        </button>

        <button
          onClick={onOpenBookmarks}
          className="w-full px-4 py-3 rounded-md font-semibold text-left bg-white/10 hover:bg-white/20 transition"
        >
          ⭐ Bookmarks
        </button>

        {onSwitchView && (
          <button
            onClick={onSwitchView}
            className="w-full px-4 py-3 rounded-md font-semibold text-left bg-white/10 hover:bg-white/20 transition"
          >
            🔁 Switch View
            {viewLabel && (
              <div className="text-[11px] opacity-80 mt-1">{viewLabel}</div>
            )}
          </button>
        )}
      </div>

      {/* User footer */}
      <div className="mt-auto pt-4 border-t border-white/20 space-y-2">
        <div className="text-xs opacity-80 truncate">
          {email || "Signed in"}
        </div>

        <button
          onClick={signOut}
          className="w-full px-3 py-2 rounded-md text-sm font-semibold bg-white text-me-ink hover:bg-me-sky transition shadow-me"
        >
          Sign Out
        </button>

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
      </div>
    </aside>
  );
}
