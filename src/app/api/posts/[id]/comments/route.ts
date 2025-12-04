import { NextRequest, NextResponse } from 'next/server';
import { getComments, createComment, getCommentsCount, getTodayCommentCount } from '@/lib/comments';
import { validateComment, sanitizeInput, isValidDeviceId } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await getComments(id);
    const count = await getCommentsCount(id);
    return NextResponse.json({ comments, count });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content, deviceId } = await request.json();

    // Validate comment content
    const commentValidation = validateComment(content);
    if (!commentValidation.valid) {
      return NextResponse.json({ error: commentValidation.error }, { status: 400 });
    }

    // Validate device ID
    if (!deviceId || !isValidDeviceId(deviceId)) {
      return NextResponse.json({ error: 'Invalid device ID' }, { status: 400 });
    }

    // Check daily comment limit (3 per day)
    const todayCount = await getTodayCommentCount(deviceId);
    if (todayCount >= 3) {
      return NextResponse.json({ error: 'Daily comment limit reached (3 per day)' }, { status: 429 });
    }

    // Sanitize and create comment
    const sanitizedContent = sanitizeInput(content);
    const comment = await createComment(id, sanitizedContent, deviceId);
    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

