import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Check if the request is authenticated as admin
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token');
  if (!token) {
    return false;
  }
  // Verify the token signature and check expiration
  const username = verifyToken(token.value);
  return !!username;
}

/**
 * Middleware to require admin authentication
 * Returns null if authenticated, or a NextResponse with error if not
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Validate search query to prevent injection attacks
 */
export function validateSearchQuery(query: string): { valid: boolean; error?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Invalid search query' };
  }
  
  // Limit search query length
  if (query.length > 100) {
    return { valid: false, error: 'Search query too long (max 100 characters)' };
  }
  
  // Remove potentially dangerous characters but allow normal search terms
  // Allow letters, numbers, spaces, and common punctuation
  const sanitized = query.trim();
  if (sanitized.length === 0) {
    return { valid: false, error: 'Search query cannot be empty' };
  }
  
  return { valid: true };
}

