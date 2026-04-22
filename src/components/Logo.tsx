import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  withContainer?: boolean;
}

export default function Logo({ 
  className = "", 
  size = 40, 
  showText = false, 
  withContainer = true 
}: LogoProps) {
  const viewBoxSize = 200;
  
  const content = (
    <>
      {/* "形" Kanji */}
      <text 
        x="50%" 
        y={showText ? "48%" : "52%"} 
        text-anchor="middle" 
        dominant-baseline="middle" 
        fill="currentColor" 
        font-family="system-ui, 'Hiragino Sans', 'MS Mincho', serif" 
        font-weight="900" 
        font-size={showText ? "85" : "110"}
      >
        形
      </text>
      
      {/* Red accent dot */}
      <circle 
        cx={showText ? "142" : "155"} 
        cy={showText ? "38" : "45"} 
        r="10" 
        fill="#FF3B22" 
        stroke="currentColor" 
        stroke-width="4" 
      />

      {/* Brand Subtext */}
      {showText && (
        <text 
          x="50%" 
          y="162" 
          text-anchor="middle" 
          fill="currentColor" 
          font-family="sans-serif" 
          font-weight="900" 
          font-size="11" 
          letter-spacing="0.4em"
        >
          KATACHI
        </text>
      )}
    </>
  );

  if (!withContainer) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {content}
      </svg>
    );
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Neobrutalist Shadow */}
      <rect x="20" y="20" width="160" height="160" rx="28" fill="currentColor" />
      
      {/* Main Card Body */}
      <rect x="10" y="10" width="160" height="160" rx="28" fill="white" stroke="currentColor" stroke-width="8" />
      
      {content}
    </svg>
  );
}
