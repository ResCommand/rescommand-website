import { Button } from '@/components/ui/Button'
import { PhoneFrame } from '@/components/ui/PhoneFrame'
import { cn } from '@/lib/utils'
import type { FeatureItem } from '@/lib/content'

interface FeatureDetailProps {
  feature: FeatureItem
  /** Alternates the screenshot side for rhythm down the page. */
  reverse?: boolean
}

/** One feature per screen: huge line, problem → solution → benefit, hairline bullets, the app. */
export function FeatureDetail({ feature, reverse = false }: FeatureDetailProps) {
  return (
    <div id={feature.slug} className="grid scroll-mt-24 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
      <div className={cn('flex flex-col items-start gap-6', reverse && 'lg:order-2')}>
        <h2 className="text-huge text-balance">{feature.title}</h2>

        <div className="flex max-w-text flex-col gap-3 text-[15px] text-grey">
          <p>
            <span className="font-medium text-ink">The problem: </span>
            {feature.problem}
          </p>
          <p>
            <span className="font-medium text-ink">How we solve it: </span>
            {feature.solution}
          </p>
          <p>
            <span className="font-medium text-ink">What that means for you: </span>
            {feature.benefit}
          </p>
        </div>

        <ul className="w-full max-w-text border-b border-line">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex min-h-[44px] items-center border-t border-line text-[15px]">
              {bullet}
            </li>
          ))}
        </ul>

        <Button href="/demo" variant="link">
          See demo →
        </Button>
      </div>

      <div className={cn(reverse && 'lg:order-1')}>
        <PhoneFrame screen={feature.screen} />
      </div>
    </div>
  )
}
