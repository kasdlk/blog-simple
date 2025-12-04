import db from './db';

export interface BlogSettings {
  blogTitle: string;
  blogSubtitle: string;
  authorName: string;
  authorBio: string;
  authorEmail: string;
  authorAvatar: string;
  language: string;
  enableComments: string;
  enableLikes: string;
  enableViews: string;
}

export async function getSettings(): Promise<BlogSettings> {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as Array<{ key: string; value: string }>;
  
  const settings: Partial<BlogSettings> = {};
  for (const row of rows) {
    settings[row.key as keyof BlogSettings] = row.value;
  }
  
  return {
    blogTitle: settings.blogTitle || 'Blog',
    blogSubtitle: settings.blogSubtitle || '',
    authorName: settings.authorName || '',
    authorBio: settings.authorBio || '',
    authorEmail: settings.authorEmail || '',
    authorAvatar: settings.authorAvatar || '',
    language: settings.language || 'en',
    enableComments: settings.enableComments || 'true',
    enableLikes: settings.enableLikes || 'true',
    enableViews: settings.enableViews || 'true',
  };
}

export async function updateSettings(settings: Partial<BlogSettings>): Promise<BlogSettings> {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, value || '');
  }
  
  return getSettings();
}

