import { NextRequest, NextResponse } from 'next/server';
import { updateAdminCredentials, getAdminUser } from '@/lib/auth';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  // Require admin authentication
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    // Don't return password hash
    return NextResponse.json({ username: admin.username });
  } catch (error) {
    console.error('Failed to get admin credentials:', error);
    return NextResponse.json({ error: 'Failed to get admin credentials' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Require admin authentication
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { username, password } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json({ error: 'Username must be between 3 and 50 characters' }, { status: 400 });
    }

    if (password !== undefined && password !== null) {
      if (password.length < 6 || password.length > 100) {
        return NextResponse.json({ error: 'Password must be between 6 and 100 characters' }, { status: 400 });
      }
    }

    const success = await updateAdminCredentials(username, password);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update admin credentials:', error);
    return NextResponse.json({ error: 'Failed to update credentials' }, { status: 500 });
  }
}

