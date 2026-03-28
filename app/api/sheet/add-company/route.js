import { NextResponse } from 'next/server';
import { addCompanyToSheet } from '@/lib/sheets';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, analyst, partner } = body;

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const result = await addCompanyToSheet({ name, analyst, partner });
    return NextResponse.json({ ...result, company: { name, analyst, partner } });
  } catch (error) {
    console.error('Add company error:', error);
    return NextResponse.json(
      { error: 'Failed to add company' },
      { status: 500 }
    );
  }
}
