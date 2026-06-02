// icons.jsx — clean humanist line-icons (24×24, currentColor stroke)
// Kept deliberately simple: strokes, circles, basic paths.

function Icon({ name, size = 22, sw = 1.75, style = {}, ...rest }) {
  const P = ICON_PATHS[name];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }} aria-hidden="true" {...rest}>
      {P}
    </svg>
  );
}

const ICON_PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  forward: <path d="M9 5l7 7-7 7" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.5 2.5 4.7-5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M5.5 19.5c.7-3.4 3.3-5.2 6.5-5.2s5.8 1.8 6.5 5.2" /></>,
  heart: <path d="M12 20s-7-4.4-9.2-9C1.3 7.6 3 4.5 6 4.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3 0 4.7 3.1 3.2 6.5C19 15.6 12 20 12 20z" />,
  activity: <path d="M3 12h3.5l2.5 6 4-15 2.5 9H21" />,
  pulse: <path d="M3 12h3.5l2.5 6 4-15 2.5 9H21" />,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4 6.4 6.4 0 0 0 20 14.5z" />,
  walk: <><circle cx="13" cy="4.5" r="1.8" /><path d="M11 21l1.5-5-2.5-2.5 1-5 3 2 2.5 1.5M9.5 13.5L8 21" /></>,
  steps: <><path d="M7.5 4c1.4 0 2 1.6 2 3.6s-.2 4.4-2 4.4-2-2.4-2-4.4S6.1 4 7.5 4z" /><path d="M16.5 9c1.4 0 2 1.6 2 3.6s-.2 4.4-2 4.4-2-2.4-2-4.4S15.1 9 16.5 9z" /></>,
  briefcase: <><rect x="3" y="7.5" width="18" height="12" rx="2.5" /><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18" /></>,
  ruler: <><rect x="3.5" y="8" width="17" height="8" rx="1.6" transform="rotate(0 12 12)" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>,
  scale: <><path d="M4 8h16l-2.2 11.5H6.2L4 8z" /><circle cx="12" cy="5" r="1.6" /><path d="M12 6.6V8" /></>,
  watch: <><rect x="6.5" y="6.5" width="11" height="11" rx="3.4" /><path d="M9 6.5l.6-2.5h4.8l.6 2.5M9 17.5l.6 2.5h4.8l.6-2.5M12 9.5V12l1.8 1" /></>,
  link: <path d="M9 15l6-6M10.5 6.5l1-1a3.5 3.5 0 0 1 5 5l-1 1M13.5 17.5l-1 1a3.5 3.5 0 0 1-5-5l1-1" />,
  shield: <><path d="M12 3l7 2.5v5.5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V5.5L12 3z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></>,
  car: <><path d="M4 16v2.5M20 16v2.5M3.5 16h17l-1.2-5.2A2.5 2.5 0 0 0 16.9 9H7.1a2.5 2.5 0 0 0-2.4 1.8L3.5 16z" /><path d="M6.5 13h11" /><circle cx="7" cy="16" r="0" /></>,
  home: <path d="M4 11l8-6 8 6M6 9.5V20h12V9.5" />,
  book: <path d="M5 5.5A2 2 0 0 1 7 4h11v14H7a2 2 0 0 0-2 2V5.5zM5 5.5V20" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  download: <path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" />,
  trend: <path d="M4 16l5-5 3.5 3.5L20 7M20 7h-4M20 7v4" />,
  bars: <path d="M5 19V11M10 19V5M15 19v-6M20 19V8" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></>,
  edit: <path d="M5 19h3l9-9-3-3-9 9v3zM14 7l3 3" />,
  bolt: <path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" />,
  bed: <path d="M4 18v-7m0 3h16m0 4v-5.5A1.5 1.5 0 0 0 18.5 9H8v4M4 9v9M20 18v-2" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M3 12h2M19 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" /></>,
  flame: <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.6-2.3 1.3-3 .2 1 .9 1.6 1.7 1.6C12 8 11 6 12 3z" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  drop: <path d="M12 3.5c3 3.8 5.5 6.6 5.5 9.8a5.5 5.5 0 0 1-11 0c0-3.2 2.5-6 5.5-9.8z" />,
  stretch: <><circle cx="12" cy="4.5" r="1.8" /><path d="M12 7v6m0 0l-3.5 7M12 13l3.5 7M7 9.5l5 1.5 5-1.5" /></>,
  refresh: <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" />,
};

window.Icon = Icon;
