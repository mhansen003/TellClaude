"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FormattedPromptProps {
  content: string;
}

export default function FormattedPrompt({ content }: FormattedPromptProps) {
  // Custom theme based on VS Code Dark+ with Claude orange accents
  const customTheme = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: "#1e1e2e",
      margin: 0,
      padding: "1rem",
      borderRadius: "0.75rem",
      fontSize: "0.8125rem",
      lineHeight: "1.6",
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: "transparent",
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, Monaco, monospace",
    },
  };

  // Parse content and identify code blocks
  const renderContent = () => {
    const elements: JSX.Element[] = [];

    // Split by code blocks (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Render text before code block
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        elements.push(
          <div key={`text-${blockIndex}`} className="whitespace-pre-wrap">
            {renderTextContent(textBefore, blockIndex)}
          </div>
        );
      }

      // Render code block with syntax highlighting
      const language = match[1] || "javascript";
      const code = match[2].trim();

      elements.push(
        <div key={`code-${blockIndex}`} className="my-3 rounded-xl overflow-hidden border border-border-subtle">
          {/* Language badge */}
          <div className="bg-bg-elevated px-3 py-1.5 border-b border-border-subtle flex items-center gap-2">
            <span className="text-xs font-mono text-claude-orange font-semibold uppercase">{language}</span>
            <div className="flex gap-1 ml-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-rose/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-claude-amber/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green/60"></span>
            </div>
          </div>
          <SyntaxHighlighter
            language={language}
            style={customTheme}
            showLineNumbers={code.split("\n").length > 3}
            lineNumberStyle={{
              minWidth: "2.5em",
              paddingRight: "1em",
              color: "#6e7681",
              userSelect: "none",
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
      blockIndex++;
    }

    // Render remaining text after last code block
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      elements.push(
        <div key={`text-final`} className="whitespace-pre-wrap">
          {renderTextContent(remainingText, blockIndex)}
        </div>
      );
    }

    // If no code blocks, render all as text
    if (elements.length === 0) {
      return renderTextContent(content, 0);
    }

    return elements;
  };

  // Render non-code text with markdown-like styling
  const renderTextContent = (text: string, keyPrefix: number) => {
    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`${keyPrefix}-list-${listKey++}`} className="list-none space-y-1 my-2 ml-4">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-text-secondary">
                <span className="text-claude-orange mt-0.5">•</span>
                <span>{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        flushList();
        elements.push(<div key={`${keyPrefix}-${index}`} className="h-2" />);
        return;
      }

      // ## Heading
      if (trimmedLine.startsWith("## ")) {
        flushList();
        const headingText = trimmedLine.slice(3);
        elements.push(
          <h3 key={`${keyPrefix}-${index}`} className="text-sm font-bold text-claude-orange mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-claude-orange" />
            {headingText}
          </h3>
        );
        return;
      }

      // ### Subheading
      if (trimmedLine.startsWith("### ")) {
        flushList();
        const headingText = trimmedLine.slice(4);
        elements.push(
          <h4 key={`${keyPrefix}-${index}`} className="text-sm font-semibold text-accent-teal mt-3 mb-1">
            {headingText}
          </h4>
        );
        return;
      }

      // Bullet point (- or *)
      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        currentList.push(trimmedLine.slice(2));
        return;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmedLine)) {
        flushList();
        const match = trimmedLine.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={`${keyPrefix}-${index}`} className="flex items-start gap-2 my-1 ml-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-claude-orange/20 text-claude-orange text-xs font-bold flex items-center justify-center">
                {match[1]}
              </span>
              <span className="text-text-secondary">{renderInlineFormatting(match[2])}</span>
            </div>
          );
        }
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`${keyPrefix}-${index}`} className="text-text-secondary my-1 leading-relaxed">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  // Handle inline formatting: `code`, **bold**, *italic*
  const renderInlineFormatting = (text: string) => {
    // Split by inline code first
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, i) => {
      // Inline code
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-bg-elevated text-accent-purple font-mono text-xs border border-border-subtle">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Check for bold (**text**)
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((boldPart, j) => {
        if (boldPart.startsWith("**") && boldPart.endsWith("**")) {
          return (
            <strong key={`${i}-${j}`} className="text-text-primary font-semibold">
              {boldPart.slice(2, -2)}
            </strong>
          );
        }
        return <span key={`${i}-${j}`}>{boldPart}</span>;
      });
    });
  };

  return (
    <div className="formatted-prompt text-sm space-y-0">
      {renderContent()}
    </div>
  );
}
