import React from 'react';

export const KuditrakaLogomark = ({ size = 64, color = "currentColor", className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Interlocking geometric strokes logomark */}
    <path 
      d="M15 25 L65 25 L85 45 L85 55 L70 55 L55 40 L15 40 Z" 
      fill={color} 
    />
    <path 
      d="M85 75 L35 75 L15 55 L15 45 L30 45 L45 60 L85 60 Z" 
      fill={color} 
    />
  </svg>
);

export const KuditrakaWordmark = ({ height = 32, color = "currentColor", className = "" }) => (
  <svg 
    height={height} 
    viewBox="0 0 500 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Stylized KUDITRAKA typography using geometric paths */}
    <g fill={color} style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 50, letterSpacing: '0.1em' }}>
      <text x="0" y="45">KUDITRAKA</text>
    </g>
  </svg>
);
