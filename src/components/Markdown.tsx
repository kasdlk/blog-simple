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
            <h1 className="text-3xl sm:text-4xl font-light mb-6 mt-10 first:mt-0 text-black dark:text-white tracking-tight" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-2xl sm:text-3xl font-light mb-4 mt-8 text-black dark:text-white tracking-tight" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-xl sm:text-2xl font-light mb-3 mt-6 text-black dark:text-white tracking-tight" {...props} />
          ),
          p: (props) => (
            <p className="mb-5 sm:mb-6 leading-relaxed text-base sm:text-lg text-black dark:text-gray-100 font-light" {...props} />
          ),
          ul: (props) => (
            <ul className="mb-4 ml-6 list-disc" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-4 ml-6 list-decimal" {...props} />
          ),
          li: (props) => (
            <li className="mb-1.5 text-black dark:text-gray-100" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-6 pr-4 py-2 my-6 italic text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-r-md"
              {...props}
            />
          ),
          code: ({ className, children, ...props }: any) => {
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
              className="mb-6 p-4 sm:p-6 rounded-lg overflow-x-auto bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              {...props}
            />
          ),
          a: (props) => (
            <a
              className="text-gray-800 dark:text-gray-200 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors duration-300"
              {...props}
            />
          ),
          hr: (props) => (
            <hr className="my-8 border-gray-200 dark:border-gray-800" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:!bg-[#262121] text-left text-black dark:text-white"
              {...props}
            />
          ),
          td: (props) => (
            <td
              className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-black dark:text-white"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

