import React from 'react'

interface LogoProps {
  className?: string
  variant?: 'light' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({ className = "h-16 w-auto", variant = 'dark' }) => {
  return (
    <img
      src="/logo.png"
      alt="Coffice - Coworking Space by HCC"
      className={`${className} ${variant === 'light' ? 'brightness-0 invert' : ''}`}
    />
  )
}

export default Logo
