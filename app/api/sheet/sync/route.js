import { NextResponse } from 'next/server';
import { syncToSheet } from '@/lib/sheets';

export async function POST(request) {
  try {
    const body = await request.json();
    const { date, notes, generalNotes, actionItems, companies } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const result = await syncToSheet({ date, notes, generalNotes, actionItems, companies });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sheet sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to sheet' },
      { status: 500 }
    );
  }
}
