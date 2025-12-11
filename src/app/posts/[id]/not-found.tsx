import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-light text-black dark:text-white mb-4">
          Post not found
        </h1>
        <Link
          href="/"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}








