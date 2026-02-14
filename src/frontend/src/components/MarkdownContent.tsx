import React from 'react';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    const lines = text.split('\n');
    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
              <code className="text-sm">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
            {line.slice(2)}
          </h1>
        );
      }
      // Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-6 list-disc">
            {formatInlineMarkdown(line.trim().slice(2))}
          </li>
        );
      } else if (line.trim().match(/^\d+\. /)) {
        const text = line.trim().replace(/^\d+\. /, '');
        elements.push(
          <li key={index} className="ml-6 list-decimal">
            {formatInlineMarkdown(text)}
          </li>
        );
      }
      // Blockquotes
      else if (line.trim().startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-muted-foreground/30 pl-4 italic my-4">
            {formatInlineMarkdown(line.slice(2))}
          </blockquote>
        );
      }
      // Horizontal rule
      else if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="my-6 border-border" />);
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={index} className="h-4" />);
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={index} className="my-3 leading-7">
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const formatInlineMarkdown = (text: string): React.ReactNode => {
    const parts: (string | React.ReactElement)[] = [];
    let currentText = text;
    let key = 0;

    // Bold
    currentText = currentText.replace(/\*\*(.+?)\*\*/g, (_, content) => {
      parts.push(<strong key={`bold-${key++}`}>{content}</strong>);
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Italic
    currentText = currentText.replace(/\*(.+?)\*/g, (_, content) => {
      parts.push(<em key={`italic-${key++}`}>{content}</em>);
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Inline code
    currentText = currentText.replace(/`(.+?)`/g, (_, content) => {
      parts.push(
        <code key={`code-${key++}`} className="bg-muted px-1.5 py-0.5 rounded text-sm">
          {content}
        </code>
      );
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Links
    currentText = currentText.replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => {
      parts.push(
        <a key={`link-${key++}`} href={url} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Reconstruct with placeholders replaced
    const finalParts: (string | React.ReactElement)[] = [];
    const segments = currentText.split(/(__PLACEHOLDER_\d+__)/);
    
    segments.forEach((segment) => {
      const match = segment.match(/__PLACEHOLDER_(\d+)__/);
      if (match) {
        finalParts.push(parts[parseInt(match[1])]);
      } else if (segment) {
        finalParts.push(segment);
      }
    });

    return finalParts.length > 0 ? finalParts : text;
  };

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {renderContent(content)}
    </div>
  );
}
