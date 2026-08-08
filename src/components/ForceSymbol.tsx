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
      <span className="relative inline-block pr-[1px]">
        {showArrow && (
          <span
            className="absolute -top-[0.62em] left-0 right-0 text-center text-[0.65em] font-sans leading-none pointer-events-none opacity-90"
            aria-hidden="true"
          >
            ➔
          </span>
        )}
        <span>{main}</span>
      </span>
      {sub && (
        <sub className="text-[0.7em] font-bold leading-none -bottom-[0.08em] ml-[0.05em]">
          {sub}
        </sub>
      )}
    </span>
  );
};
