import { cn } from '@/lib/utils'

interface ImagePlaceholderProps {
  label?: string
  /** Aspect ratio as a CSS value, e.g. "4/3", "16/9", "3/2". */
  ratio?: string
  className?: string
}

/**
 * Labeled hairline box for image slots that don't have real assets yet.
 * Swap for a `next/image` once photography is available.
 */
export function ImagePlaceholder({
  label = 'Image placeholder',
  ratio = '16/9',
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder)`}
      style={{ aspectRatio: ratio }}
      className={cn(
        'flex w-full items-center justify-center rounded-md border border-dashed border-line px-6 text-center',
        className,
      )}
    >
      <span className="text-small text-grey-light">Photo needed: {label}</span>
    </div>
  )
}
