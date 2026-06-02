// app.jsx — SpineOS state machine, routing, device scaling, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0E7C86",
  "onboarding": "Illustrated",
  "dashboard": "List",
  "bodyMap": "Silhouette",
  "report": "Detailed"
}/*EDITMODE-END*/;

const STORE_KEY = 'spineos_v1';
const loadState = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } };
const saveState = (s) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} };

const FLOW = ['onboarding', 'patient', 'occupation', 'lifestyle', 'pain', 'sync'];
const STEP = { patient: 1, occupation: 2, lifestyle: 3, pain: 4, sync: 5 };
const TOTAL = 5;
const RESULTS = ['dashboard', 'report', 'profile'];

const SCREEN_OPTS = [
  { value: 'onboarding', label: '1 · Onboarding' },
  { value: 'patient', label: '2 · Patient info' },
  { value: 'occupation', label: '3 · Occupation' },
  { value: 'lifestyle', label: '4 · Lifestyle' },
  { value: 'pain', label: '5 · Pain & function' },
  { value: 'sync', label: '6 · Wearable sync' },
  { value: 'dashboard', label: '7 · Risk dashboard' },
  { value: 'report', label: '8 · Full report' },
  { value: 'profile', label: '9 · History' },
];

function useFitScale(w, h, pad = 40) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - pad) / w, (window.innerHeight - pad) / h, 1));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [w, h]);
  return scale;
}

function ScreenReveal({ screen, dir, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {children}
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const init = loadState();
  const [data, setData] = React.useState(() => ({ ...DEFAULT_DATA, ...(init.data || {}) }));
  const [screen, setScreen] = React.useState(() => init.screen || 'onboarding');
  const [dir, setDir] = React.useState(1);

  React.useEffect(() => { saveState({ data, screen }); }, [data, screen]);
  React.useEffect(() => { document.documentElement.style.setProperty('--blue', t.accent); }, [t.accent]);
  React.useEffect(() => { window.__spineGo = (s) => setScreen(s); }, []);
  React.useEffect(() => { window.__spineTweak = setTweak; }, [setTweak]);

  const set = React.useCallback((patch) => setData(d => ({ ...d, ...patch })), []);
  const scores = React.useMemo(() => computeScores(data), [data]);

  const goTo = (s, d = 1) => { setDir(d); setScreen(s); };
  const next = () => {
    const i = FLOW.indexOf(screen);
    if (i >= 0 && i < FLOW.length - 1) goTo(FLOW[i + 1], 1);
    else if (screen === 'sync') goTo('dashboard', 1);
  };
  const back = () => {
    const i = FLOW.indexOf(screen);
    if (i > 0) goTo(FLOW[i - 1], -1);
  };
  const go = (s) => goTo(s, RESULTS.indexOf(s) > RESULTS.indexOf(screen) ? 1 : -1);
  const restart = () => { setData({ ...DEFAULT_DATA }); goTo('onboarding', -1); };

  const stepProps = { d: data, set, next, back, t, scores, step: STEP[screen], total: TOTAL };
  const resProps = { d: data, s: scores, go, t, restart };

  let view;
  switch (screen) {
    case 'onboarding': view = <Onboarding d={data} set={set} next={next} t={t} />; break;
    case 'patient':    view = <PatientInfo {...stepProps} />; break;
    case 'occupation': view = <Occupation {...stepProps} />; break;
    case 'lifestyle':  view = <Lifestyle {...stepProps} />; break;
    case 'pain':       view = <PainAssessment {...stepProps} />; break;
    case 'sync':       view = <WearableSync {...stepProps} />; break;
    case 'dashboard':  view = <Dashboard {...resProps} />; break;
    case 'report':     view = <Report {...resProps} />; break;
    case 'profile':    view = <Profile {...resProps} />; break;
    default:           view = <Onboarding d={data} set={set} next={next} t={t} />;
  }

  return (
    <>
      <div>
        <IOSDevice width={375} height={812}>
          <ScreenReveal screen={screen} dir={dir}>
            {view}
          </ScreenReveal>
        </IOSDevice>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Review" />
        <TweakSelect label="Jump to screen" value={screen} options={SCREEN_OPTS} onChange={go} />

        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent}
          options={['#0A5C8E', '#1466A8', '#0E7C86', '#3B5BA9']}
          onChange={v => setTweak('accent', v)} />

        <TweakSection label="Screen variations" />
        <TweakRadio label="Dashboard" value={t.dashboard} options={['Gauge', 'Grid', 'List']}
          onChange={v => setTweak('dashboard', v)} />
        <TweakRadio label="Body map" value={t.bodyMap} options={['Silhouette', 'Spine']}
          onChange={v => setTweak('bodyMap', v)} />
        <TweakRadio label="Onboarding" value={t.onboarding} options={['Illustrated', 'Minimal']}
          onChange={v => setTweak('onboarding', v)} />
        <TweakRadio label="Report" value={t.report} options={['Detailed', 'Compact']}
          onChange={v => setTweak('report', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
