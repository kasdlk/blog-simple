// Get or create a unique device ID
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// Check if post has been viewed in this session
export function hasViewedPost(postId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const viewed = sessionStorage.getItem(`viewed_${postId}`);
  return viewed === 'true';
}

// Mark post as viewed in this session
export function markPostAsViewed(postId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(`viewed_${postId}`, 'true');
}

// Format date consistently for server and client
export function formatDate(dateString: string, language: 'en' | 'zh'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(dateString: string, language: 'en' | 'zh'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
