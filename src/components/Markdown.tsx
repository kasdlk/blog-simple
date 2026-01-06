'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: (props) => (
            <h1 className="text-2xl sm:text-3xl font-light mb-4 mt-10 first:mt-0 text-black dark:text-white tracking-tight" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-xl sm:text-2xl font-light mb-3 mt-9 text-black dark:text-white tracking-tight" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-lg sm:text-xl font-light mb-3 mt-7 text-black dark:text-white tracking-tight" {...props} />
          ),
          p: (props) => (
            <p className="mb-4 sm:mb-5 leading-7 text-[15px] sm:text-base text-black dark:text-gray-100 font-light" {...props} />
          ),
          ul: (props) => (
            <ul className="mb-4 ml-6 list-disc space-y-1.5" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1.5" {...props} />
          ),
          li: (props) => (
            <li className="text-black dark:text-gray-100 leading-7" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-5 pr-4 py-2.5 my-6 text-black dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded-r-md [&>p:last-child]:mb-0 [&>ul:last-child]:mb-0 [&>ol:last-child]:mb-0 [&>*:last-child]:mb-0"
              {...props}
            />
          ),
          code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm font-mono text-black dark:text-white border border-gray-200 dark:border-gray-800"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: (props) => (
            <pre
              className="mb-6 p-4 sm:p-6 rounded-lg overflow-x-auto bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm leading-relaxed"
              {...props}
            />
          ),
          a: (props) => (
            <a
              className="text-gray-800 dark:text-gray-200 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors duration-300 break-words"
              {...props}
            />
          ),
          hr: (props) => (
            <hr className="my-8 border-gray-200 dark:border-gray-800" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full border-collapse text-sm" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-gray-50 dark:!bg-[#262121] text-left text-black dark:text-white font-medium"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-black dark:text-white align-top"
              {...props}
            />
          ),
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="my-6 rounded-lg border border-gray-200 dark:border-gray-800 max-w-full h-auto"
              {...props}
              alt={props.alt || ''}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

