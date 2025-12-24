import { NextRequest, NextResponse } from 'next/server';
import { incrementViews } from '@/lib/posts';

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
    
    await incrementViews(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to increment views:', error);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}












