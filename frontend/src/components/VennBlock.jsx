// export default function VennBlock({
//   title = "Tools by Software Type",
//   cloudOnly = 0,
//   desktopOnly = 0,
//   both = 0,
//   onClickCloud,
//   onClickDesktop,
//   onClickBoth
// }) {
//   return (
//     <div className="border rounded-xl p-4 shadow-sm bg-white flex flex-col">
//       <h3 className="text-center font-semibold text-blue-900 mb-2">{title}</h3>

//       <div className="flex-1 flex items-center justify-center">
//         <svg width="320" height="200" viewBox="0 0 320 200">
//           {/* Left circle (Cloud) */}
//           <circle
//             cx="125"
//             cy="100"
//             r="75"
//             fill="#b9d0ee"
//             stroke="#2f6fb6"
//             strokeWidth="2"
//             onClick={onClickCloud}
//             style={{ cursor: onClickCloud ? "pointer" : "default" }}
//           />
//           {/* Right circle (Desktop) */}
//           <circle
//             cx="195"
//             cy="100"
//             r="75"
//             fill="#6f9ed6"
//             stroke="#2f6fb6"
//             strokeWidth="2"
//             fillOpacity="0.9"
//             onClick={onClickDesktop}
//             style={{ cursor: onClickDesktop ? "pointer" : "default" }}
//           />

//           {/* Counts */}
//           <text x="95" y="105" textAnchor="middle" fontSize="22" fill="#0b2a57">
//             {cloudOnly}
//           </text>
//           <text x="225" y="105" textAnchor="middle" fontSize="22" fill="#0b2a57">
//             {desktopOnly}
//           </text>
//           <text x="160" y="105" textAnchor="middle" fontSize="20" fill="#0b2a57">
//             {both}
//           </text>

//           {/* Labels */}
//           <text x="95" y="170" textAnchor="middle" fontSize="12" fill="#0b2a57">
//             Cloud
//           </text>
//           <text x="225" y="170" textAnchor="middle" fontSize="12" fill="#0b2a57">
//             Desktop
//           </text>
//         </svg>
//       </div>

//       {/* Legend-ish hint */}
//       <div className="text-xs text-center text-blue-800 mt-2">
//         Click a circle to filter
//       </div>
//     </div>
//   );
// }

import React from "react";
import { FX_DMZ_COLORS } from "../medmzTheme.js";

/**
 * Simple 3-circle venn used in Overview.
 * Props:
 *  - a, b, c numbers (counts)
 *  - labels: { a, b, c }
 */
export default function VennBlock({
  title = "Venn",
  a = 0,
  b = 0,
  c = 0,
  labels = { a: "A", b: "B", c: "C" },
  height = 260
}) {
  return (
    <div className="w-full">
      <div className="text-lg font-semibold text-[#232073] mb-2">{title}</div>

      <div
        className="flex items-center justify-center bg-white rounded-xl border border-gray-200"
        style={{ height }}
      >
        <svg width="340" height="220">
          {/* Left circle */}
          <circle
            cx="130"
            cy="110"
            r="75"
            fill={FX_DMZ_COLORS.lightBlue}
            fillOpacity="0.9"
            stroke={FX_DMZ_COLORS.darkBlue}
            strokeWidth="2"
          />
          {/* Right circle */}
          <circle
            cx="210"
            cy="110"
            r="75"
            fill={FX_DMZ_COLORS.green}
            fillOpacity="0.9"
            stroke={FX_DMZ_COLORS.darkBlue}
            strokeWidth="2"
          />
          {/* Bottom circle */}
          <circle
            cx="170"
            cy="165"
            r="75"
            fill={FX_DMZ_COLORS.yellow}
            fillOpacity="0.85"
            stroke={FX_DMZ_COLORS.darkBlue}
            strokeWidth="2"
          />

          {/* Labels + counts */}
          <text x="95" y="75" fontSize="12" fontWeight="700" fill={FX_DMZ_COLORS.darkBlue}>
            {labels.a}
          </text>
          <text x="235" y="75" fontSize="12" fontWeight="700" fill={FX_DMZ_COLORS.darkBlue}>
            {labels.b}
          </text>
          <text x="165" y="215" fontSize="12" fontWeight="700" textAnchor="middle" fill={FX_DMZ_COLORS.darkBlue}>
            {labels.c}
          </text>

          <text x="110" y="115" fontSize="18" fontWeight="800" fill={FX_DMZ_COLORS.darkBlue}>
            {a}
          </text>
          <text x="220" y="115" fontSize="18" fontWeight="800" fill={FX_DMZ_COLORS.darkBlue}>
            {b}
          </text>
          <text x="170" y="175" fontSize="18" fontWeight="800" textAnchor="middle" fill={FX_DMZ_COLORS.darkBlue}>
            {c}
          </text>
        </svg>
      </div>
    </div>
  );
}
