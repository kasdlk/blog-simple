// Utility functions

export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return generateDeviceId();
  }
  
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export function hasViewedPost(postId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const viewed = sessionStorage.getItem(`viewed_${postId}`);
  return viewed === 'true';
}

export function markPostAsViewed(postId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  sessionStorage.setItem(`viewed_${postId}`, 'true');
}

