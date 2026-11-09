const ICONS = {
  play: { d: 'M8 5v14l11-7z', fill: true },
  pause: { d: 'M6 5h4v14H6zM14 5h4v14h-4z', fill: true },
  next: { d: 'M6 5l10 7-10 7zM18 5v14', fill: true },
  plus: { d: 'M12 5v14M5 12h14' },
  check: { d: 'M5 12l5 5 9-10' },
  thumb: { d: 'M7 10v10H4V10h3zM7 10l4-7a2 2 0 0 1 2 2.4L12.5 9H19a2 2 0 0 1 2 2.3l-1.2 6.5A2 2 0 0 1 17.8 20H7' },
  'chevron-down': { d: 'M6 9l6 6 6-6' },
  'chevron-left': { d: 'M15 6l-6 6 6 6' },
  'chevron-right': { d: 'M9 6l6 6-6 6' },
  search: { d: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5' },
  settings: { d: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4' },
  info: { d: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5h.01' },
  home: { d: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z' },
  new: { d: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z' },
  list: { d: 'M6 4h12v17l-6-4-6 4z' },
  menu: { d: 'M4 6h16M4 12h16M4 18h16' },
  close: { d: 'M6 6l12 12M18 6L6 18' },
  back: { d: 'M19 12H5M11 6l-6 6 6 6' },
  rewind10: { d: 'M11 6V3L6 7l5 4V8a6 6 0 1 1-6 6', text: '10' },
  forward10: { d: 'M13 6V3l5 4-5 4V8a6 6 0 1 0 6 6', text: '10' },
  volume: { d: 'M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12' },
  mute: { d: 'M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6' },
  captions: { d: 'M3 5h18v14H3z', text: 'CC', ty: 14.2 },
  quality: { d: 'M3 5h18v14H3z', text: 'HD', ty: 14.2 },
  speed: { d: 'M4 18a8 8 0 1 1 16 0M12 18l4-6' },
  theater: { d: 'M3 7h18v10H3z' },
  fullscreen: { d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' },
  'exit-fs': { d: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5' },
  rotate: { d: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5' }
}

export default function Icon({ name, size = 24, className }) {
  const def = ICONS[name]
  if (!def) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={def.fill ? 'currentColor' : 'none'}
      stroke={def.fill ? 'none' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={def.d} />
      {def.text && (
        <text x="12" y={def.ty ?? 15.5} fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none">
          {def.text}
        </text>
      )}
    </svg>
  )
}
