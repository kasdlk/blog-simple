// Input validation utilities

export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 50000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_CATEGORY_LENGTH = 50;
export const MAX_BIO_LENGTH = 500;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTitle(title: string): ValidationResult {
  if (!title || !title.trim()) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Title must be less than ${MAX_TITLE_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateContent(content: string): ValidationResult {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Content is required' };
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `Content must be less than ${MAX_CONTENT_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateComment(content: string): ValidationResult {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Comment content is required' };
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Comment must be less than ${MAX_COMMENT_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateCategory(category: string): ValidationResult {
  if (category && category.length > MAX_CATEGORY_LENGTH) {
    return { valid: false, error: `Category must be less than ${MAX_CATEGORY_LENGTH} characters` };
  }
  return { valid: true };
}

export function sanitizeInput(input: string): string {
  // Remove null bytes and trim
  return input.replace(/\0/g, '').trim();
}

export function isValidDeviceId(deviceId: string): boolean {
  // Device ID should be a string starting with "device_" and contain alphanumeric characters
  return /^device_\d+_[a-z0-9]+$/.test(deviceId);
}

