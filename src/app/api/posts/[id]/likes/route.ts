import { NextRequest, NextResponse } from 'next/server';
import { getLikesCount, hasLiked, toggleLike } from '@/lib/likes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deviceId = request.headers.get('x-device-id') || '';
    const [count, liked] = await Promise.all([
      getLikesCount(id),
      deviceId ? hasLiked(id, deviceId) : false,
    ]);
    return NextResponse.json({ count, liked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
    }

    const result = await toggleLike(id, deviceId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}


