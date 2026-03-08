"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

const proseClasses = {
  // Container
  div: "space-y-3",
  // Headings
  h1: "font-serif text-2xl font-light text-charcoal border-b-2 border-charcoal pb-2",
  h2: "font-serif text-xl font-light text-charcoal border-b border-mist pb-1",
  h3: "font-serif text-lg font-light text-charcoal",
  p: "text-slate leading-relaxed",
  ul: "list-disc list-inside text-slate space-y-1",
  ol: "list-decimal list-inside text-slate space-y-1",
  li: "leading-relaxed",
  blockquote:
    "border-l-2 border-charcoal pl-4 text-pewter italic",
  code: "font-mono text-sm bg-mist px-1.5 py-0.5 text-charcoal",
  pre: "font-mono text-sm bg-charcoal text-white p-4 overflow-x-auto border-2 border-charcoal",
  a: "text-oxblood underline hover:text-oxblood-deep",
  strong: "font-semibold text-charcoal",
  hr: "border-t-2 border-mist my-4",
};

export function MarkdownContent({ content, className = "" }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={proseClasses.h1}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={proseClasses.h2}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className={proseClasses.h3}>{children}</h3>
          ),
          p: ({ children }) => (
            <p className={proseClasses.p}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul className={proseClasses.ul}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={proseClasses.ol}>{children}</ol>
          ),
          li: ({ children }) => (
            <li className={proseClasses.li}>{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={proseClasses.blockquote}>
              {children}
            </blockquote>
          ),
          code: ({ className: langClass, ...props }) => {
            const isBlock =
              typeof langClass === "string" &&
              langClass.startsWith("language-");
            return (
              <code
                className={
                  isBlock
                    ? "font-mono text-sm block bg-transparent p-0 text-inherit"
                    : proseClasses.code
                }
                {...props}
              />
            );
          },
          pre: ({ children }) => (
            <pre className={proseClasses.pre}>{children}</pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={proseClasses.a}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={proseClasses.strong}>{children}</strong>
          ),
          hr: () => <hr className={proseClasses.hr} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
