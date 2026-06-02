// screens-intake.jsx — Onboarding, Patient Info, Occupation, Lifestyle
// Screen contract: ({ d, set, next, back, t, scores })  set(patch) merges into data.

// ── brand mark ────────────────────────────────────────────────
function Logo({ size = 34, withWord = true, tint = 'var(--blue)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
      <span style={{ width: size, height: size, borderRadius: size * 0.28, background: tint, display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 12px -4px color-mix(in srgb, var(--blue) 60%, transparent)' }}>
        <svg width={size * 0.5} height={size * 0.62} viewBox="0 0 16 22" fill="none">
          {[2, 7, 12, 17].map((cy, i) => (
            <rect key={i} x={i % 2 ? 5 : 3} y={cy} width="10" height="3.4" rx="1.7" fill="#fff" opacity={0.55 + i * 0.15} />
          ))}
        </svg>
      </span>
      {withWord && (
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size * 0.56, letterSpacing: '-.01em', color: 'var(--ink)' }}>
          Spine<span style={{ color: tint }}>OS</span>
        </span>
      )}
    </div>
  );
}
window.Logo = Logo;

const PRINCIPLE = [
  { k: 'Measure', icon: 'ruler' }, { k: 'Assess', icon: 'list' }, { k: 'Score', icon: 'target' },
  { k: 'Classify', icon: 'bars' }, { k: 'Recommend', icon: 'spark' },
];

// ── 1. Onboarding + consent ───────────────────────────────────
function Onboarding({ d, set, next, t }) {
  const tint = t.accent;
  const wearables = [
    { id: 'apple', label: 'Apple Health' },
    { id: 'google', label: 'Google Fit' },
    { id: 'fitbit', label: 'Fitbit' },
  ];
  const minimal = t.onboarding === 'Minimal';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
      <Screen pad style={{ background: 'var(--surface)', paddingTop: 64 }}>
        <div>
          <Logo tint={tint} />
        </div>

        {!minimal && (
          <div style={{ marginTop: 30, position: 'relative', height: 150, borderRadius: 22, overflow: 'hidden', background: `linear-gradient(135deg, var(--blue-soft) 0%, color-mix(in srgb, var(--blue) 4%, white) 100%)`, display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 200 150" width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
              {[...Array(7)].map((_, i) => <line key={i} x1={0} y1={20 + i * 20} x2={200} y2={20 + i * 20} stroke="color-mix(in srgb, var(--blue) 12%, transparent)" strokeWidth="1" />)}
            </svg>
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <Logo size={56} withWord={false} tint={tint} />
              <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '.06em', color: tint }}>SPINAL HEALTH, MEASURED</div>
            </div>
          </div>
        )}

        <h1 style={{ margin: '28px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, lineHeight: 1.12, letterSpacing: '-.015em', color: 'var(--ink)', textWrap: 'balance' }}>
          A clearer picture of your back health
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
          A short, science-based assessment turns your daily habits into a personalized risk profile — and practical ways to improve.
        </p>

        {!minimal && (
          <div style={{ display: 'flex', gap: 7, marginTop: 22, flexWrap: 'wrap' }}>
            {PRINCIPLE.map((p, i) => (
              <span key={p.k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 999, background: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: 'var(--ink-2)' }}>
                <span style={{ color: tint }}><Icon name={p.icon} size={15} /></span>{p.k}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 10 }}>Connect a device <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>(optional)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {wearables.map(w => {
              const on = d.connectedDevice === w.id;
              return (
                <button key={w.id} onClick={() => set({ connectedDevice: on ? null : w.id })} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '14px 6px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: on ? 'var(--blue-soft)' : 'var(--surface)', boxShadow: on ? `inset 0 0 0 2px ${tint}` : 'inset 0 0 0 1.5px var(--line)', transition: 'all .15s',
                }}>
                  <span style={{ color: on ? tint : 'var(--ink-2)' }}><Icon name="watch" size={22} /></span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: on ? tint : 'var(--ink-2)', lineHeight: 1.2, textAlign: 'center' }}>{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => set({ consent: !d.consent })} style={{
          display: 'flex', alignItems: 'flex-start', gap: 11, marginTop: 22, padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
          background: 'var(--bg)',
        }}>
          <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 1, display: 'grid', placeItems: 'center', background: d.consent ? tint : 'var(--surface)', boxShadow: d.consent ? 'none' : 'inset 0 0 0 2px var(--line)', color: '#fff', transition: 'all .15s' }}>
            {d.consent && <Icon name="check" size={15} sw={2.6} />}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            I consent to SpineOS processing my health and activity data to generate a personalized assessment. Your data stays private and is never sold.
          </span>
        </button>
      </Screen>

      <BottomBar>
        <Button onClick={next} disabled={!d.consent} tint={tint} iconRight="forward">
          {d.connectedDevice ? 'Connect & begin' : 'Begin assessment'}
        </Button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)' }}>Takes about 3 minutes · No account needed</div>
      </BottomBar>
    </div>
  );
}

