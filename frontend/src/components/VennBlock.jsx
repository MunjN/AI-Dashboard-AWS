export default function VennBlock({
  title = "Tools by Software Type",
  cloudOnly = 0,
  desktopOnly = 0,
  both = 0,
  onClickCloud,
  onClickDesktop,
  onClickBoth
}) {
  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white flex flex-col">
      <h3 className="text-center font-semibold text-blue-900 mb-2">{title}</h3>

      <div className="flex-1 flex items-center justify-center">
        <svg width="320" height="200" viewBox="0 0 320 200">
          {/* Left circle (Cloud) */}
          <circle
            cx="125"
            cy="100"
            r="75"
            fill="#b9d0ee"
            stroke="#2f6fb6"
            strokeWidth="2"
            onClick={onClickCloud}
            style={{ cursor: onClickCloud ? "pointer" : "default" }}
          />
          {/* Right circle (Desktop) */}
          <circle
            cx="195"
            cy="100"
            r="75"
            fill="#6f9ed6"
            stroke="#2f6fb6"
            strokeWidth="2"
            fillOpacity="0.9"
            onClick={onClickDesktop}
            style={{ cursor: onClickDesktop ? "pointer" : "default" }}
          />

          {/* Counts */}
          <text x="95" y="105" textAnchor="middle" fontSize="22" fill="#0b2a57">
            {cloudOnly}
          </text>
          <text x="225" y="105" textAnchor="middle" fontSize="22" fill="#0b2a57">
            {desktopOnly}
          </text>
          <text x="160" y="105" textAnchor="middle" fontSize="20" fill="#0b2a57">
            {both}
          </text>

          {/* Labels */}
          <text x="95" y="170" textAnchor="middle" fontSize="12" fill="#0b2a57">
            Cloud
          </text>
          <text x="225" y="170" textAnchor="middle" fontSize="12" fill="#0b2a57">
            Desktop
          </text>
        </svg>
      </div>

      {/* Legend-ish hint */}
      <div className="text-xs text-center text-blue-800 mt-2">
        Click a circle to filter
      </div>
    </div>
  );
}
