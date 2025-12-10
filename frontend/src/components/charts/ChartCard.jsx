export default function ChartCard({ title, small = false, children }) {
  return (
    <div className="bg-white rounded-md p-8 shadow-me border border-me-border">
      <h2 className="text-[20px] font-bold text-me-ink mb-6">
        {title}
      </h2>

      {/* heights matching design dump:
          normal: 350px, small: 300px */}
      <div
        className="relative w-full"
        style={{ height: small ? 300 : 350 }}
      >
        {children}
      </div>
    </div>
  );
}
