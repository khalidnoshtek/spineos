# SpineOS — Phase 1 Prototype

A scientific, data-driven back pain **risk assessment** platform.
Core principle: **Measure → Assess → Score → Classify → Recommend** — it explains
*why* pain is likely occurring before recommending anything, rather than selling
a treatment package.

This is a fully interactive prototype (React + Babel, rendered in a 375×812 phone
frame) covering the complete assessment flow.

## Run it

The screens are loaded as `.jsx` over HTTP, so open it through a local server
(opening `SpineOS.html` directly via `file://` is blocked by browser CORS):

```bash
cd "Dr Spine"
python3 -m http.server 8000
# then open http://localhost:8000/SpineOS.html
```

## The flow (9 screens)

1. **Onboarding & consent** — connect a wearable (Apple Health / Google Fit / Fitbit)
   or skip to manual entry; consent gate.
2. **Patient info** — name, age, gender, height, weight → live **BMI** ring.
3. **Occupation & work pattern** — occupation type, sitting/standing/driving hours, lifting load.
4. **Lifestyle** — sleep duration & quality, walking minutes, daily steps, exercise frequency & type.
5. **Pain & function** — clickable spine body-map (cervical → sacral), 0–10 intensity,
   duration, pattern, triggers, radiation, functional limitations.
6. **Wearable sync** — animated first-sync that counts in steps, walking, active minutes,
   sleep, resting HR, BMI; every value is editable. Manual entry path included.
7. **Risk dashboard** — semicircle **Risk Index** gauge + 5 sub-score rings
   (Lifestyle / Activity / Sleep / Mobility / Body comp.) with Low / Moderate / High
   classification.
8. **Full report** — patient summary, BMI analysis, lifestyle & occupational risk,
   pain pattern analysis, ranked key risk factors, probable contributors, recommended
   next steps, PDF action.
9. **History** — risk-index trend sparkline + past assessments.

## Scoring engine

`src/scoring.jsx` holds the transparent model. Sub-scores are **health** scores
(0–100, higher = better); the overall **Back Pain Risk Index** is 0–100 (higher = more
risk), derived by inverting weighted health and adding direct pain weight. All screens
read from one data object, so dashboard, report, and history stay consistent as inputs
change.

## Tweaks panel

A floating panel (the design tool's edit-mode toggle) exposes the explored variations:
accent color, Dashboard layout (Gauge / Grid / List), Body map (Silhouette / Spine),
Onboarding (Illustrated / Minimal), Report (Detailed / Compact), and a "Jump to screen"
selector for review.

## File layout

```
SpineOS.html              entry — design tokens, fonts, loads React/Babel + sources
lib/ios-frame.jsx         iOS device frame + status bar (scaffold)
lib/tweaks-panel.jsx      tweaks panel shell + form controls (scaffold)
src/icons.jsx             line-icon set
src/ui.jsx                shared primitives (Gauge, Ring, Card, Field, Slider, …)
src/scoring.jsx           assessment model + default persona
src/bodymap.jsx           clickable spine region selector
src/screens-intake.jsx    onboarding, patient, occupation, lifestyle
src/screens-data.jsx      pain & function, wearable sync
src/screens-results.jsx   dashboard, report, history
src/app.jsx               state machine, routing, persistence, tweaks wiring
```

## Notes / next steps

- Copy uses a placeholder persona (Maya, office worker, moderate risk) so every screen
  looks populated.
- Wearable ingestion is **device-agnostic** by design: the sync screen normalizes into
  one metric set, so any tracker (Garmin, Samsung, Mi Band, Amazfit, …) maps to the same
  fields, with manual entry as the fallback.
- "Download report (PDF)" currently shows a confirmation toast — a real PDF export can be
  wired in next.
- Foundation for the longer-term Spine Health Intelligence Platform: AI root-cause
  analysis, personalized recommendations, longitudinal tracking, and population analytics.
</content>
</invoke>
