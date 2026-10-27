import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/SectionHeading'
import { PhoneFrame } from '@/components/ui/PhoneFrame'
import { cn } from '@/lib/utils'

// Faint oversized phrase behind the headline, like "Run the shift." on the app login.
const BACKDROP = ['Open to', 'close.']

// App screenshot under /public for the phone frame; the frame stays hidden until one is added.
const HERO_SCREENSHOT: string | undefined = undefined

/** Homepage hero: faint layered phrase, one huge line, one sentence, one blue CTA. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -left-[0.05em] top-4 select-none whitespace-nowrap text-[clamp(120px,22vw,330px)] font-extrabold leading-[0.8] tracking-[-0.06em] text-ghost sm:top-8"
      >
        {BACKDROP[0]}
        <br />
        {BACKDROP[1]}
      </p>

      <Container className="relative pb-20 pt-14 sm:pb-28 sm:pt-24 lg:pt-28">
        <div className="flex flex-col items-start gap-6">
          <Label>Built for small restaurants</Label>
          <h1 className="max-w-5xl text-hero text-balance">
            Everything Your Restaurant Team Needs to Run Like the Big Guys
          </h1>
        </div>

        <div
          className={cn(
            'mt-8 grid items-start gap-14 lg:mt-10 lg:gap-20',
            HERO_SCREENSHOT && 'lg:grid-cols-[minmax(0,1fr)_300px]',
          )}
        >
          <div className="flex flex-col items-start gap-6">
            <p className="max-w-text text-body text-grey">
              One app for scheduling, inventory, recipes, prep, and compliance. Built for small
              restaurants. Priced for them, too.
            </p>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
              <Button href="/demo">Book a Demo</Button>
              <Button href="/demo" variant="link">
                Watch 2-min demo
              </Button>
            </div>
          </div>

          <PhoneFrame screen="Home — today’s shift" src={HERO_SCREENSHOT} priority />
        </div>
      </Container>
    </section>
  )
}
