/*
 * Hero illustration: a radar sweeping over a household's items, with one
 * matched recall highlighted and an example alert card underneath.
 * Purely illustrative — no real recall data is shown on the public site.
 */

const blips = [
  { x: 68, y: 30, label: "Baby spinach", tone: "alert" as const, delay: "0s" },
  { x: 28, y: 36, label: "Dog kibble", tone: "clear" as const, delay: "1.2s" },
  { x: 36, y: 72, label: "Blood pressure Rx", tone: "clear" as const, delay: "2.1s" },
  { x: 74, y: 66, label: "Car seat", tone: "clear" as const, delay: "2.8s" },
];

export default function RadarVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto" aria-hidden="true">
      <div className="radar relative aspect-square rounded-full overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 shadow-2xl ring-1 ring-white/10">
        {/* rings + cross hairs */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {[46, 34, 22, 10].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#93c5fd" strokeOpacity=".18" strokeWidth=".35" />
          ))}
          <line x1="50" y1="2" x2="50" y2="98" stroke="#93c5fd" strokeOpacity=".12" strokeWidth=".3" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="#93c5fd" strokeOpacity=".12" strokeWidth=".3" />
        </svg>

        {/* sweep */}
        <div className="radar-sweep absolute inset-0 rounded-full" />

        {/* blips */}
        {blips.map((b) => (
          <div
            key={b.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          >
            <span
              className={`radar-blip block rounded-full ${b.tone === "alert" ? "w-3.5 h-3.5 bg-amber-400 radar-blip-alert" : "w-2.5 h-2.5 bg-emerald-400"}`}
              style={{ animationDelay: b.delay }}
            />
            <span
              className={`mt-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${
                b.tone === "alert" ? "bg-amber-400 text-amber-950" : "bg-white/10 text-blue-100"
              }`}
            >
              {b.label}
            </span>
          </div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-200" />
      </div>

      {/* Example alert card */}
      <div className="relative -mt-16 mx-4 sm:mx-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 text-left">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Recall match
          </span>
          <span className="text-xs text-gray-400">Example alert</span>
        </div>
        <p className="mt-3 font-bold text-gray-900">Organic baby spinach, 5 oz clamshell</p>
        <p className="text-sm text-gray-600">Possible Listeria contamination</p>
        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <span className="font-semibold">Why you&apos;re seeing this:</span> it&apos;s a brand on your household&apos;s grocery list.
        </div>
        <p className="mt-3 text-sm text-gray-700">
          <span className="font-semibold">What to do:</span> check the best-by date, don&apos;t eat it, and return it for a refund.
        </p>
      </div>
    </div>
  );
}
