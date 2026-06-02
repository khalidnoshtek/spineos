// scoring.jsx — SpineOS assessment model
// Transparent, plausible scoring. Sub-scores are HEALTH scores (0-100, higher = better).
// The overall Back Pain Risk Index is 0-100 (higher = MORE risk).

// ── default persona — a realistic "moderate risk" office worker ──
const DEFAULT_DATA = {
  // patient
  name: 'Maya Okonkwo',
  age: 42,
  gender: 'female',
  height: 168,   // cm
  weight: 76,    // kg
  // occupation & work pattern
  occupation: 'office',
  sitHrs: 9,
  standHrs: 2,
  driveHrs: 1,
  lifting: 'light',
  // lifestyle & activity
  sleepHrs: 6.2,
  sleepQuality: 2,        // 1 poor – 4 excellent
  walkMins: 24,
  steps: 5200,
  exerciseFreq: 2,        // sessions/week
  exerciseType: 'walking',
  activeMins: 28,
  // pain & function
  painRegions: ['lumbar'],
  painIntensity: 5,
  painDuration: 'chronic', // acute / sub / chronic
  painPattern: 'intermittent',
  triggers: ['sitting', 'lifting'],
  radiation: false,
  limits: { sitting: 2, standing: 1, walking: 1, stairs: 1, lifting: 2 }, // 0 none–3 severe
  // wearable
  synced: false,
  restingHR: 72,
};
window.DEFAULT_DATA = DEFAULT_DATA;

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

function bmiOf(d) {
  const m = d.height / 100;
  return m > 0 ? d.weight / (m * m) : 0;
}
function bmiBand(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', c: 'var(--amber)' };
  if (bmi < 25)   return { label: 'Healthy', c: 'var(--green)' };
  if (bmi < 30)   return { label: 'Overweight', c: 'var(--amber)' };
  return { label: 'Obese', c: 'var(--red)' };
}

// each returns 0-100 health score (higher = better)
function obesityScore(d) {
  const bmi = bmiOf(d);
  // ideal ~22; penalty grows away from healthy band
  if (bmi >= 18.5 && bmi < 25) return clamp(100 - (Math.abs(bmi - 22) * 3));
  if (bmi >= 25) return clamp(92 - (bmi - 25) * 7);
  return clamp(90 - (18.5 - bmi) * 6);
}
function activityScore(d) {
  const stepS = clamp((d.steps / 8000) * 100);            // 8k target
  const walkS = clamp((d.walkMins / 30) * 100);           // 30 min target
  const exS   = clamp((d.exerciseFreq / 4) * 100);        // 4x/wk target
  const actS  = clamp((d.activeMins / 30) * 100);
  return clamp(stepS * 0.34 + walkS * 0.22 + exS * 0.26 + actS * 0.18);
}
function sleepScore(d) {
  const dur = d.sleepHrs >= 7 && d.sleepHrs <= 9 ? 100 : clamp(100 - Math.abs(d.sleepHrs - 8) * 16);
  const qual = ((d.sleepQuality - 1) / 3) * 100;
  return clamp(dur * 0.55 + qual * 0.45);
}
function mobilityScore(d) {
  // functional limitation severity (0 none – 3 severe) → lower = better mobility
  const L = d.limits || {};
  const keys = ['sitting', 'standing', 'walking', 'stairs', 'lifting'];
  const sev = keys.reduce((s, k) => s + (L[k] || 0), 0) / (keys.length * 3); // 0-1
  const painPen = (d.painIntensity / 10) * 0.4 + (d.radiation ? 0.12 : 0);
  return clamp(100 - (sev * 65) - (painPen * 100 * 0.6));
}
function lifestyleScore(d) {
  // sedentary load: sitting + driving hours; standing/movement offsets
  const sedentary = d.sitHrs + d.driveHrs * 1.2;
  const sitPen = clamp((sedentary / 12) * 100); // 12h ~ max
  const liftMap = { none: 6, light: 0, moderate: 14, heavy: 30 };
  const occMap  = { office: 8, driver: 22, field: 16, manual: 28, homemaker: 14, student: 12, other: 12 };
  const ergo = (liftMap[d.lifting] || 0) + (occMap[d.occupation] || 12);
  return clamp(100 - sitPen * 0.55 - ergo * 0.9);
}

