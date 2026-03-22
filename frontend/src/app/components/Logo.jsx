import React from 'react'

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { orbit: 14, core: 4, dot: 2.5,  dotSmall: 1.5, rx: 18, ry: 5,  textSize: 18 },
    md: { orbit: 18, core: 5, dot: 3,    dotSmall: 2,   rx: 22, ry: 7,  textSize: 22 },
    lg: { orbit: 34, core: 9, dot: 5,    dotSmall: 3,   rx: 42, ry: 13, textSize: 36 },
  }
  const s = sizes[size]
  const textColor = 'var(--text-main)'
  
  const boxSize = s.rx * 2 + s.dot * 2 + 4;
  const cx = boxSize / 2;
  const cy = boxSize / 2;

  return (
    <div className={`flex items-center select-none ${size === 'lg' ? 'gap-4' : 'gap-2'}`} style={{ color: textColor }}>
      <svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        {/* Orbits */}
        <g stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3">
          <ellipse cx={cx} cy={cy} rx={s.rx} ry={s.ry} transform={`rotate(35 ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx={s.rx} ry={s.ry} transform={`rotate(-35 ${cx} ${cy})`} />
        </g>
        {/* Core */}
        <circle cx={cx} cy={cy} r={s.core} fill="currentColor" />
        {/* Orbital dots */}
        <circle cx={cx + s.rx * 0.819} cy={cy + s.ry * 0.573} r={s.dot} fill="#F95C4B" transform={`rotate(35 ${cx} ${cy})`} />
        <circle cx={cx - s.rx * 0.819} cy={cy - s.ry * 0.573} r={s.dotSmall} fill="currentColor" transform={`rotate(-35 ${cx} ${cy})`} />
      </svg>
      
      {showText && (
        <div style={{ fontSize: s.textSize, fontWeight: 800, letterSpacing: '-0.03em' }} className="flex items-center tracking-tight leading-none">
          <span style={{ color: textColor }}>AskMee</span>
          <span style={{ color: '#F95C4B' }}>.AI</span>
        </div>
      )}
    </div>
  )
}
