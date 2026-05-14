// Portfolio metrics fetcher.
// Pulls ARR / growth / runway from the ScOp Portfolio DB
// (https://scop-portfolio-db.vercel.app/) via a server-side fetch.
//
// Expected env vars:
//   PORTFOLIO_DB_URL    Full URL returning JSON, e.g.
//                       https://scop-portfolio-db.vercel.app/api/public/companies
//   PORTFOLIO_DB_TOKEN  Optional bearer token sent as Authorization header.
//
// Expected response shape (array):
//   [{ name: "Snag", arr: "$1.2M", growth: "15%", runway: "18mo" }, ...]
// Any field may be missing or empty; missing fields render blank in the UI.

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, data: null };

function normalizeName(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pick(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function normalizeRecord(raw) {
  return {
    name: pick(raw, ['name', 'company', 'companyName']),
    arr: pick(raw, ['arr', 'ARR', 'revenue', 'annualizedRevenue']),
    growth: pick(raw, ['growth', 'growthRate', 'yoyGrowth', 'mom', 'momGrowth']),
    runway: pick(raw, ['runway', 'runwayMonths', 'runway_months']),
  };
}

const SAMPLE_METRICS = [
  { name: 'Snag',         arr: '$4.2M',  growth: '15% MoM', runway: '22 mo' },
  { name: 'Pangram',      arr: '$1.8M',  growth: '8% MoM',  runway: '18 mo' },
  { name: 'SuiteOp',      arr: '$2.6M',  growth: '12% MoM', runway: '14 mo' },
  { name: 'Rogo',         arr: '$11.4M', growth: '22% MoM', runway: '36 mo' },
  { name: 'Artiphishell', arr: '$640K',  growth: '6% MoM',  runway: '' },
  { name: 'Spacture',     arr: '$420K',  growth: '4% MoM',  runway: '11 mo' },
  { name: 'Unwrap.ai',    arr: '$3.1M',  growth: '9% MoM',  runway: '20 mo' },
  { name: 'ChipAgents',   arr: '$280K',  growth: '',         runway: '16 mo' },
  { name: 'PromptLayer',  arr: '$1.2M',  growth: '11% MoM', runway: '15 mo' },
  { name: 'HealthArc',    arr: '$890K',  growth: '7% MoM',  runway: '' },
  { name: 'Yogi',         arr: '$2.0M',  growth: '5% MoM',  runway: '13 mo' },
  { name: 'Userpilot',    arr: '$8.6M',  growth: '4% MoM',  runway: '28 mo' },
];

function buildSampleByName() {
  const byName = {};
  for (const r of SAMPLE_METRICS) {
    byName[normalizeName(r.name)] = r;
  }
  return byName;
}

export async function fetchPortfolioMetrics() {
  const now = Date.now();
  if (cache.data && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  const url = process.env.PORTFOLIO_DB_URL;
  if (!url) {
    // No live endpoint configured: return seeded sample data so the layout
    // is reviewable locally. Live mode kicks in when PORTFOLIO_DB_URL is set.
    return { byName: buildSampleByName(), source: 'sample' };
  }

  const headers = { Accept: 'application/json' };
  if (process.env.PORTFOLIO_DB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.PORTFOLIO_DB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      return { byName: {}, source: 'error', status: res.status };
    }
    const json = await res.json();
    const records = Array.isArray(json) ? json : (json.companies || json.data || []);
    const byName = {};
    for (const r of records) {
      const rec = normalizeRecord(r);
      if (rec.name) byName[normalizeName(rec.name)] = rec;
    }
    cache = { at: now, data: { byName, source: 'live' } };
    return cache.data;
  } catch (err) {
    return { byName: {}, source: 'error', message: err.message };
  }
}

export function matchMetrics(metrics, companyName) {
  if (!metrics?.byName) return null;
  return metrics.byName[normalizeName(companyName)] || null;
}
