import { NextRequest, NextResponse } from 'next/server';
import { getPost, updatePost, deletePost } from '@/lib/posts';
import { validateTitle, validateContent, validateCategory, validateKeywords, sanitizeInput, normalizeKeywords } from '@/lib/validation';
import { requireAuth } from '@/lib/middleware';

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
    
    // Public: only return published posts
    const post = await getPost(id, false);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { title, content, category, keywords, published } = await request.json();

    // Validate inputs
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 });
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 });
    }

    const categoryValidation = validateCategory(category || '');
    if (!categoryValidation.valid) {
      return NextResponse.json({ error: categoryValidation.error }, { status: 400 });
    }

    const keywordsValidation = keywords ? validateKeywords(keywords) : { valid: true };
    if (!keywordsValidation.valid) {
      return NextResponse.json({ error: keywordsValidation.error }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);
    const sanitizedCategory = category ? sanitizeInput(category) : '';
    const sanitizedKeywords = keywords ? normalizeKeywords(keywords) : '';
    const normalizedPublished = published === false ? 0 : 1;

    const updatedPost = await updatePost(id, {
      title: sanitizedTitle,
      content: sanitizedContent,
      category: sanitizedCategory,
      keywords: sanitizedKeywords,
      published: normalizedPublished,
    });

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require admin authentication
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const deleted = await deletePost(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
