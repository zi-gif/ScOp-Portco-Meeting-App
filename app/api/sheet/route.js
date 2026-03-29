import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets';

export async function GET() {
  // Quick env check
  const envCheck = {
    hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
    hasSheetId: !!process.env.GOOGLE_SHEET_ID,
    sheetId: process.env.GOOGLE_SHEET_ID || '(not set)',
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
