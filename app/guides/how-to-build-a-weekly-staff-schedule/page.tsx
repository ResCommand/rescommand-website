import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CTASection } from '@/components/ui/CTASection'
import { Label } from '@/components/ui/SectionHeading'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

const PATH = '/guides/how-to-build-a-weekly-staff-schedule'
const PUBLISHED = '2026-11-23'
const TITLE = 'How to Build and Share a Weekly Staff Schedule in Minutes'
const DESCRIPTION =
  'Build a weekly staff schedule for a restaurant, cafe, or bakery. Start with busy days, lock opens and closes, publish early, and keep every swap in one place.'

const DOL_RECORDKEEPING = 'https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping'

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  type: 'article',
  publishedTime: PUBLISHED,
  authors: [SITE.name],
})

export default function WeeklyStaffScheduleGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}${PATH}`,
  }

  return (
    <>
      <JsonLd data={articleSchema} />

      <article>
        <header>
          <Container className="pb-12 pt-10 sm:pt-16">
            <div className="flex flex-col items-start">
              <Label>Guide</Label>
              <h1 className="mt-5 max-w-4xl text-huge text-balance">{TITLE}</h1>
              <p className="mt-6 max-w-text text-body text-grey">
                A weekly staff schedule is the plan for who does the work. For a restaurant, a cafe,
                or a bakery, build it from the busy days, lock the opens and closes, and share one
                copy the team can plan around.
              </p>
              <p className="mt-6 text-small text-grey">
                <time dateTime={PUBLISHED}>{formatDate(PUBLISHED)}</time>
              </p>
            </div>
          </Container>
        </header>

        <Container className="pb-20 sm:pb-28">
          <div className="border-t border-line pt-12">
            <div className="prose-rescommand">
              <h2>Start from your busy days</h2>
              <p>
                A blank week invites you to fill Monday first and copy it across. That is the long
                way. Start with the days that fall apart when you are short.
              </p>
              <p>
                You already know which days those are. A bakery feels it when the case is not ready.
                A cafe feels it in the rush that carries the day. A restaurant feels it on the
                service you cannot run thin. Your POS shows the same pattern in sales: which hours
                were busy, and which hours were quiet. Use your own weeks, not a template copied
                from another shop.
              </p>
              <p>
                Write the busy stretches down before you write names. For each one, note how many
                people you need and which jobs have to be covered. A Saturday that needs someone on
                production, someone on the counter, and someone who can close is a different day
                from a quiet Tuesday.
              </p>
              <p>
                Staff the rest of the week around those days. A slow day does not need the same crew
                as your busiest one. If you have to cut hours, cut the quiet stretch before you cut
                the one that already runs tight.
              </p>

              <h2>Lock coverage for opens and closes</h2>
              <p>
                The middle of a shift is easier to patch than the start or the end. Someone has to
                begin the work before you unlock the door. Someone has to finish it after the last
                guest leaves. Those are different jobs, and they need people who know them.
              </p>
              <p>
                In a bakery, the first person in is often there to produce, not only to unlock the
                door. In a cafe or a restaurant, the opener sets the place up for service and the
                closer shuts it down. Do not leave those shifts as whatever is left after you fill
                the rush.
              </p>
              <p>
                Put a name on every open and every close before you fill the hours in between. If
                only one person can open, that person is the constraint. Schedule them first.
                Everyone else fits around that.
              </p>
              <p>
                Then read the join between days. If the same person closes and opens the next
                morning, decide now whether that is realistic. It is harder to unwind after you
                have published.
              </p>

              <h2>Publish early so the team can plan</h2>
              <p>
                People on your team fit this week around the rest of their life. Childcare, a class,
                another job, a day they already promised someone. A schedule that shows up the night
                before does not leave room for any of that.
              </p>
              <p>
                Pick a day you publish every week, and publish before the week starts. Leave time
                for someone to tell you about a real conflict while you can still move a shift. The
                habit matters as much as the amount of notice. When the team knows which day the
                schedule comes out, they can plan for it.
              </p>
              <p>
                Tell them where the current week lives, and keep that to one place. If you also send
                a photo, say that the photo is a copy and the live schedule is the one that counts.
              </p>

              <h2>Handle swaps and changes in one place</h2>
              <p>
                The week will change. Someone is sick. Two people want to trade. A private event
                lands on a day you expected to be quiet.
              </p>
              <p>
                Put the change on the schedule. The person giving up the shift, the person taking
                it, and the manager should all end up looking at the same week. A swap that lives
                only in a text is a second schedule. The screenshot on someone&rsquo;s phone is the
                one they will follow, and it is already wrong.
              </p>
              <p>
                Use one rule. A swap counts when it is on the schedule, and not before. You can see
                who is actually working. The team can see it too. You do not have to remember which
                thread said yes.
              </p>

              <h2>Keep the schedule out of the group text and off the paper</h2>
              <p>
                A group text feels fast, and it is a poor place to keep a schedule. The update
                scrolls away. The person who was off that day never sees it. A new hire is not in
                the thread. Two people both say they can cover, and you still do not know who is on
                the shift.
              </p>
              <p>
                Paper on the wall goes stale the moment someone calls out. People photograph it and
                keep the old photo.
              </p>
              <p>
                Send a text that says the week is posted, if that is how your team hears news. Print
                a copy if a closer wants one in the office. Make the changes in the real schedule,
                not in the thread and not on the paper.
              </p>

              <h2>Build the week in this order</h2>
              <ol>
                <li>
                  Mark the busy days, and the busy stretches on those days. If you are unsure, check
                  your POS for the hours that carried recent weeks.
                </li>
                <li>Assign every open and every close to someone who can do that work.</li>
                <li>Fill the busy stretches next, with enough people who know the jobs.</li>
                <li>
                  Fill the quieter hours last. If you need to cut, cut there before you cut an open,
                  a close, or a rush.
                </li>
                <li>
                  Read each person&rsquo;s week. Look for a day off that disappeared, a shift they
                  cannot work, and a close followed straight by an open.
                </li>
                <li>
                  Publish one version, on your usual day. Tell the team this is the copy that
                  counts.
                </li>
                <li>When a shift changes, change it in that same place.</li>
              </ol>

              <h2>Read it once before you send it</h2>
              <p>Walk through one busy day and one quiet day before you publish.</p>
              <ul>
                <li>Who is first in, and do they know the opening work?</li>
                <li>Who covers the rush, including while someone steps off the floor?</li>
                <li>Who is last out, and can they close without waiting on a reply?</li>
                <li>
                  If one person calls out of the busiest stretch, who do you call, and are they
                  already scheduled for a full day?
                </li>
              </ul>
              <p>If you cannot answer one of those, fix the week before you send it.</p>

              <h2>A published schedule is not the hours record</h2>
              <p>
                The week you post tells people when to show up. It does not, by itself, record the
                hours they worked. In the United States, the Department of Labor&rsquo;s{' '}
                <a href={DOL_RECORDKEEPING}>Fact Sheet #21</a> describes one case: employees who work
                a fixed schedule and seldom vary from it. For that case, a covered employer may keep
                the scheduled daily and weekly hours and note that the worker followed the schedule.
                When someone works a longer or shorter time than the schedule shows, the employer has
                to record the hours actually worked.
              </p>
              <p>
                Restaurant, cafe, and bakery weeks change often, so do not treat the posted week as
                the time record. When a shift runs long or short, write down the hours that person
                actually worked. The fact sheet is general information, and some jobs are exempt, so
                read it against your own team.
              </p>

              <h2>How ResCommand helps</h2>
              <p>
                In ResCommand, you build the week and publish it. Staff get their shifts on their
                phone, with notifications. Employees see their own shifts. Managers see everyone.
              </p>
              <p>
                ResCommand has built-in team messaging, so a question about a swap can stay there
                instead of in a separate group text. The change still belongs on the published week.
                That is the copy that counts.
              </p>
              <p>
                Opening, closing, and recurring checklists can be tied to a role or to a person. You
                can see who checked off what, and when. Tie the opening checklist to whoever opens,
                and the closing checklist to whoever closes.
              </p>
              <p>
                ResCommand installs on the phone home screen, next to the other apps your team
                already opens. More on scheduling is on the{' '}
                <a href="/features#team-scheduling">team scheduling</a> page.
              </p>
            </div>
          </div>
        </Container>
      </article>

      <CTASection
        title="Build the week and publish it"
        copy="Staff get their shifts on their phone, with notifications."
        primaryLabel="Get started"
        primaryHref={`${SITE.appUrl}/signup`}
      />
    </>
  )
}
