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
            <h1 className="text-3xl font-light mb-4 mt-8 first:mt-0 text-black dark:text-white" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-2xl font-light mb-3 mt-6 text-black dark:text-white" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-xl font-light mb-2 mt-4 text-black dark:text-white" {...props} />
          ),
          p: (props) => (
            <p className="mb-4 leading-relaxed text-black dark:text-white" {...props} />
          ),
          ul: (props) => (
            <ul className="mb-4 ml-6 list-disc" {...props} />
          ),
          ol: (props) => (
            <ol className="mb-4 ml-6 list-decimal" {...props} />
          ),
          li: (props) => (
            <li className="mb-1 text-black dark:text-white" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic text-black dark:text-white"
              {...props}
            />
          ),
          code: ({ className, children, ...props }: any) => {
            const isInline = !className;
            return isInline ? (
              <code
                className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm text-black dark:text-white"
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
              className="mb-4 p-4 rounded overflow-x-auto bg-gray-100 dark:bg-gray-900"
              {...props}
            />
          ),
          a: (props) => (
            <a
              className="text-black dark:text-white underline hover:opacity-70 transition-opacity"
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
              className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-left text-black dark:text-white"
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

