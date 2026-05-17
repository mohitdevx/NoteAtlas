import { useEffect, useMemo, useState } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import './markdown.css';

interface NoteViewerProps {
  notePath: string | null;
  isDark: boolean;
}

interface FetchState {
  path: string | null;
  content: string;
  errorMessage: string | null;
}

const initialFetchState: FetchState = {
  path: null,
  content: '',
  errorMessage: null,
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard !== undefined && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const fallbackTextArea = document.createElement('textarea');
    fallbackTextArea.value = text;
    fallbackTextArea.style.position = 'fixed';
    fallbackTextArea.style.opacity = '0';
    document.body.appendChild(fallbackTextArea);
    fallbackTextArea.focus();
    fallbackTextArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(fallbackTextArea);
    return copied;
  } catch {
    return false;
  }
};

interface CodeSnippetProps {
  code: string;
  language: string;
  isDark: boolean;
}

const CodeSnippet = ({ code, language, isDark }: CodeSnippetProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    const copied = await copyText(code);
    if (!copied) {
      return;
    }

    setIsCopied(true);
    window.setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-line bg-surface-muted shadow-classy">
      <div className="flex items-center justify-between border-b border-line bg-surface px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-txt-muted">{language}</span>
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2 py-1 text-xs font-medium text-txt-main transition hover:bg-brand-muted"
          aria-label={`Copy ${language} snippet`}
        >
          <i className={isCopied ? 'ri-check-line text-brand' : 'ri-file-copy-line text-brand'} aria-hidden />
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          border: 'none',
          background: 'transparent',
          padding: '1rem',
        }}
        codeTagProps={{
          style: {
            fontSize: '0.88rem',
            lineHeight: '1.65',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const NoteViewer = ({ notePath, isDark }: NoteViewerProps) => {
  const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);
  const [isPageCopied, setIsPageCopied] = useState(false);

  useEffect(() => {
    if (notePath === null) {
      return;
    }

    const controller = new AbortController();

    const loadNote = async () => {
      try {
        const response = await fetch(notePath, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Could not load note (${response.status})`);
        }

        const markdown = await response.text();

        setFetchState({
          path: notePath,
          content: markdown,
          errorMessage: null,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const fallback = 'Unable to load this note.';
        const message = error instanceof Error ? error.message : fallback;

        setFetchState({
          path: notePath,
          content: '',
          errorMessage: message,
        });
      }
    };

    void loadNote();

    return () => {
      controller.abort();
    };
  }, [notePath]);

  const isLoading = notePath !== null && fetchState.path !== notePath;
  const activeError = fetchState.path === notePath ? fetchState.errorMessage : null;
  const activeContent = fetchState.path === notePath ? fetchState.content : '';
  const canCopyWholePage = notePath !== null && !isLoading && activeError === null && activeContent.length > 0;

  const markdownComponents = useMemo<Components>(
    () => ({
      pre({ children }) {
        return <>{children}</>;
      },
      code({ className, children, ...props }) {
        const languageMatch = /language-(\w+)/.exec(className ?? '');
        const rawCode = String(children).replace(/\n$/, '');

        if (languageMatch !== null) {
          return <CodeSnippet code={rawCode} language={languageMatch[1]} isDark={isDark} />;
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    [isDark],
  );

  const copyFullMarkdown = async (): Promise<void> => {
    if (!canCopyWholePage) {
      return;
    }

    const copied = await copyText(activeContent);
    if (!copied) {
      return;
    }

    setIsPageCopied(true);
    window.setTimeout(() => {
      setIsPageCopied(false);
    }, 1800);
  };

  return (
    <>
      <section className="mx-auto w-full max-w-4xl rounded-xl border border-line bg-surface p-5 shadow-classy md:p-8">
        {notePath === null ? (
          <p className="text-txt-muted">Select a note from the sidebar.</p>
        ) : null}

        {isLoading ? <p className="text-txt-muted">Loading note...</p> : null}

        {activeError !== null ? (
          <p className="rounded-md bg-surface-muted px-3 py-2 text-txt-muted">{activeError}</p>
        ) : null}

        {notePath !== null && !isLoading && activeError === null && activeContent.length > 0 ? (
          <article className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {activeContent}
            </ReactMarkdown>
          </article>
        ) : null}
      </section>

      <button
        type="button"
        onClick={() => {
          void copyFullMarkdown();
        }}
        disabled={!canCopyWholePage}
        className="fixed bottom-4 left-1/2 z-20 inline-flex w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-txt-main shadow-classy transition enabled:hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-60 md:bottom-6 md:left-auto md:right-6 md:w-auto md:max-w-none md:translate-x-0"
        aria-label="Copy current page as markdown"
      >
        <i className={isPageCopied ? 'ri-check-line text-brand' : 'ri-markdown-line text-brand'} aria-hidden />
        <span>{isPageCopied ? 'Markdown Copied' : 'Copy Page Markdown'}</span>
      </button>
    </>
  );
};

export default NoteViewer;
