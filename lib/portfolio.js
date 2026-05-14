// Portfolio metrics reader.
// Connects directly to the ScOp Portfolio DB Supabase Postgres backend
// (postgres-js, pooler URL). Returns the latest metric extraction per
// company, honoring the pinned_extraction_id override and the
// metrics_voided blanking convention used by the source app.
//
// Env vars:
//   POSTGRES_URL       Supabase pooler URI (transaction mode).
//   SUPABASE_DB_URL    Optional fallback if POSTGRES_URL not set.

import postgres from 'postgres';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, data: null };
let _sql = null;

function getSql() {
  if (_sql) return _sql;
  const url = process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
  if (!url) return null;
  _sql = postgres(url, { prepare: false, max: 5 });
  return _sql;
}

function normalizeName(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatARR(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  const n = Number(raw);
  if (!Number.isFinite(n)) return '';
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatGrowth(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  const n = Number(raw);
  if (!Number.isFinite(n)) return '';
  const pct = n * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatRunway(raw) {
  if (raw === null || raw === undefined || raw === '') return '';
  const n = Number(raw);
  if (!Number.isFinite(n)) return '';
  return `${Math.round(n)} mo`;
}

function normalizeBasis(basis) {
  const b = (basis || '').toLowerCase().trim();
  if (!b) return '';
  if (b === 'yoy') return 'YOY';
  if (b === 'mom') return 'MOM';
  if (b === 'qoq') return 'QOQ';
  return b.toUpperCase();
}

export async function fetchPortfolioMetrics() {
  const now = Date.now();
  if (cache.data && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }

  const sql = getSql();
  if (!sql) {
    return { byName: {}, source: 'unconfigured' };
  }

  try {
    const rows = await sql`
      with ranked as (
        select e.*, c.name as company_name, c.slug,
               row_number() over (
                 partition by e.company_id
                 order by case when e.id = c.pinned_extraction_id then 0 else 1 end,
                          e.deck_modified_time desc
               ) as rn
        from metric_extractions e
        join companies c on c.id = e.company_id
      )
      select * from ranked where rn = 1
    `;

    const byName = {};
    for (const row of rows) {
      const voided = row.metrics_voided === true;
      const record = {
        name: row.company_name,
        slug: row.slug,
        arr: voided ? '' : formatARR(row.arr),
        growth: voided ? '' : formatGrowth(row.growth_value),
        growthPeriod: voided ? '' : normalizeBasis(row.growth_basis),
        runway: voided ? '' : formatRunway(row.runway_months),
      };
      if (row.company_name) byName[normalizeName(row.company_name)] = record;
      if (row.slug) byName[normalizeName(row.slug)] = record;
    }

    cache = { at: now, data: { byName, source: 'live', count: rows.length } };
    return cache.data;
  } catch (err) {
    return { byName: {}, source: 'error', message: err.message };
  }
}