// ── small inline stepper ──────────────────────────────────────
function HrStepper({ value, onChange, min = 0, max = 16, step = 1, unit = 'h', tint = 'var(--blue)' }) {
  const btn = (dir) => (
    <button onClick={() => onChange(Math.max(min, Math.min(max, +(value + dir * step).toFixed(1))))} style={{
      width: 40, height: 40, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0,
      background: 'var(--bg)', color: 'var(--ink)', display: 'grid', placeItems: 'center',
    }}><Icon name={dir > 0 ? 'plus' : 'minus'} size={17} sw={2.4} /></button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {btn(-1)}
      <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
        {value}<span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700 }}> {unit}</span>
      </div>
      {btn(1)}
    </div>
  );
}

function SubSectionLabel({ children }) {
  return <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink-2)', margin: '0 0 9px 2px' }}>{children}</div>;
}
window.SubSectionLabel = SubSectionLabel;

// ── 2. Patient information ────────────────────────────────────
function PatientInfo({ d, set, next, back, t, step, total }) {
  const tint = t.accent;
  const bmi = bmiOf(d);
  const band = bmiBand(bmi);
  const ok = d.name && d.age && d.height && d.weight;
  return (
    <>
      <TopBar onBack={back} step={step} total={total} tint={tint} />
      <Screen>
        <Heading eyebrow="About you" title="Patient information" sub="We use this to calculate your BMI and tailor your risk model." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          <Field label="Full name" value={d.name} onChange={v => set({ name: v })} placeholder="Your name" icon="user" />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.85fr) minmax(0,1.15fr)', gap: 12 }}>
            <Field label="Age" value={d.age} onChange={v => set({ age: v.replace(/\D/g, '').slice(0,3) })} suffix="yrs" inputMode="numeric" />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 7, marginLeft: 2 }}>Gender</div>
              <Chips columns={3} value={d.gender} onChange={v => set({ gender: v })} tint={tint}
                options={[{ value: 'female', label: 'F' }, { value: 'male', label: 'M' }, { value: 'other', label: 'Other' }]} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }}>
            <Field label="Height" value={d.height} onChange={v => set({ height: +v.replace(/\D/g, '').slice(0,3) })} suffix="cm" inputMode="numeric" icon="ruler" />
            <Field label="Weight" value={d.weight} onChange={v => set({ weight: +v.replace(/\D/g, '').slice(0,3) })} suffix="kg" inputMode="numeric" icon="scale" />
          </div>

          <Card pad={16} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Ring value={Math.max(8, Math.min(100, (bmi/40)*100))} size={66} sw={7} color={band.c}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>{bmi.toFixed(1)}</div>
              </div>
            </Ring>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, letterSpacing: '.06em', color: 'var(--ink-3)' }}>BODY MASS INDEX</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: band.c, marginTop: 2 }}>{band.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>Auto-calculated from height & weight</div>
            </div>
          </Card>
        </div>
      </Screen>
      <BottomBar><Button onClick={next} disabled={!ok} tint={tint} iconRight="forward">Continue</Button></BottomBar>
    </>
  );
}

