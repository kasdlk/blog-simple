import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPosts, createPost, getCategories } from '@/lib/posts';
import { validateTitle, validateContent, validateCategory, sanitizeInput } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 50); // Limit max page size

    if (category || page > 1) {
      const data = await getPosts(category, page, pageSize);
      return NextResponse.json(data);
    } else {
      // For admin page, return all posts (consider adding pagination here too)
      const posts = await getAllPosts();
      return NextResponse.json(posts);
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category } = await request.json();
    
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

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);
    const sanitizedCategory = category ? sanitizeInput(category) : '';

    const newPost = await createPost({ 
      title: sanitizedTitle, 
      content: sanitizedContent, 
      category: sanitizedCategory 
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
