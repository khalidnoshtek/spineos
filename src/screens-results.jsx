// screens-results.jsx — Risk Dashboard, Full Report, Profile & History

const MESSAGES = {
  low: 'You’re in good shape. Here’s how to protect your progress.',
  moderate: 'A few habits are adding strain — small, steady changes go a long way.',
  high: 'Several factors deserve attention. Let’s turn them into a plan, together.',
};
const SUB_META = [
  { key: 'lifestyle', label: 'Lifestyle', icon: 'clock' },
  { key: 'activity', label: 'Activity', icon: 'walk' },
  { key: 'sleep', label: 'Sleep', icon: 'moon' },
  { key: 'mobility', label: 'Mobility', icon: 'stretch' },
  { key: 'obesity', label: 'Body comp.', icon: 'scale' },
];
const scoreColor = (v) => v >= 70 ? 'var(--green)' : v >= 50 ? 'var(--amber)' : 'var(--red)';

// ── PDF report generation (jsPDF) ─────────────────────────────
// Builds a real, downloadable A4 PDF from the assessment data.
// Returns true on success; false if jsPDF is unavailable (caller falls back to print).
const PDF_RISK = { low: [46, 125, 50], moderate: [224, 138, 0], high: [198, 40, 40] };
function buildReportPDF({ d, s, lv, factors, recs, regions, detailed }) {
  const jspdf = window.jspdf;
  if (!jspdf || !jspdf.jsPDF) return false;

  const doc = new jspdf.jsPDF({ unit: 'pt', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth();   // 595
  const PH = doc.internal.pageSize.getHeight();  // 842
  const M = 48, CW = PW - M * 2;
  const INK = [17, 33, 46], INK2 = [73, 96, 115], INK3 = [128, 149, 164], LINE = [227, 235, 242];
  const ACCENT = [14, 124, 134]; // teal
  const risk = PDF_RISK[s.level] || INK;
  let y = M;

  const ensure = (need) => { if (y + need > PH - M) { doc.addPage(); y = M; } };
  const setFont = (style = 'normal', size = 10, color = INK2) => {
    doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color);
  };
  const para = (text, { size = 10, color = INK2, style = 'normal', gap = 5, lead = 14 } = {}) => {
    setFont(style, size, color);
    const lines = doc.splitTextToSize(String(text), CW);
    lines.forEach(ln => { ensure(lead); doc.text(ln, M, y); y += lead; });
    y += gap;
  };
  const sectionTitle = (label) => {
    ensure(34); y += 6;
    setFont('bold', 12.5, INK); doc.text(label, M, y); y += 8;
    doc.setDrawColor(...LINE); doc.setLineWidth(1); doc.line(M, y, M + CW, y); y += 16;
  };
  const stat = (label, value) => {
    ensure(18); setFont('normal', 10, INK2); doc.text(label, M, y);
    setFont('bold', 10, INK); doc.text(String(value), M + CW, y, { align: 'right' }); y += 18;
  };

  // ── header band ──
  doc.setFillColor(...ACCENT); doc.rect(0, 0, PW, 96, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(255, 255, 255);
  doc.text('SpineOS', M, 50);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(226, 240, 240);
  doc.text('Phase 1 · Back Pain Risk Assessment', M, 70);
  doc.setFontSize(9); doc.setTextColor(210, 232, 232);
  doc.text('Generated ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    M + CW, 70, { align: 'right' });
  y = 130;

  // ── patient summary ──
  setFont('bold', 16, INK); doc.text(d.name || 'Patient', M, y); y += 20;
  const occ = d.occupation === 'office' ? 'Office worker' : (d.occupation || '').charAt(0).toUpperCase() + (d.occupation || '').slice(1);
  para(`${d.age || '—'} yrs · ${d.gender === 'female' ? 'Female' : d.gender === 'male' ? 'Male' : '—'} · ${occ}`,
    { size: 10.5, color: INK3, gap: 10 });

  // risk index chip
  ensure(46);
  doc.setFillColor(risk[0], risk[1], risk[2]); doc.roundedRect(M, y, 150, 40, 8, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
  doc.text(String(s.overall), M + 14, y + 27);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text('RISK INDEX', M + 44, y + 16); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.text(lv.label + ' risk', M + 44, y + 30);
  // bmi + pain chips
  const chip = (x, big, small, color) => {
    doc.setDrawColor(...LINE); doc.setLineWidth(1); doc.roundedRect(x, y, 120, 40, 8, 8, 'S');
    setFont('bold', 16, color); doc.text(String(big), x + 14, y + 26);
    setFont('normal', 8.5, INK3); doc.text(small, x + 14, y + 36);
  };
  chip(M + 162, s.bmi.toFixed(1), 'BMI · ' + s.bmiBand.label, INK);
  chip(M + 294, `${d.painIntensity}/10`, 'PAIN INTENSITY', INK);
  y += 58;

  // ── scores ──
  sectionTitle('Score breakdown  (0–100, higher is better)');
  [['Lifestyle', s.lifestyle], ['Activity', s.activity], ['Sleep', s.sleep], ['Mobility', s.mobility], ['Body composition', s.obesity]]
    .forEach(([l, v]) => {
      ensure(24);
      setFont('normal', 10, INK2); doc.text(l, M, y);
      setFont('bold', 10, INK); doc.text(String(v), M + CW, y, { align: 'right' });
      const bw = CW - 150, bx = M + 110;
      doc.setFillColor(...LINE); doc.roundedRect(bx, y - 8, bw, 7, 3.5, 3.5, 'F');
      const c = v >= 70 ? PDF_RISK.low : v >= 50 ? PDF_RISK.moderate : PDF_RISK.high;
      doc.setFillColor(...c); doc.roundedRect(bx, y - 8, Math.max(6, bw * v / 100), 7, 3.5, 3.5, 'F');
      y += 20;
    });

  // ── BMI analysis ──
  sectionTitle('BMI analysis');
  para(`Your BMI is ${s.bmi.toFixed(1)} (${s.bmiBand.label}). ` +
    (s.bmi >= 25
      ? 'Carrying extra weight increases compressive load on the lumbar discs, especially when seated.' +
        (detailed ? ' Even a modest 5% reduction measurably lowers that load over time.' : '')
      : 'This sits within a range that keeps spinal loading favourable.'));

  // ── lifestyle & occupational ──
  sectionTitle('Lifestyle & occupational risk');
  stat('Daily sitting', `${d.sitHrs} h${d.sitHrs >= 8 ? '  (prolonged)' : ''}`);
  stat('Driving', `${d.driveHrs} h`);
  stat('Lifting load', (d.lifting || '').charAt(0).toUpperCase() + (d.lifting || '').slice(1));
  if (detailed) { y += 4; para('Long static postures fatigue the deep stabilising muscles. Frequent micro-breaks are the single most effective desk-based countermeasure.', { size: 9.5, color: INK3 }); }

  // ── pain pattern ──
  sectionTitle('Pain pattern analysis');
  para(`${regions.length ? regions.join(' & ') + ' pain' : 'No region selected'}, rated ${d.painIntensity}/10, ` +
    `${d.painDuration === 'chronic' ? 'persisting beyond 12 weeks' : d.painDuration === 'sub' ? 'present 6–12 weeks' : 'recent onset'}.` +
    (d.triggers && d.triggers.length ? ` Worsened by ${d.triggers.join(', ')}.` : '') +
    (d.radiation ? ' Radiating symptoms noted — worth clinical review.' : ''));

  // ── key risk factors ──
  sectionTitle('Key risk factors');
  if (factors.length) factors.forEach(f => {
    ensure(16); setFont('normal', 10, INK);
    doc.text('•  ' + f.label, M, y);
    setFont('bold', 8.5, f.weight === 'high' ? PDF_RISK.high : PDF_RISK.moderate);
    doc.text(f.weight.toUpperCase(), M + CW, y, { align: 'right' }); y += 16;
  });
  else para('No significant risk factors identified.', { color: INK3 });

  // ── recommendations ──
  sectionTitle('Recommended next steps');
  recs.forEach((r, i) => {
    ensure(30);
    setFont('bold', 10.5, INK); doc.text(`${i + 1}. ${r.title}`, M, y); y += 14;
    para(r.body, { size: 9.5, color: INK2, gap: 8, lead: 13 });
  });

  // ── disclaimer footer on every page ──
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE); doc.setLineWidth(1); doc.line(M, PH - 40, M + CW, PH - 40);
    setFont('normal', 7.5, INK3);
    doc.text('SpineOS provides educational risk insights and is not a medical diagnosis. Consult a clinician for persistent or severe symptoms.', M, PH - 26);
    doc.text(`Page ${p} of ${pages}`, M + CW, PH - 26, { align: 'right' });
  }

  const safe = (d.name || 'patient').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  doc.save(`SpineOS-Report-${safe || 'patient'}.pdf`);
  return true;
}

// ── bottom tab bar (results section) ──────────────────────────
function BottomTabs({ active, go }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'target' },
    { id: 'report', label: 'Report', icon: 'list' },
    { id: 'profile', label: 'History', icon: 'trend' },
  ];
  return (
    <div style={{ flexShrink: 0, display: 'flex', padding: '8px 14px calc(14px + env(safe-area-inset-bottom))', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
      {tabs.map(tb => {
        const on = active === tb.id;
        return (
          <button key={tb.id} onClick={() => go(tb.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0', border: 'none', background: 'transparent', cursor: 'pointer',
            color: on ? 'var(--blue)' : 'var(--ink-3)',
          }}>
            <Icon name={tb.icon} size={22} sw={on ? 2.1 : 1.8} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: on ? 700 : 600, fontSize: 11 }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ResultsHeader({ title, sub, right }) {
  return (
    <div style={{ paddingTop: 58, padding: '58px 20px 14px', background: 'var(--surface)', flexShrink: 0, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      <div style={{ flex: 1 }}>
        {sub && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5, color: 'var(--ink-3)', letterSpacing: '.04em' }}>{sub}</div>}
        <h1 style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.01em', color: 'var(--ink)' }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// ── sub-score ring card ───────────────────────────────────────
function ScoreCard({ meta, v }) {
  const c = scoreColor(v);
  return (
    <Card pad={15} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
      <Ring value={v} size={56} sw={6.5} color={c}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>{v}</span>
      </Ring>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
          <Icon name={meta.icon} size={15} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{meta.label}</span>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: c, marginTop: 3 }}>{v >= 70 ? 'Healthy' : v >= 50 ? 'Fair' : 'Needs work'}</div>
      </div>
    </Card>
  );
}

function ScoreBar({ meta, v }) {
  const c = scoreColor(v);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={meta.icon} size={17} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{meta.label}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: c }}>{v}</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${v}%`, borderRadius: 999, background: c, transition: 'width .9s cubic-bezier(.4,0,.2,1)' }} />
        </div>
      </div>
    </div>
  );
}

// ── 7. Risk dashboard ─────────────────────────────────────────
function Dashboard({ d, s, go, t, restart }) {
  const lv = RISK[s.level];
  const layout = t.dashboard; // Gauge | Grid | List
  const factors = riskFactors(d, s);
  const firstName = (d.name || 'there').split(' ')[0];

  const SubScores = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
      {SUB_META.map(m => <ScoreCard key={m.key} meta={m} v={s[m.key]} />)}
    </div>
  );

  return (
    <>
      <ResultsHeader sub={`Hi ${firstName} · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`} title="Your back health"
        right={<button onClick={restart} aria-label="New assessment" style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'var(--bg)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><Icon name="refresh" size={19} /></button>} />
      <Screen>
        {/* hero */}
        <Card pad={20} style={{ marginTop: 18, textAlign: 'center', background: `linear-gradient(180deg, ${lv.soft} 0%, var(--surface) 60%)` }}>
          {layout === 'List'
            ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
                <Ring value={100 - s.overall} size={92} sw={10} color={lv.c}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--ink)', lineHeight: 1 }}>{s.overall}</div><div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '.08em' }}>RISK</div></div>
                </Ring>
                <div style={{ flex: 1 }}>
                  <RiskBadge level={lv} size="lg" />
                  <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.45, color: 'var(--ink-2)' }}>{MESSAGES[s.level]}</p>
                </div>
              </div>
            )
            : (
              <>
                <Gauge value={s.overall} size={236} level={lv} />
                <div style={{ marginTop: 8 }}><RiskBadge level={lv} size="lg" /></div>
                <p style={{ margin: '12px auto 0', fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink-2)', maxWidth: '30ch' }}>{MESSAGES[s.level]}</p>
              </>
            )}
        </Card>

        {/* sub scores */}
        <div style={{ margin: '22px 0 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Score breakdown</h2>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>Higher is better</span>
        </div>

        {layout === 'List' ? (
          <Card pad={16}>
            {SUB_META.map((m, i) => (
              <div key={m.key} style={{ borderTop: i ? '1px solid var(--line-2)' : 'none' }}><ScoreBar meta={m} v={s[m.key]} /></div>
            ))}
          </Card>
        ) : layout === 'Grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {SUB_META.map(m => {
              const c = scoreColor(s[m.key]);
              return (
                <Card key={m.key} pad={13} style={{ textAlign: 'center' }}>
                  <Ring value={s[m.key]} size={62} sw={7} color={c}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>{s[m.key]}</span></Ring>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10, color: 'var(--ink-2)' }}>
                    <Icon name={m.icon} size={13} /><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11.5, color: 'var(--ink)' }}>{m.label}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <SubScores />
        )}

        {/* top factors preview */}
        <Card pad={18} style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: lv.c }}><Icon name="info" size={18} /></span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>What’s driving your score</h2>
          </div>
          {factors.slice(0, 3).map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: f.weight === 'high' ? 'var(--red-soft)' : 'var(--amber-soft)', color: f.weight === 'high' ? 'var(--red)' : 'var(--amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={f.icon} size={16} /></span>
              <span style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </Card>

        <Button onClick={() => go('report')} tint="var(--blue)" iconRight="forward" style={{ marginTop: 16 }}>View full report</Button>
      </Screen>
      <BottomTabs active="dashboard" go={go} />
    </>
  );
}

// ── report section block ──────────────────────────────────────
function ReportSection({ icon, title, children, tint = 'var(--blue)' }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--blue-soft)', color: tint, display: 'grid', placeItems: 'center' }}><Icon name={icon} size={17} /></span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', flex: 1, textWrap: 'pretty' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── 8. Full report ────────────────────────────────────────────
function Report({ d, s, go, t }) {
  const lv = RISK[s.level];
  const detailed = t.report === 'Detailed';
  const factors = riskFactors(d, s);
  const recs = recommendations(d, s);
  const [toast, setToast] = React.useState(false);
  const regions = (d.painRegions || []).map(id => (SPINE_REGIONS.find(r => r.id === id) || {}).label).filter(Boolean);

  const download = () => {
    const ok = buildReportPDF({ d, s, lv, factors, recs, regions, detailed });
    if (ok) { setToast(true); setTimeout(() => setToast(false), 2600); }
    else { window.print(); } // fallback: native print-to-PDF if jsPDF unavailable
  };

  return (
    <>
      <ResultsHeader sub="Generated today" title="Full report"
        right={<RiskBadge level={lv} />} />
      <Screen>
        {/* patient summary */}
        <Card pad={18} style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--blue-soft)', color: 'var(--blue)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
              {(d.name || 'NA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>{d.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{d.age} yrs · {d.gender === 'female' ? 'Female' : d.gender === 'male' ? 'Male' : '—'} · {d.occupation === 'office' ? 'Office worker' : d.occupation}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['Risk index', s.overall, lv.c], ['BMI', s.bmi.toFixed(1), s.bmiBand.c], ['Pain', `${d.painIntensity}/10`, 'var(--ink)']].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, background: 'var(--bg)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: c }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        <ReportSection icon="scale" title="BMI analysis">
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            Your BMI is <b style={{ color: 'var(--ink)' }}>{s.bmi.toFixed(1)}</b> ({s.bmiBand.label}).
            {s.bmi >= 25 ? ' Carrying extra weight increases compressive load on the lumbar discs, especially when seated.' : ' This sits within a range that keeps spinal loading favourable.'}
            {detailed && s.bmi >= 25 && ' Even a modest 5% reduction measurably lowers that load over time.'}
          </p>
        </ReportSection>

        <ReportSection icon="briefcase" title="Lifestyle & occupational risk">
          <Card pad={14}>
            <StatRow icon="clock" label="Daily sitting" value={`${d.sitHrs} h`} hint={d.sitHrs >= 8 ? 'Prolonged' : 'Within range'} />
            <div style={{ borderTop: '1px solid var(--line-2)' }} />
            <StatRow icon="car" label="Driving" value={`${d.driveHrs} h`} />
            <div style={{ borderTop: '1px solid var(--line-2)' }} />
            <StatRow icon="bolt" label="Lifting load" value={d.lifting[0].toUpperCase() + d.lifting.slice(1)} />
          </Card>
          {detailed && <p style={{ margin: '10px 2px 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>Long static postures fatigue the deep stabilising muscles. Frequent micro-breaks are the single most effective desk-based countermeasure.</p>}
        </ReportSection>

        <ReportSection icon="activity" title="Activity & recovery">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
            <ScoreCard meta={SUB_META[1]} v={s.activity} />
            <ScoreCard meta={SUB_META[2]} v={s.sleep} />
          </div>
        </ReportSection>

        <ReportSection icon="pulse" title="Pain pattern analysis">
          <Card pad={16}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: regions.length ? 12 : 0 }}>
              {regions.map(r => <span key={r} style={{ padding: '5px 11px', borderRadius: 999, background: 'var(--blue-soft)', color: 'var(--blue)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5 }}>{r}</span>)}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
              {regions.length ? `${regions.join(' & ')} pain` : 'No region selected'}, rated <b style={{ color: 'var(--ink)' }}>{d.painIntensity}/10</b>, {d.painDuration === 'chronic' ? 'persisting beyond 12 weeks' : d.painDuration === 'sub' ? 'present 6–12 weeks' : 'recent onset'}.
              {d.triggers?.length ? ` Worsened by ${d.triggers.join(', ')}.` : ''}
              {d.radiation ? ' Radiating symptoms noted — worth clinical review.' : ''}
            </p>
          </Card>
        </ReportSection>

        <ReportSection icon="info" title="Key risk factors" tint="var(--amber)">
          <Card pad={16}>
            {factors.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: f.weight === 'high' ? 'var(--red-soft)' : 'var(--amber-soft)', color: f.weight === 'high' ? 'var(--red)' : 'var(--amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={f.icon} size={15} /></span>
                <span style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: f.weight === 'high' ? 'var(--red)' : 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{f.weight}</span>
              </div>
            ))}
          </Card>
        </ReportSection>

        <ReportSection icon="spark" title="Recommended next steps" tint="var(--green)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recs.map((r, i) => (
              <Card key={i} pad={15} style={{ display: 'flex', gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={r.icon} size={18} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{r.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 2 }}>{r.body}</div>
                </div>
              </Card>
            ))}
          </div>
        </ReportSection>

        <div style={{ marginTop: 18, padding: 14, background: 'var(--bg)', borderRadius: 14, fontSize: 11.5, lineHeight: 1.5, color: 'var(--ink-3)', textAlign: 'center' }}>
          SpineOS provides educational risk insights and is not a medical diagnosis. Consult a clinician for persistent or severe symptoms.
        </div>
      </Screen>
      <div style={{ flexShrink: 0, padding: '12px 20px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <Button onClick={download} icon="download" tint="var(--blue)">Download report (PDF)</Button>
      </div>
      <BottomTabs active="report" go={go} />
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 150, padding: '14px 18px', borderRadius: 14, background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--sh-3)', animation: 'spo-pop .3s both', zIndex: 80 }}>
          <Icon name="checkCircle" size={20} /><span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>Report PDF downloaded</span>
        </div>
      )}
    </>
  );
}

// ── sparkline ─────────────────────────────────────────────────
function Sparkline({ points, w = 300, h = 80, color = 'var(--blue)' }) {
  const max = Math.max(...points) + 6, min = Math.min(...points) - 6;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(p => h - ((p - min) / (max - min)) * h);
  const path = xs.map((x, i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
      <defs><linearGradient id="spk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.18" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#spk)" />
      <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 5 : 3.5} fill="var(--surface)" stroke={color} strokeWidth="3" />)}
    </svg>
  );
}

// ── 9. Profile & history ──────────────────────────────────────
function Profile({ d, s, go, restart }) {
  const cur = s.overall;
  const history = [
    { date: 'Apr 8', risk: Math.min(96, cur + 19), level: levelOf(Math.min(96, cur + 19)) },
    { date: 'Apr 29', risk: Math.min(94, cur + 11), level: levelOf(Math.min(94, cur + 11)) },
    { date: 'May 20', risk: cur + 5, level: levelOf(cur + 5) },
    { date: 'Today', risk: cur, level: s.level },
  ];
  const delta = history[0].risk - cur;
  return (
    <>
      <ResultsHeader sub="Your journey" title="History & trend" />
      <Screen>
        <Card pad={18} style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Risk index trend</h2>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: delta > 0 ? 'var(--green)' : 'var(--ink-3)' }}>
              {delta > 0 && <Icon name="trend" size={15} style={{ transform: 'scaleY(-1)' }} />} {delta > 0 ? `−${delta} pts` : 'Stable'}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 14 }}>{delta > 0 ? `Down ${delta} points since April — keep it up.` : 'Track changes as you build new habits.'}</div>
          <Sparkline points={history.map(h => h.risk)} color="var(--green)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {history.map(h => <span key={h.date} style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600 }}>{h.date}</span>)}
          </div>
        </Card>

        <h2 style={{ margin: '22px 0 10px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)' }}>Past assessments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...history].reverse().map((h, i) => {
            const lv = RISK[h.level];
            return (
              <Card key={i} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <Ring value={100 - h.risk} size={48} sw={6} color={lv.c}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{h.risk}</span></Ring>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>{h.date === 'Today' ? 'Today' : `${h.date}, 2026`}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{i === 0 ? 'Latest assessment' : 'Completed assessment'}</div>
                </div>
                <RiskBadge level={lv} />
              </Card>
            );
          })}
        </div>

        <Button onClick={restart} variant="outline" icon="plus" style={{ marginTop: 18 }}>Start a new assessment</Button>
      </Screen>
      <BottomTabs active="profile" go={go} />
    </>
  );
}

Object.assign(window, { Dashboard, Report, Profile, BottomTabs, Sparkline });
