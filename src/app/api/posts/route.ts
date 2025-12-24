import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPosts, createPost } from '@/lib/posts';
import { validateTitle, validateContent, validateCategory, sanitizeInput } from '@/lib/validation';
import { requireAuth } from '@/lib/middleware';

// GET /api/posts - Get all posts (for admin) or paginated posts (for frontend)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const category = searchParams.get('category');

    // If pagination params are provided, return paginated results (for frontend)
    if (page || pageSize) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
      const categoryParam = category || undefined;
      
      const result = await getPosts(categoryParam, pageNum, pageSizeNum);
      return NextResponse.json(result);
    }

    // Otherwise, return all posts (for admin page) - requires auth
    const authError = requireAuth(request);
    if (authError) return authError;
    
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  // Require admin authentication
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, content, category } = body;

    // Validate inputs
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 });
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 });
    }

    const categoryValidation = category ? validateCategory(category) : { valid: true };
    if (!categoryValidation.valid) {
      return NextResponse.json({ error: categoryValidation.error }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);
    const sanitizedCategory = category ? sanitizeInput(category) : '';

    // Create post
    const post = await createPost({
      title: sanitizedTitle,
      content: sanitizedContent,
      category: sanitizedCategory,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
