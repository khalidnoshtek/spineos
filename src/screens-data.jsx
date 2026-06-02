// screens-data.jsx — Pain & Functional Assessment, Wearable Sync

// ── count-up animation hook ───────────────────────────────────
function useCountUp(target, play, dur = 1000) {
  const [v, setV] = React.useState(play ? 0 : target);
  React.useEffect(() => {
    if (!play) { setV(target); return; }
    let raf, start;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(target);
    };
    raf = requestAnimationFrame(tick);
    // safety: guarantee the final value even if rAF is throttled (background tab / capture)
    const safety = setTimeout(() => setV(target), dur + 90);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [target, play]);
  return v;
}

// ── multi-select chips ────────────────────────────────────────
function MultiChips({ options, value = [], onChange, tint = 'var(--blue)' }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        const on = value.includes(v);
        return (
          <button key={v} onClick={() => toggle(v)} style={{
            padding: '9px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5,
            background: on ? tint : 'var(--surface)', color: on ? '#fff' : 'var(--ink-2)',
            boxShadow: on ? 'none' : 'inset 0 0 0 1.5px var(--line)', transition: 'all .14s',
          }}>{l}</button>
        );
      })}
    </div>
  );
}
window.MultiChips = MultiChips;

// ── 5. Pain & functional assessment ───────────────────────────
function PainAssessment({ d, set, next, back, t, step, total }) {
  const tint = t.accent;
  const painColor = d.painIntensity <= 3 ? 'var(--green)' : d.painIntensity <= 6 ? 'var(--amber)' : 'var(--red)';
  const sevOpts = [{ value: 0, label: 'None' }, { value: 1, label: 'Mild' }, { value: 2, label: 'Mod.' }, { value: 3, label: 'Severe' }];
  const limits = d.limits || {};
  const setLimit = (k, v) => set({ limits: { ...limits, [k]: v } });
  return (
    <>
      <TopBar onBack={back} step={step} total={total} tint={tint} />
      <Screen>
        <Heading eyebrow="Pain & function" title="Where does it hurt?" sub="Tap the spinal regions where you feel pain or discomfort." />

        <Card pad={16} style={{ marginTop: 20 }}>
          <BodyMap value={d.painRegions} onChange={v => set({ painRegions: v })} view={t.bodyMap === 'Spine' ? 'spine' : 'silhouette'} />
        </Card>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <SubSectionLabel>Pain intensity</SubSectionLabel>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: painColor }}>{d.painIntensity}<span style={{ color: 'var(--ink-3)', fontSize: 13 }}>/10</span></span>
          </div>
          <Slider value={d.painIntensity} min={0} max={10} onChange={v => set({ painIntensity: v })} tint={painColor} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>
            <span>No pain</span><span>Worst imaginable</span>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SubSectionLabel>How long have you had it?</SubSectionLabel>
          <Chips columns={3} value={d.painDuration} onChange={v => set({ painDuration: v })} tint={tint}
            options={[{ value: 'acute', label: '< 6 wks' }, { value: 'sub', label: '6–12 wks' }, { value: 'chronic', label: '> 12 wks' }]} />
        </div>

        <div style={{ marginTop: 22 }}>
          <SubSectionLabel>Pattern & triggers</SubSectionLabel>
          <Chips columns={3} value={d.painPattern} onChange={v => set({ painPattern: v })} tint={tint}
            options={[{ value: 'constant', label: 'Constant' }, { value: 'intermittent', label: 'Comes & goes' }, { value: 'activity', label: 'On activity' }]} />
          <div style={{ height: 10 }} />
          <MultiChips value={d.triggers} onChange={v => set({ triggers: v })} tint={tint}
            options={[{ value: 'sitting', label: 'Sitting' }, { value: 'standing', label: 'Standing' }, { value: 'lifting', label: 'Lifting' }, { value: 'bending', label: 'Bending' }, { value: 'driving', label: 'Driving' }, { value: 'morning', label: 'Mornings' }]} />
        </div>

        <Card pad={16} style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--amber-soft)', color: 'var(--amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="bolt" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>Radiating symptoms</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Pain, numbness or tingling down a leg</div>
          </div>
          <button onClick={() => set({ radiation: !d.radiation })} role="switch" aria-checked={d.radiation} style={{
            width: 50, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
            background: d.radiation ? tint : 'var(--line)', transition: 'background .2s',
          }}>
            <span style={{ position: 'absolute', top: 3, left: d.radiation ? 23 : 3, width: 24, height: 24, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .2s' }} />
          </button>
        </Card>

        <div style={{ marginTop: 22 }}>
          <SubSectionLabel>Functional limitations</SubSectionLabel>
          <Card pad={14}>
            {[['Sitting tolerance', 'sitting'], ['Standing tolerance', 'standing'], ['Walking capacity', 'walking'], ['Climbing stairs', 'stairs'], ['Lifting / carrying', 'lifting']].map(([lbl, key], i) => (
              <div key={key} style={{ paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0, borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>{lbl}</div>
                <Chips columns={4} value={limits[key] ?? 0} onChange={v => setLimit(key, v)} tint={tint} options={sevOpts} />
              </div>
            ))}
          </Card>
        </div>
      </Screen>
      <BottomBar><Button onClick={next} tint={tint} iconRight="forward">Continue to sync</Button></BottomBar>
    </>
  );
}

// ── metric tile ───────────────────────────────────────────────
function MetricTile({ icon, label, value, unit, sub, tint = 'var(--ink-2)', editing, onEdit, raw, maxlen = 5 }) {
  return (
    <Card pad={15} style={{ minHeight: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg)', color: tint, display: 'grid', placeItems: 'center' }}><Icon name={icon} size={17} /></span>
      </div>
      <div style={{ marginTop: 12 }}>
        {editing ? (
          <input value={raw} onChange={e => onEdit(e.target.value)} inputMode="numeric" style={{
            width: '100%', border: 'none', outline: 'none', background: 'var(--bg)', borderRadius: 8, padding: '4px 8px',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--ink)',
          }} />
        ) : (
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 23, color: 'var(--ink)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {value}<span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700 }}> {unit}</span>
          </div>
        )}
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>}
      </div>
    </Card>
  );
}

// ── 6. Wearable data sync ─────────────────────────────────────
function WearableSync({ d, set, next, back, t, step, total }) {
  const tint = t.accent;
  const [phase, setPhase] = React.useState(d.synced ? 'done' : 'idle'); // idle | syncing | done
  const [editing, setEditing] = React.useState(false);
  const deviceName = d.connectedDevice === 'apple' ? 'Apple Health' : d.connectedDevice === 'google' ? 'Google Fit' : d.connectedDevice === 'fitbit' ? 'Fitbit' : 'your device';

  const startSync = () => {
    setPhase('syncing');
    setTimeout(() => { set({ synced: true }); setPhase('done'); }, 1900);
  };
  const play = phase === 'done' && !editing;
  const sed = (24 - d.sleepHrs - (d.walkMins + d.activeMins) / 60 - 2).toFixed(1);

  const cSteps = useCountUp(d.steps, play);
  const cWalk = useCountUp(d.walkMins, play);
  const cActive = useCountUp(d.activeMins, play);
  const cHR = useCountUp(d.restingHR, play);
  const cSleep = useCountUp(d.sleepHrs, play);
  const cBmi = useCountUp(bmiOf(d), play);

  return (
    <>
      <TopBar onBack={back} step={step} total={total} tint={tint} />
      <Screen>
        <Heading eyebrow="Wearable data" title="Sync your activity" sub={phase === 'done' ? 'Last synced just now. Tap any value to adjust it.' : `Pull in steps, sleep and heart-rate from ${deviceName}.`} />

        {phase !== 'done' && (
          <Card pad={22} style={{ marginTop: 22, textAlign: 'center' }}>
            <div style={{ width: 92, height: 92, borderRadius: 999, margin: '0 auto', display: 'grid', placeItems: 'center', background: 'var(--blue-soft)', color: tint, position: 'relative' }}>
              {phase === 'syncing' && <span style={{ position: 'absolute', inset: -4, borderRadius: 999, border: '3px solid transparent', borderTopColor: tint, animation: 'spo-spin .8s linear infinite' }} />}
              <Icon name="watch" size={40} />
            </div>
            <div style={{ marginTop: 18, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>
              {phase === 'syncing' ? 'Syncing…' : `Connect ${deviceName}`}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 4, maxWidth: '28ch', marginInline: 'auto' }}>
              {phase === 'syncing' ? 'Reading the last 7 days of activity' : 'We only read the metrics relevant to spinal health.'}
            </div>
            {phase === 'idle' && (
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
                <Button onClick={startSync} tint={tint} icon="refresh">Sync now</Button>
                <Button onClick={() => { set({ synced: true }); setPhase('done'); setEditing(true); }} variant="quiet">Enter data manually</Button>
              </div>
            )}
          </Card>
        )}

        {phase === 'done' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: 'var(--green-soft)', color: 'var(--green)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                <Icon name="checkCircle" size={14} /> Synced · {deviceName}
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setEditing(e => !e)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: editing ? tint : 'var(--bg)', color: editing ? '#fff' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5 }}>
                <Icon name={editing ? 'check' : 'edit'} size={14} />{editing ? 'Done' : 'Edit'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
              <MetricTile icon="steps" label="Daily steps" tint="var(--blue)" editing={editing} raw={d.steps} onEdit={v => set({ steps: +v.replace(/\D/g,'').slice(0,5) })} value={Math.round(cSteps).toLocaleString()} unit="" sub="Goal 8,000" />
              <MetricTile icon="walk" label="Walking" tint="var(--blue)" editing={editing} raw={d.walkMins} onEdit={v => set({ walkMins: +v.replace(/\D/g,'').slice(0,3) })} value={Math.round(cWalk)} unit="min" />
              <MetricTile icon="flame" label="Active minutes" tint="var(--amber)" editing={editing} raw={d.activeMins} onEdit={v => set({ activeMins: +v.replace(/\D/g,'').slice(0,3) })} value={Math.round(cActive)} unit="min" />
              <MetricTile icon="clock" label="Sedentary time" tint="var(--ink-2)" value={sed} unit="hrs" sub="Estimated" />
              <MetricTile icon="moon" label="Sleep" tint="var(--blue)" value={cSleep.toFixed(1)} unit="h" sub={['Poor','Fair','Good','Excellent'][d.sleepQuality-1]} />
              <MetricTile icon="heart" label="Resting HR" tint="var(--red)" editing={editing} raw={d.restingHR} onEdit={v => set({ restingHR: +v.replace(/\D/g,'').slice(0,3) })} value={Math.round(cHR)} unit="bpm" />
            </div>
            <Card pad={15} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg)', color: bmiBand(bmiOf(d)).c, display: 'grid', placeItems: 'center' }}><Icon name="scale" size={17} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>{cBmi.toFixed(1)} <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 700 }}>BMI</span></div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{d.weight} kg · {d.height} cm · {bmiBand(bmiOf(d)).label}</div>
              </div>
            </Card>
          </>
        )}
      </Screen>
      <BottomBar><Button onClick={next} disabled={phase !== 'done'} variant="success" iconRight="forward">See my results</Button></BottomBar>
    </>
  );
}

Object.assign(window, { PainAssessment, WearableSync, useCountUp, MetricTile });
