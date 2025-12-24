import { NextRequest, NextResponse } from 'next/server';
import { getLikesCount, hasLiked, toggleLike } from '@/lib/likes';
import { isValidDeviceId } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate post ID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    const deviceId = request.headers.get('x-device-id') || '';
    const [count, liked] = await Promise.all([
      getLikesCount(id),
      deviceId && isValidDeviceId(deviceId) ? hasLiked(id, deviceId) : false,
    ]);
    return NextResponse.json({ count, liked });
  } catch (error) {
    console.error('Failed to fetch likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate post ID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }
    
    // Validate device ID format
    if (!isValidDeviceId(deviceId)) {
      return NextResponse.json({ error: 'Invalid device ID format' }, { status: 400 });
    }

    const result = await toggleLike(id, deviceId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}












