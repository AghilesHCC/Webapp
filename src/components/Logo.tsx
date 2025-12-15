import React from 'react'

interface LogoProps {
  className?: string
  variant?: 'light' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({ className = "h-16 w-auto", variant = 'dark' }) => {
  const mainColor = variant === 'light' ? '#FFFFFF' : '#001315'
  const subColor = variant === 'light' ? '#E0E0E0' : '#58595b'

  return (
    <svg
      viewBox="0 0 320 150"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Coffice - Coworking Space by HCC"
    >
      <defs>
        <linearGradient id="cofficeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#0D9488', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0891B2', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      <g transform="translate(20, 30)">
        <circle cx="8" cy="8" r="6" fill="url(#cofficeGradient)" opacity="0.8" />
        <circle cx="20" cy="8" r="6" fill="url(#cofficeGradient)" opacity="0.6" />
        <circle cx="32" cy="8" r="6" fill="url(#cofficeGradient)" opacity="0.4" />
      </g>

      <g transform="translate(20, 65)">
        <text
          dominantBaseline="auto"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="64px"
          fontWeight="800"
          fill={mainColor}
          letterSpacing="-2"
        >
          COFFICE
        </text>
      </g>

      <g transform="translate(22, 110)">
        <text
          dominantBaseline="auto"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="16px"
          fontWeight="600"
          fill={subColor}
          letterSpacing="2"
        >
          COWORKING SPACE BY HCC
        </text>
      </g>
    </svg>
  )
}

export default Logo
