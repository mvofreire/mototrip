/**
 * Illustrations of the "road" homepage: inline SVG so they weigh nothing,
 * follow the palette and never need an image request.
 */

/** Topographic contour lines with a red route drawing itself across them */
export function TopoRoute({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 820"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <g fill="none" stroke="#434C61" strokeWidth="1" opacity=".55">
        {Array.from({ length: 10 }, (_, i) => {
          const y = 640 - i * 40
          return (
            <path
              key={i}
              d={`M-40 ${y} C${200 + i * 20} ${y - 80} ${360 + i * 20} ${y + 60 - i * 10} ${620 + i * 20} ${y - 30 - i * 2} S${1000 + i * 20} ${y - 170} 1480 ${y - 80}`}
            />
          )
        })}
        <path d="M900 120 C980 90 1060 110 1100 160 S1060 260 980 250 S860 170 900 120Z" />
        <path d="M930 140 C990 120 1040 135 1065 165 S1040 225 990 220 S900 170 930 140Z" />
      </g>
      <path
        className="road-draw"
        pathLength={1}
        d="M120 700 C260 640 300 560 420 540 S600 600 700 520 S820 340 960 330 S1120 260 1180 180 S1300 120 1360 90"
        fill="none"
        stroke="#F5293D"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="120" cy="700" r="9" fill="#F6F7F9" />
      <circle className="road-pulse" cx="1360" cy="90" r="16" fill="#F5293D" />
      <circle cx="1360" cy="90" r="9" fill="#F5293D" stroke="#0d0f14" strokeWidth="3" />
      <circle cx="700" cy="520" r="7" fill="#0d0f14" stroke="#F6F7F9" strokeWidth="3" />
      <circle cx="960" cy="330" r="7" fill="#0d0f14" stroke="#F6F7F9" strokeWidth="3" />
    </svg>
  )
}

/** Route line preview on a dark card with faint contours */
export function RouteLine({
  d,
  width = 380,
  height = 190,
  strokeWidth = 4.5,
  className = '',
  label,
}: {
  d: string | null
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
  label?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width={width} height={height} fill="#1B1F29" />
      <g fill="none" stroke="#2B313F" strokeWidth="1.2">
        <path d={`M0 ${height * 0.26} C${width * 0.21} ${height * 0.16} ${width * 0.42} ${height * 0.37} ${width * 0.63} ${height * 0.24} S${width * 0.9} ${height * 0.16} ${width} ${height * 0.21}`} />
        <path d={`M0 ${height * 0.53} C${width * 0.24} ${height * 0.42} ${width * 0.45} ${height * 0.63} ${width * 0.66} ${height * 0.5} S${width * 0.92} ${height * 0.42} ${width} ${height * 0.47}`} />
        <path d={`M0 ${height * 0.79} C${width * 0.26} ${height * 0.68} ${width * 0.47} ${height * 0.89} ${width * 0.68} ${height * 0.76} S${width * 0.92} ${height * 0.68} ${width} ${height * 0.74}`} />
      </g>
      {d && (
        <path d={d} fill="none" stroke="#F5293D" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

/** A .gpx file icon */
export function GpxFileIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 32" className={className}>
      <path d="M3 2h15l7 7v21H3Z" fill="#fff" stroke="#0F1218" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 2v7h7" fill="none" stroke="#0F1218" strokeWidth="2" strokeLinejoin="round" />
      <rect x="1" y="16" width="22" height="10" rx="2" fill="#D90F25" />
      <text x="12" y="24" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="700" fill="#fff" textAnchor="middle">
        GPX
      </text>
    </svg>
  )
}

/** Large decorative route band behind the closing call to action */
export function RoadBand({ className = '' }: { className?: string }) {
  const d = 'M-20 390 C240 340 420 400 640 350 S1040 270 1460 320'
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" className={className}>
      <path d={d} fill="none" stroke="#7C101F" strokeWidth="60" strokeLinecap="round" opacity=".5" />
      <path d={d} fill="none" stroke="#F6F7F9" strokeWidth="2" strokeDasharray="18 16" opacity=".5" />
    </svg>
  )
}
