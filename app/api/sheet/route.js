import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets';

export async function GET() {
  // Quick env check
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const envCheck = {
    hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasKey: !!rawKey,
    hasSheetId: !!process.env.GOOGLE_SHEET_ID,
    sheetId: process.env.GOOGLE_SHEET_ID || '(not set)',
    keyStartsWith: rawKey.substring(0, 30),
    keyLength: rawKey.length,
    hasBeginMarker: rawKey.includes('BEGIN PRIVATE KEY'),
  };

  try {
    const data = await fetchSheetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sheet fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sheet data',
        message: error.message,
        envCheck,
      },
      { status: 500 }
    );
  }
}
