interface WassermanLogoProps {
  className?: string
  width?: number
  height?: number
}

export function WassermanLogo({ className = "", width = 32, height = 32 }: WassermanLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
    >
      {/* Simple geometric W logo - replace with your actual logo */}
      <rect x="2" y="8" width="4" height="16" fill="currentColor" />
      <rect x="8" y="12" width="4" height="12" fill="currentColor" />
      <rect x="14" y="16" width="4" height="8" fill="currentColor" />
      <rect x="20" y="12" width="4" height="12" fill="currentColor" />
      <rect x="26" y="8" width="4" height="16" fill="currentColor" />
    </svg>
  )
}