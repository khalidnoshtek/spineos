// ui.jsx — SpineOS shared UI primitives
// Humanist clinical components. All reference design tokens from the root <style>.

// ── palette helpers ───────────────────────────────────────────
const RISK = {
  low:      { key: 'low',      label: 'Low',      c: 'var(--green)', soft: 'var(--green-soft)', word: 'On track' },
  moderate: { key: 'moderate', label: 'Moderate', c: 'var(--amber)', soft: 'var(--amber-soft)', word: 'Room to improve' },
  high:     { key: 'high',     label: 'High',     c: 'var(--red)',   soft: 'var(--red-soft)',   word: 'Worth attention' },
};
window.RISK = RISK;

// ── layout: scrollable screen body ────────────────────────────
function Screen({ children, pad = true, style = {}, scrollRef, dark = false }) {
  return (
    <div
      ref={scrollRef}
      className="app-scroll"
      style={{
        flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        background: dark ? 'transparent' : 'var(--bg)',
        padding: pad ? '0 20px 28px' : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── top app bar with optional progress ────────────────────────
function TopBar({ onBack, onClose, step, total, label = 'Assessment', tint = 'var(--blue)' }) {
  const pct = step && total ? Math.round((step / total) * 100) : null;
  return (
    <div style={{ paddingTop: 54, background: 'var(--surface)', position: 'relative', zIndex: 4, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px 12px' }}>
        {onBack ? (
          <button onClick={onBack} aria-label="Back" style={iconBtn}>
            <Icon name="back" size={20} />
          </button>
        ) : <div style={{ width: 38 }} />}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            {label}
          </div>
        </div>
        {onClose ? (
          <button onClick={onClose} aria-label="Close" style={iconBtn}>
            <Icon name="close" size={19} />
          </button>
        ) : <div style={{ width: 38 }} />}
      </div>
      {pct != null && (
        <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: tint, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>
            {step}<span style={{ color: 'var(--ink-3)' }}>/{total}</span>
          </span>
        </div>
      )}
      <div style={{ height: 1, background: 'var(--line)' }} />
    </div>
  );
}
const iconBtn = {
  width: 38, height: 38, borderRadius: 12, border: 'none', background: 'var(--bg)',
  color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flexShrink: 0,
};

// ── screen heading block ──────────────────────────────────────
function Heading({ eyebrow, title, sub, icon, tint = 'var(--blue)' }) {
  return (
    <div style={{ paddingTop: 22 }}>
      {icon && (
        <div style={{
          width: 50, height: 50, borderRadius: 16, marginBottom: 14,
          background: 'var(--blue-soft)', color: tint, display: 'grid', placeItems: 'center',
        }}>
          <Icon name={icon} size={26} sw={1.9} />
        </div>
      )}
      {eyebrow && (
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, letterSpacing: '.14em', textTransform: 'uppercase', color: tint, marginBottom: 8 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 27, lineHeight: 1.12, letterSpacing: '-.01em', color: 'var(--ink)', textWrap: 'balance' }}>
        {title}
      </h1>
      {sub && <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.5, color: 'var(--ink-2)', maxWidth: '32ch' }}>{sub}</p>}
    </div>
  );
}

// ── bottom action bar ─────────────────────────────────────────
function BottomBar({ children }) {
  return (
    <div style={{
      flexShrink: 0, padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(to top, var(--surface) 72%, transparent)',
      borderTop: '1px solid var(--line-2)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {children}
    </div>
  );
}

// ── buttons ───────────────────────────────────────────────────
function Button({ children, onClick, disabled, variant = 'primary', icon, iconRight, full = true, tint = 'var(--blue)', style = {} }) {
  const base = {
    height: 54, borderRadius: 16, border: 'none', width: full ? '100%' : undefined,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, letterSpacing: '.005em',
    transition: 'transform .12s ease, box-shadow .2s, background .2s, opacity .2s',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
  };
  const variants = {
    primary: { background: tint, color: '#fff', boxShadow: '0 6px 18px -6px color-mix(in srgb, var(--blue) 55%, transparent)' },
    success: { background: 'var(--green)', color: '#fff', boxShadow: '0 6px 18px -6px color-mix(in srgb, var(--green) 55%, transparent)' },
    ghost:   { background: 'var(--bg)', color: 'var(--ink)', height: 50 },
    quiet:   { background: 'transparent', color: 'var(--ink-2)', height: 46, fontWeight: 600 },
    outline: { background: 'var(--surface)', color: tint, boxShadow: 'inset 0 0 0 1.5px var(--line)', height: 50 },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(.98)')}
      onMouseUp={e => (e.currentTarget.style.transform = '')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={19} />}
      {children}
      {iconRight && <Icon name={iconRight} size={19} />}
    </button>
  );
}

// ── card ──────────────────────────────────────────────────────
function Card({ children, style = {}, pad = 18, onClick, raised = true, tint }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: pad,
      boxShadow: raised ? 'var(--sh-2)' : 'none',
      border: raised ? '1px solid var(--line-2)' : '1px solid var(--line)',
      cursor: onClick ? 'pointer' : 'default',
      ...(tint ? { background: tint } : {}),
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── text field with floating label & suffix ───────────────────
function Field({ label, value, onChange, placeholder, suffix, type = 'text', inputMode, icon }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{ display: 'block', minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 7, marginLeft: 2 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 54, padding: '0 16px',
        background: 'var(--surface)', borderRadius: 14,
        boxShadow: focus ? 'inset 0 0 0 2px var(--blue)' : 'inset 0 0 0 1.5px var(--line)',
        transition: 'box-shadow .15s',
      }}>
        {icon && <span style={{ color: 'var(--ink-3)' }}><Icon name={icon} size={19} /></span>}
        <input
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          type={type} inputMode={inputMode}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 500, color: 'var(--ink)',
          }}
        />
        {suffix && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--ink-3)', flexShrink: 0 }}>{suffix}</span>}
      </div>
    </label>
  );
}

// ── selectable option tile (icon + label, optional sub) ────────
function OptionTile({ icon, label, sub, selected, onClick, tint = 'var(--blue)' }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left',
      padding: '14px 16px', borderRadius: 16, border: 'none', cursor: 'pointer',
      background: selected ? 'var(--blue-soft)' : 'var(--surface)',
      boxShadow: selected ? `inset 0 0 0 2px ${tint}` : 'inset 0 0 0 1.5px var(--line)',
      transition: 'background .15s, box-shadow .15s',
    }}>
      {icon && (
        <span style={{
          width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center', flexShrink: 0,
          background: selected ? tint : 'var(--bg)', color: selected ? '#fff' : 'var(--ink-2)', transition: 'all .15s',
        }}>
          <Icon name={icon} size={21} />
        </span>
      )}
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: 'var(--ink)' }}>{label}</span>
        {sub && <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-2)', marginTop: 1 }}>{sub}</span>}
      </span>
      <span style={{
        width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: 'grid', placeItems: 'center',
        background: selected ? tint : 'transparent', boxShadow: selected ? 'none' : 'inset 0 0 0 2px var(--line)',
        color: '#fff', transition: 'all .15s',
      }}>
        {selected && <Icon name="check" size={14} sw={2.6} />}
      </span>
    </button>
  );
}

