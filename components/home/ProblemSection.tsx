import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PROBLEMS } from '@/lib/content'

/** "The Problem Every Small Restaurant Faces" — three pain points under hairlines. */
export function ProblemSection() {
  return (
    <Section aria-labelledby="problem-heading">
      <SectionHeading
        eyebrow="The reality"
        title={<span id="problem-heading">The Problem Every Small Restaurant Faces</span>}
        subtitle="You have the same operational rigor as a big chain — without the staff to run five different tools."
      />
      <div className="mt-14 grid gap-x-10 md:grid-cols-3">
        {PROBLEMS.map(({ title, copy }) => (
          <div key={title} className="flex flex-col gap-2 border-t border-line py-6">
            <h3 className="text-body font-medium">{title}</h3>
            <p className="text-[15px] text-grey">{copy}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
