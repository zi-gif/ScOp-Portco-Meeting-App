import { NextResponse } from 'next/server';
import { fetchPortfolioMetrics } from '@/lib/portfolio';
import { fetchSheetData } from '@/lib/sheets';

function normalizeName(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function GET() {
  const out = {
    env: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasSupabaseDbUrl: !!process.env.SUPABASE_DB_URL,
      postgresUrlPreview: process.env.POSTGRES_URL
        ? process.env.POSTGRES_URL.slice(0, 35) + '…'
        : null,
    },
    portfolio: null,
    sheet: null,
    matches: null,
    error: null,
  };

  try {
    const metrics = await fetchPortfolioMetrics();
    out.portfolio = {
      source: metrics.source,
      count: metrics.count ?? Object.keys(metrics.byName || {}).length,
      message: metrics.message || null,
      sampleKeys: Object.keys(metrics.byName || {}).slice(0, 20),
      sampleRecord: Object.values(metrics.byName || {})[0] || null,
    };
  } catch (err) {
    out.error = `portfolio fetch failed: ${err.message}`;
  }

  try {
    const sheet = await fetchSheetData();
    out.sheet = {
      companyCount: sheet.companies?.length || 0,
      companyNames: (sheet.companies || []).map((c) => c.name),
    };
  } catch (err) {
    out.error = (out.error ? out.error + '; ' : '') + `sheet fetch failed: ${err.message}`;
  }

  if (out.portfolio && out.sheet) {
    const dbKeys = new Set(Object.keys(
      (await fetchPortfolioMetrics()).byName || {}
    ));
    const matches = out.sheet.companyNames.map((name) => ({
      name,
      key: normalizeName(name),
      matched: dbKeys.has(normalizeName(name)),
    }));
    out.matches = {
      total: matches.length,
      matchedCount: matches.filter((m) => m.matched).length,
      unmatched: matches.filter((m) => !m.matched).map((m) => m.name),
      matched: matches.filter((m) => m.matched).map((m) => m.name),
    };
  }

  return NextResponse.json(out, { status: 200 });
}