// ── compact choice chips (segmented, wraps) ───────────────────
function Chips({ options, value, onChange, tint = 'var(--blue)', columns }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : 'repeat(auto-fit, minmax(72px, 1fr))', gap: 8 }}>
      {options.map(o => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const on = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            padding: '12px 8px', borderRadius: 13, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5,
            background: on ? tint : 'var(--surface)', color: on ? '#fff' : 'var(--ink)',
            boxShadow: on ? 'none' : 'inset 0 0 0 1.5px var(--line)', transition: 'all .14s',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// ── custom range slider with value bubble ─────────────────────
function Slider({ value, min = 0, max = 10, step = 1, onChange, tint = 'var(--blue)', format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', padding: '4px 0' }}>
      <div style={{ position: 'relative', height: 12, borderRadius: 999, background: 'var(--line)' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 999, background: tint, transition: 'width .08s linear' }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)',
          width: 26, height: 26, borderRadius: 999, background: '#fff', boxShadow: '0 2px 8px rgba(17,33,46,.22), inset 0 0 0 2px ' + 'currentColor',
          color: tint, pointerEvents: 'none',
        }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'pointer' }} />
      </div>
    </div>
  );
}

// ── radial semicircle risk gauge (needle) ─────────────────────
function pt(cx, cy, r, deg) { const a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, t1, t2) {
  const d1 = 180 + t1 * 180, d2 = 180 + t2 * 180;
  const [x1, y1] = pt(cx, cy, r, d1), [x2, y2] = pt(cx, cy, r, d2);
  const large = (t2 - t1) > 0.5 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
function Gauge({ value = 50, size = 240, level }) {
  // value 0-100 = RISK (higher worse). zones: low<40, mod 40-70, high>70
  const sw = 18, pad = sw / 2 + 6;
  const r = (size - pad * 2) / 2, cx = size / 2, cy = size / 2 + 4;
  const h = cy + sw / 2 + 6;
  const t = Math.max(0, Math.min(1, value / 100));
  const lv = level || (value < 40 ? RISK.low : value < 70 ? RISK.moderate : RISK.high);
  const markDeg = 180 + t * 180;
  const [mx, my] = pt(cx, cy, r, markDeg);
  const zones = [[0, 0.4, 'var(--green)'], [0.4, 0.7, 'var(--amber)'], [0.7, 1, 'var(--red)']];
  return (
    <div style={{ position: 'relative', width: size, height: h, margin: '0 auto' }}>
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} style={{ overflow: 'visible' }}>
        <path d={arcPath(cx, cy, r, 0, 1)} fill="none" stroke="var(--line)" strokeWidth={sw} strokeLinecap="round" />
        {zones.map(([a, b, c], i) => (
          <path key={i} d={arcPath(cx, cy, r, a + 0.012, b - 0.012)} fill="none" stroke={c} strokeWidth={sw}
            strokeLinecap="round" opacity={0.92} />
        ))}
        {/* value marker on the arc */}
        <g>
          <circle cx={mx} cy={my} r={sw / 2 + 4} fill="var(--surface)" stroke={lv.c} strokeWidth={4} />
          <circle cx={mx} cy={my} r={3} fill={lv.c} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy - 58, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 46, lineHeight: 1, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(value)}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '.12em', color: 'var(--ink-3)', marginTop: 5 }}>RISK INDEX</div>
      </div>
      <div style={{ position: 'absolute', left: pad - 6, bottom: 0, fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>LOW</div>
      <div style={{ position: 'absolute', right: pad - 6, bottom: 0, fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>HIGH</div>
    </div>
  );
}

// ── circular progress ring (sub-scores; higher = better) ──────
function Ring({ value = 70, size = 64, sw = 7, color = 'var(--blue)', children, track = 'var(--line)' }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

// ── risk classification badge ─────────────────────────────────
function RiskBadge({ level, size = 'md' }) {
  const lv = typeof level === 'string' ? RISK[level] : level;
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: big ? '8px 16px' : '5px 11px', borderRadius: 999,
      background: lv.soft, color: lv.c,
      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: big ? 15 : 12.5, letterSpacing: '.02em',
    }}>
      <span style={{ width: big ? 9 : 7, height: big ? 9 : 7, borderRadius: 999, background: lv.c }} />
      {lv.label} Risk
    </span>
  );
}

// ── labelled stat row ─────────────────────────────────────────
function StatRow({ icon, label, value, hint, tint = 'var(--ink-2)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0' }}>
      {icon && <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg)', color: tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={icon} size={18} /></span>}
      <span style={{ flex: 1, fontSize: 14.5, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</span>
      <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {hint && <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-3)' }}>{hint}</span>}
      </span>
    </div>
  );
}

Object.assign(window, {
  Screen, TopBar, Heading, BottomBar, Button, Card, Field, OptionTile,
  Chips, Slider, Gauge, Ring, RiskBadge, StatRow,
});
