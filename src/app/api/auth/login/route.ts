import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken, verifyToken, ADMIN_SESSION_MAX_AGE_SEC } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const isValid = await verifyPassword(username, password);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Generate a secure signed token
    const token = generateToken(username);
    
    const response = NextResponse.json({ success: true, token });
    
    // Set cookie for session (7 days)
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_SEC,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token');
    
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify token signature and check expiration
    const username = verifyToken(token.value);
    return NextResponse.json({ authenticated: !!username });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}












