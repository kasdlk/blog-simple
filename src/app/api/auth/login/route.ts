import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';

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

    // Create a simple session token (in production, use JWT or proper session management)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    const response = NextResponse.json({ success: true, token });
    
    // Set cookie for session (7 days)
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

    // Simple token validation (in production, use proper JWT validation)
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}





