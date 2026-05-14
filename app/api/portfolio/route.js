import { NextResponse } from 'next/server';
import { fetchPortfolioMetrics } from '@/lib/portfolio';

export async function GET() {
  const metrics = await fetchPortfolioMetrics();
  return NextResponse.json(metrics);
}
