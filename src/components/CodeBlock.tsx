import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  comment?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'typescript', comment = '' }) => (
  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
    {comment && (
      <div className="px-6 pt-4 pb-2 text-green-400 font-mono text-sm">
        {comment}
      </div>
    )}
    <SyntaxHighlighter
      language={language}
      style={{
        ...vscDarkPlus,
        'pre[class*="language-"]': {
          ...vscDarkPlus['pre[class*="language-"]'],
          background: '#0d1117',
        },
        'code[class*="language-"]': {
          ...vscDarkPlus['code[class*="language-"]'],
          background: '#0d1117',
        },
      }}
      customStyle={{
        margin: 0,
        padding: '1.5rem',
        background: '#0d1117',
        fontSize: '0.9rem',
      }}
      showLineNumbers={false}
    >
      {code.trim()}
    </SyntaxHighlighter>
  </div>
);

export default CodeBlock;