function levelOf(risk) {
  return risk < 40 ? 'low' : risk < 70 ? 'moderate' : 'high';
}

function computeScores(d) {
  const sub = {
    lifestyle: Math.round(lifestyleScore(d)),
    activity: Math.round(activityScore(d)),
    sleep: Math.round(sleepScore(d)),
    mobility: Math.round(mobilityScore(d)),
    obesity: Math.round(obesityScore(d)),
  };
  // overall RISK index: invert weighted health, add direct pain weight
  const health = sub.lifestyle * 0.24 + sub.activity * 0.22 + sub.mobility * 0.24 + sub.sleep * 0.14 + sub.obesity * 0.16;
  let risk = 100 - health;
  risk = risk * 0.78 + (d.painIntensity / 10) * 100 * 0.16 + (d.painDuration === 'chronic' ? 8 : d.painDuration === 'sub' ? 4 : 0);
  risk = clamp(Math.round(risk));
  return { ...sub, overall: risk, level: levelOf(risk), bmi: bmiOf(d), bmiBand: bmiBand(bmiOf(d)) };
}

// human-readable contributing factors, ranked
function riskFactors(d, s) {
  const f = [];
  const bmi = bmiOf(d);
  if (bmi >= 25) f.push({ icon: 'scale', label: bmi >= 30 ? 'Elevated BMI adds spinal load' : 'BMI above healthy range', weight: bmi >= 30 ? 'high' : 'moderate' });
  if (d.sitHrs >= 8) f.push({ icon: 'clock', label: `${d.sitHrs}h seated daily — prolonged sitting`, weight: d.sitHrs >= 10 ? 'high' : 'moderate' });
  if (s.activity < 55) f.push({ icon: 'walk', label: 'Low daily movement & activity', weight: s.activity < 40 ? 'high' : 'moderate' });
  if (d.sleepHrs < 7 || d.sleepQuality <= 2) f.push({ icon: 'moon', label: 'Insufficient recovery sleep', weight: 'moderate' });
  if (d.lifting === 'moderate' || d.lifting === 'heavy') f.push({ icon: 'bolt', label: `${d.lifting === 'heavy' ? 'Heavy' : 'Moderate'} lifting exposure`, weight: d.lifting === 'heavy' ? 'high' : 'moderate' });
  if (d.painDuration === 'chronic') f.push({ icon: 'pulse', label: 'Chronic pain pattern (>12 weeks)', weight: 'high' });
  if (d.radiation) f.push({ icon: 'bolt', label: 'Radiating symptoms reported', weight: 'high' });
  const order = { high: 0, moderate: 1, low: 2 };
  return f.sort((a, b) => order[a.weight] - order[b.weight]).slice(0, 5);
}

// recommendations keyed to weakest areas
function recommendations(d, s) {
  const recs = [];
  if (s.lifestyle < 65) recs.push({ icon: 'clock', title: 'Break up sitting', body: 'Stand and move for 2–3 minutes every 30 minutes. Try a movement reminder on your watch.' });
  if (s.activity < 65) recs.push({ icon: 'walk', title: 'Build toward 8,000 steps', body: `You're at ~${(d.steps/1000).toFixed(1)}k. Add a 10-minute walk after meals to close the gap gently.` });
  if (s.mobility < 70) recs.push({ icon: 'stretch', title: 'Daily mobility routine', body: 'Cat–cow, hip flexor and hamstring stretches ease lumbar load. 5 minutes, morning and evening.' });
  if (s.obesity < 70) recs.push({ icon: 'flame', title: 'Gradual weight management', body: 'A 5% reduction meaningfully lowers spinal compression. Pair movement with balanced meals.' });
  if (s.sleep < 70) recs.push({ icon: 'moon', title: 'Protect your sleep window', body: 'Aim for 7–8 hours. Side-sleeping with a pillow between the knees supports neutral spine alignment.' });
  recs.push({ icon: 'shield', title: 'Re-assess in 4 weeks', body: 'Track your trend. Small, consistent changes move the needle — re-measure to see progress.' });
  return recs.slice(0, 4);
}

Object.assign(window, { computeScores, bmiOf, bmiBand, riskFactors, recommendations, levelOf, DEFAULT_DATA });
