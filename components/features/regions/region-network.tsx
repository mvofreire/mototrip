/**
 * A destination's routes drawn together on one projection (see
 * routesNetworkSvg): large in the page hero, small on the destination cards.
 * Inline SVG, so it weighs nothing and needs no map tiles.
 */

const RED = '#F5293D'

/** Hero background: faint contours and the region's roads drawing themselves */
export function RegionNetworkHero({
  paths,
  className = '',
  weight = 1,
}: {
  paths: string[]
  className?: string
  /** Line width multiplier: a whole continent needs thicker lines than one region */
  weight?: number
}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" className={className}>
      <defs>
        <filter id="dest-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill="none" stroke="#434C61" strokeWidth="1" opacity=".45">
        {Array.from({ length: 8 }, (_, i) => {
          const y = 520 - i * 56
          return (
            <path
              key={i}
              d={`M-40 ${y} C${140 + i * 18} ${y - 70} ${300 + i * 14} ${y + 50 - i * 8} ${460 + i * 12} ${y - 24} S${700 + i * 10} ${y - 120} 860 ${y - 60}`}
            />
          )
        })}
      </g>
      {/* The blur is repainted on every frame of the draw animation: wide screens only */}
      <g className="md:[filter:url(#dest-glow)]">
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="dest-draw"
            style={{ '--d': `${300 + Math.min(i, 12) * 120}ms` } as React.CSSProperties}
            fill="none"
            stroke={RED}
            strokeOpacity={i === 0 ? 1 : 0.8}
            strokeWidth={(i === 0 ? 4 : 2.75) * weight}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  )
}

/** Card preview: dark tile, routes redraw on hover */
export function RegionNetworkThumb({
  paths,
  width = 360,
  height = 170,
  className = '',
}: {
  paths: string[]
  width?: number
  height?: number
  className?: string
}) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className={className}>
      <rect width={width} height={height} fill="#1B1F29" />
      <g fill="none" stroke="#2B313F" strokeWidth="1.2">
        <path d={`M0 ${height * 0.3} C${width * 0.25} ${height * 0.18} ${width * 0.45} ${height * 0.4} ${width * 0.65} ${height * 0.27} S${width * 0.9} ${height * 0.18} ${width} ${height * 0.24}`} />
        <path d={`M0 ${height * 0.62} C${width * 0.24} ${height * 0.5} ${width * 0.46} ${height * 0.72} ${width * 0.68} ${height * 0.58} S${width * 0.92} ${height * 0.5} ${width} ${height * 0.55}`} />
      </g>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          className="dest-line"
          style={{ '--d': `${i * 90}ms` } as React.CSSProperties}
          fill="none"
          stroke={RED}
          strokeOpacity={i === 0 ? 1 : 0.7}
          strokeWidth={i === 0 ? 3.5 : 2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
