import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TESTIMONIALS } from '@/lib/content'

/** Social proof. Placeholder quotes stay hidden until real customers replace them. */
export function TestimonialSection() {
  const quotes = TESTIMONIALS.filter((t) => !t.placeholder)
  if (quotes.length === 0) return null

  return (
    <Section aria-labelledby="testimonials-heading">
      <SectionHeading
        eyebrow="Social proof"
        title={<span id="testimonials-heading">Loved by restaurant teams</span>}
      />
      <div className="mt-14 grid gap-x-10 md:grid-cols-3">
        {quotes.map((t) => (
          <figure key={t.name} className="flex flex-col gap-5 border-t border-line py-6 md:col-span-2 lg:col-span-1">
            <blockquote className="text-body text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="text-small">
              <span className="block font-medium text-ink">{t.name}</span>
              <span className="block text-grey">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
