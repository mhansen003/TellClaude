"use client";

interface FormattedPromptProps {
  content: string;
}

export default function FormattedPrompt({ content }: FormattedPromptProps) {
  // Parse and render the prompt with styling
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-none space-y-1 my-2 ml-4">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-text-secondary">
                <span className="text-claude-orange mt-1">•</span>
                <span>{item}</span>
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
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // ## Heading
      if (trimmedLine.startsWith('## ')) {
        flushList();
        const headingText = trimmedLine.slice(3);
        elements.push(
          <h3 key={index} className="text-sm font-bold text-claude-orange mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-claude-orange" />
            {headingText}
          </h3>
        );
        return;
      }

      // ### Subheading
      if (trimmedLine.startsWith('### ')) {
        flushList();
        const headingText = trimmedLine.slice(4);
        elements.push(
          <h4 key={index} className="text-sm font-semibold text-accent-teal mt-3 mb-1">
            {headingText}
          </h4>
        );
        return;
      }

      // Bullet point (- or *)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        currentList.push(trimmedLine.slice(2));
        return;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmedLine)) {
        flushList();
        const match = trimmedLine.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={index} className="flex items-start gap-2 my-1 ml-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-claude-orange/20 text-claude-orange text-xs font-bold flex items-center justify-center">
                {match[1]}
              </span>
              <span className="text-text-secondary">{match[2]}</span>
            </div>
          );
        }
        return;
      }

      // Code block markers
      if (trimmedLine.startsWith('```')) {
        flushList();
        // We'll just style this as a code indicator
        if (trimmedLine.length > 3) {
          elements.push(
            <div key={index} className="text-xs text-accent-purple font-mono mt-2">
              {trimmedLine.slice(3).toUpperCase()}
            </div>
          );
        }
        return;
      }

      // Inline code (text with backticks)
      if (trimmedLine.includes('`')) {
        flushList();
        const parts = trimmedLine.split(/(`[^`]+`)/g);
        elements.push(
          <p key={index} className="text-text-secondary my-1">
            {parts.map((part, i) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={i} className="px-1.5 py-0.5 rounded bg-bg-elevated text-accent-purple font-mono text-xs">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
        return;
      }

      // Bold text (**text**)
      if (trimmedLine.includes('**')) {
        flushList();
        const parts = trimmedLine.split(/(\*\*[^*]+\*\*)/g);
        elements.push(
          <p key={index} className="text-text-secondary my-1">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={i} className="text-text-primary font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-text-secondary my-1 leading-relaxed">
          {trimmedLine}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className="formatted-prompt text-sm space-y-0">
      {renderContent()}
    </div>
  );
}
