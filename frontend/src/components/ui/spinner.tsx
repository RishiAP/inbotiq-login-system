import React from 'react'
import { Loader2 } from 'lucide-react'

type SpinnerProps = {
  /** show the spinner (if false, only text renders) */
  loading?: boolean
  /** text to display alongside the spinner (optional) */
  text?: string
  /** position of the text relative to the spinner */
  textPosition?: 'left' | 'right'
  /** size in pixels or tailwind size class (e.g. 'w-4 h-4') */
  size?: number | string
  className?: string
  gap?: number | string
}

export default function Spinner({
  loading = true,
  text,
  textPosition = 'right',
  size = 16,
  className = '',
  gap = 8,
}: SpinnerProps) {
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : undefined
  const gapStyle = typeof gap === 'number' ? { gap } : undefined

  const icon = (
    <Loader2 aria-hidden className={`animate-spin ${className}`} style={sizeStyle} />
  )

  // Render a single inline-flex container with a gap so the parent Button's
  // justify-center can center the whole content. Avoid adding left/right
  // margins on the text which would shift centering.
  return (
    <span className="inline-flex items-center" style={gapStyle}>
      {text && textPosition === 'left' && <span className="whitespace-nowrap">{text}</span>}

      {loading ? icon : null}

      {text && textPosition === 'right' && <span className="whitespace-nowrap">{text}</span>}
    </span>
  )
}
