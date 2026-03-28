import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword) {
      // If no password is set, allow access (dev mode)
      const response = NextResponse.json({ authenticated: true });
      (await cookies()).set('scop_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }

    if (password !== appPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    const response = NextResponse.json({ authenticated: true });
    (await cookies()).set('scop_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
