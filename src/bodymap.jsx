// bodymap.jsx — clickable spine / back region selector
// Regions: cervical, thoracic, lumbar, sacral. Controlled: value = [ids], onChange.

const SPINE_REGIONS = [
  { id: 'cervical', label: 'Cervical', sub: 'Neck', y: 0.06, h: 0.13 },
  { id: 'thoracic', label: 'Thoracic', sub: 'Upper / mid back', y: 0.21, h: 0.30 },
  { id: 'lumbar',   label: 'Lumbar',   sub: 'Lower back', y: 0.53, h: 0.22 },
  { id: 'sacral',   label: 'Sacral / SI', sub: 'Base of spine', y: 0.77, h: 0.16 },
];
window.SPINE_REGIONS = SPINE_REGIONS;

function BodyMap({ value = [], onChange, view = 'silhouette' }) {
  const W = 200, H = 320;
  const toggle = (id) => {
    const has = value.includes(id);
    onChange(has ? value.filter(v => v !== id) : [...value, id]);
  };
  const sel = (id) => value.includes(id);
  const fill = 'var(--blue)';

  // spine column geometry
  const colX = W / 2, colTop = H * 0.10, colBot = H * 0.92, colW = 26;

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
      {/* diagram */}
      <div style={{ position: 'relative', flexShrink: 0, width: W * 0.62 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
          {view === 'silhouette' && (
            <g>
              {/* back silhouette */}
              <circle cx={W/2} cy={H*0.085} r={W*0.115} fill="var(--blue-soft)" />
              <path d={`M ${W*0.30} ${H*0.20}
                Q ${W*0.18} ${H*0.22} ${W*0.20} ${H*0.34}
                L ${W*0.255} ${H*0.50}
                Q ${W*0.27} ${H*0.62} ${W*0.30} ${H*0.74}
                L ${W*0.34} ${H*0.93}
                Q ${W*0.5} ${H*0.965} ${W*0.66} ${H*0.93}
                L ${W*0.70} ${H*0.74}
                Q ${W*0.73} ${H*0.62} ${W*0.745} ${H*0.50}
                L ${W*0.80} ${H*0.34}
                Q ${W*0.82} ${H*0.22} ${W*0.70} ${H*0.20}
                Q ${W*0.5} ${H*0.165} ${W*0.30} ${H*0.20} Z`}
                fill="var(--blue-soft)" stroke="var(--blue-soft-2)" strokeWidth="1.5" />
            </g>
          )}
          {/* central spine line */}
          <line x1={colX} y1={colTop} x2={colX} y2={colBot} stroke="var(--line)" strokeWidth="3" strokeLinecap="round" />

          {/* clickable region segments */}
          {SPINE_REGIONS.map(r => {
            const ry = colTop + r.y * (colBot - colTop);
            const rh = r.h * (colBot - colTop);
            const on = sel(r.id);
            return (
              <g key={r.id} onClick={() => toggle(r.id)} style={{ cursor: 'pointer' }}>
                <rect x={colX - colW/2 - 12} y={ry} width={colW + 24} height={rh - 5} rx={colW/2 + 6} fill="transparent" />
                <rect x={colX - colW/2} y={ry} width={colW} height={rh - 6} rx={colW/2}
                  fill={on ? fill : 'var(--surface)'}
                  stroke={on ? fill : 'var(--line)'} strokeWidth={on ? 0 : 2}
                  style={{ transition: 'all .18s', filter: on ? 'drop-shadow(0 3px 8px color-mix(in srgb, var(--blue) 40%, transparent))' : 'none' }} />
                {/* vertebra ticks */}
                {[0.28, 0.5, 0.72].map((p, i) => (
                  <line key={i} x1={colX - colW/2 + 5} y1={ry + (rh-6)*p} x2={colX + colW/2 - 5} y2={ry + (rh-6)*p}
                    stroke={on ? 'rgba(255,255,255,.5)' : 'var(--line)'} strokeWidth="1.5" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* region legend / tappable labels */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
        {SPINE_REGIONS.map(r => {
          const on = sel(r.id);
          return (
            <button key={r.id} onClick={() => toggle(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
              padding: '9px 11px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: on ? 'var(--blue-soft)' : 'var(--surface)',
              boxShadow: on ? 'inset 0 0 0 1.5px var(--blue)' : 'inset 0 0 0 1.5px var(--line)',
              transition: 'all .15s',
            }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, flexShrink: 0, background: on ? 'var(--blue)' : 'transparent', boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--line)' }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: on ? 'var(--blue)' : 'var(--ink)' }}>{r.label}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{r.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.BodyMap = BodyMap;
