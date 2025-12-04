import Image from 'next/image';
import { BlogSettings } from '@/lib/settings';

interface AuthorInfoProps {
  settings: BlogSettings;
}

export default function AuthorInfo({ settings }: AuthorInfoProps) {
  const hasInfo = settings.authorAvatar || settings.authorName || settings.authorBio || settings.authorEmail;

  if (!hasInfo) {
    return null;
  }

  return (
    <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
      {settings.authorAvatar && (
        <div className="mb-4">
          <Image
            src={settings.authorAvatar}
            alt={settings.authorName || 'Author'}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        </div>
      )}
      {settings.authorName && (
        <h2 className="text-lg font-light text-black dark:text-white mb-2">
          {settings.authorName}
        </h2>
      )}
      {settings.authorBio && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 leading-relaxed">
          {settings.authorBio}
        </p>
      )}
      {settings.authorEmail && (
        <a
          href={`mailto:${settings.authorEmail}`}
          className="text-xs text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white transition-colors"
        >
          {settings.authorEmail}
        </a>
      )}
    </div>
  );
}

