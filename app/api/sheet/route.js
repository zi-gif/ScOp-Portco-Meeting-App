import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets';

export async function GET() {
  try {
    const data = await fetchSheetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sheet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sheet data' },
      { status: 500 }
    );
  }
}
