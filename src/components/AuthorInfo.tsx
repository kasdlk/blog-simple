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
        <div className="mb-5">
          <Image
            src={settings.authorAvatar}
            alt={settings.authorName || 'Author'}
            width={72}
            height={72}
            className="rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-800 transition-all duration-300 hover:ring-gray-300 dark:hover:ring-gray-700"
          />
        </div>
      )}
      {settings.authorName && (
        <h2 className="text-lg font-light text-black dark:text-white mb-3">
          {settings.authorName}
        </h2>
      )}
      {settings.authorBio && (
        <p className="text-xs sm:text-sm text-black dark:text-gray-100 mb-4 leading-relaxed font-light">
          {settings.authorBio}
        </p>
      )}
      {settings.authorEmail && (
        <a
          href={`mailto:${settings.authorEmail}`}
          className="text-xs text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 inline-flex items-center gap-1.5 font-light hover:underline underline-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          {settings.authorEmail}
        </a>
      )}
    </div>
  );
}












