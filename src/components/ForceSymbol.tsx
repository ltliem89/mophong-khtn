import React from 'react';

interface ForceSymbolProps {
  name: string;
  className?: string;
  showArrow?: boolean;
}

/**
 * Renders standard Physics vector force notation with an arrow overhead and proper subscript.
 * E.g., F1 -> F⃗₁ (Vector F with subscript 1)
 */
export const ForceSymbol: React.FC<ForceSymbolProps> = ({
  name,
  className = '',
  showArrow = true,
}) => {
  let main = 'F';
  let sub = '';

  if (name.toLowerCase().startsWith('f')) {
    sub = name.substring(1);
  } else {
    main = name;
  }

  return (
    <span className={`inline-flex items-baseline font-extrabold tracking-tight select-none ${className}`}>
      {showArrow ? (
        <span className="relative inline-flex flex-col items-center">
          <span className="text-[0.6em] font-sans leading-none pointer-events-none select-none text-current opacity-90 -mb-0.5" aria-hidden="true">
            ➔
          </span>
          <span className="leading-none">{main}</span>
        </span>
      ) : (
        <span>{main}</span>
      )}
      {sub && (
        <sub className="text-[0.75em] font-bold leading-none ml-[0.05em]">
          {sub}
        </sub>
      )}
    </span>
  );
};