// ── 3. Occupation & work pattern ──────────────────────────────
function Occupation({ d, set, next, back, t, step, total }) {
  const tint = t.accent;
  const occs = [
    { value: 'office', label: 'Office / Desk', icon: 'briefcase' },
    { value: 'driver', label: 'Driver', icon: 'car' },
    { value: 'field', label: 'Field Work', icon: 'activity' },
    { value: 'manual', label: 'Manual Labor', icon: 'bolt' },
    { value: 'homemaker', label: 'Homemaker', icon: 'home' },
    { value: 'student', label: 'Student', icon: 'book' },
  ];
  return (
    <>
      <TopBar onBack={back} step={step} total={total} tint={tint} />
      <Screen>
        <Heading eyebrow="Work pattern" title="How do you spend your day?" sub="Posture and load at work are major drivers of back strain." />
        <div style={{ marginTop: 22 }}>
          <SubSectionLabel>Occupation type</SubSectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {occs.map(o => {
              const on = d.occupation === o.value;
              return (
                <button key={o.value} onClick={() => set({ occupation: o.value })} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '13px 13px', borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: on ? 'var(--blue-soft)' : 'var(--surface)', boxShadow: on ? `inset 0 0 0 2px ${tint}` : 'inset 0 0 0 1.5px var(--line)', transition: 'all .15s',
                }}>
                  <span style={{ color: on ? tint : 'var(--ink-3)' }}><Icon name={o.icon} size={20} /></span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: on ? 'var(--ink)' : 'var(--ink-2)' }}>{o.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <SubSectionLabel>Hours per day</SubSectionLabel>
          <Card pad={6}>
            {[['Sitting', 'sitHrs', 'clock'], ['Standing', 'standHrs', 'walk'], ['Driving', 'driveHrs', 'car']].map(([lbl, key, icon], i) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={icon} size={18} /></span>
                <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{lbl}</span>
                <div style={{ width: 150 }}><HrStepper value={d[key]} onChange={v => set({ [key]: v })} tint={tint} /></div>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ marginTop: 24 }}>
          <SubSectionLabel>Lifting activity</SubSectionLabel>
          <Chips columns={4} value={d.lifting} onChange={v => set({ lifting: v })} tint={tint}
            options={[{ value: 'none', label: 'None' }, { value: 'light', label: 'Light' }, { value: 'moderate', label: 'Mod.' }, { value: 'heavy', label: 'Heavy' }]} />
        </div>
      </Screen>
      <BottomBar><Button onClick={next} tint={tint} iconRight="forward">Continue</Button></BottomBar>
    </>
  );
}

// ── 4. Lifestyle & activity ───────────────────────────────────
function Lifestyle({ d, set, next, back, t, step, total }) {
  const tint = t.accent;
  const qual = ['Poor', 'Fair', 'Good', 'Excellent'];
  return (
    <>
      <TopBar onBack={back} step={step} total={total} tint={tint} />
      <Screen>
        <Heading eyebrow="Lifestyle" title="Sleep & activity" sub="Recovery and movement shape how your spine copes with daily load." />

        <Card pad={18} style={{ marginTop: 22 }}>
          <SubSectionLabel>Sleep duration</SubSectionLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--ink)' }}>{d.sleepHrs.toFixed(1)}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink-3)' }}>hours / night</span>
          </div>
          <Slider value={d.sleepHrs} min={3} max={11} step={0.5} onChange={v => set({ sleepHrs: v })} tint={tint} />
          <div style={{ marginTop: 16 }}><SubSectionLabel>Sleep quality</SubSectionLabel>
            <Chips columns={4} value={d.sleepQuality} onChange={v => set({ sleepQuality: v })} tint={tint}
              options={qual.map((l, i) => ({ value: i + 1, label: l }))} />
          </div>
        </Card>

        <Card pad={18} style={{ marginTop: 14 }}>
          <SubSectionLabel>Daily movement</SubSectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12, marginBottom: 4 }}>
            <Field label="Walking" value={d.walkMins} onChange={v => set({ walkMins: +v.replace(/\D/g, '').slice(0,3) })} suffix="min" inputMode="numeric" />
            <Field label="Daily steps" value={d.steps} onChange={v => set({ steps: +v.replace(/\D/g, '').slice(0,5) })} suffix="steps" inputMode="numeric" />
          </div>
          {d.connectedDevice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, fontSize: 12, color: tint, fontWeight: 600 }}>
              <Icon name="watch" size={14} /> Pre-filled from {d.connectedDevice === 'apple' ? 'Apple Health' : d.connectedDevice === 'google' ? 'Google Fit' : 'Fitbit'} — editable
            </div>
          )}
        </Card>

        <Card pad={18} style={{ marginTop: 14 }}>
          <SubSectionLabel>Exercise</SubSectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ flex: 1, fontSize: 14.5, color: 'var(--ink-2)', fontWeight: 500 }}>Sessions per week</span>
            <div style={{ width: 150 }}><HrStepper value={d.exerciseFreq} onChange={v => set({ exerciseFreq: v })} min={0} max={14} unit="×" tint={tint} /></div>
          </div>
          <SubSectionLabel>Primary type</SubSectionLabel>
          <Chips value={d.exerciseType} onChange={v => set({ exerciseType: v })} tint={tint}
            options={[{ value: 'walking', label: 'Walking' }, { value: 'strength', label: 'Strength' }, { value: 'cardio', label: 'Cardio' }, { value: 'yoga', label: 'Yoga' }, { value: 'none', label: 'None' }]} />
        </Card>
      </Screen>
      <BottomBar><Button onClick={next} tint={tint} iconRight="forward">Continue</Button></BottomBar>
    </>
  );
}

Object.assign(window, { Onboarding, PatientInfo, Occupation, Lifestyle, HrStepper });
