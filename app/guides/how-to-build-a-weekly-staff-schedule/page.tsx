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
const TITLE = 'How to Build and Share a Weekly Staff Schedule'
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
                A blank week tempts you to fill Monday first and copy it across. That&rsquo;s the
                long way. Start with the days that go wrong when you&rsquo;re short.
              </p>
              <p>
                You already know which days those are. A bakery feels it when product isn&rsquo;t
                ready at open. A cafe feels it in the morning rush. A restaurant feels it on the
                service you can&rsquo;t run thin. Your POS shows the same pattern in sales: which
                hours were busy, and which hours were quiet. Use your own weeks, not a template
                copied from another shop.
              </p>
              <p>
                Write the busy stretches down before you write names. For each one, note how many
                people you need and which jobs have to be covered. A Saturday that needs someone on
                production, someone on the counter, and someone who can close is a different day
                from a quiet Tuesday.
              </p>
              <p>
                Staff the rest of the week around those days. A slow day doesn&rsquo;t need the same
                crew as your busiest one. If you have to cut hours, cut the quiet stretch before you
                cut the one that&rsquo;s already short on people.
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
                closer shuts it down. Don&rsquo;t leave those shifts as whatever is left after you
                fill the rush.
              </p>
              <p>
                Put a name on every open and every close before you fill the hours in between. If
                only one person can open, schedule that person first and fit everyone else around
                them.
              </p>
              <p>
                Then check the turnaround between days. If the same person closes and opens the next
                morning, decide now whether that&rsquo;s realistic. It&rsquo;s harder to change after
                you&rsquo;ve published.
              </p>

              <h2>Publish early so the team can plan</h2>
              <p>
                People on your team fit this week around the rest of their life, including
                childcare, a class, another job, or a day they already promised someone. A schedule
                that shows up the night before doesn&rsquo;t leave room for any of that.
              </p>
              <p>
                Pick a day you publish every week, and publish before the week starts. Leave time
                for someone to tell you about a real conflict while you can still move a shift.
                Publishing on the same day each week matters as much as how much notice you give.
                When the team knows which day the schedule comes out, they can plan for it.
              </p>
              <p>
                Tell them where the current week lives, and keep that to one place. If you also send
                a photo, tell them the photo can go out of date and they should follow the live
                schedule.
              </p>

              <h2>Handle swaps and changes in one place</h2>
              <p>
                The week will change. Someone gets sick, two people want to trade, or a private
                event gets booked on a day you expected to be quiet.
              </p>
              <p>
                Put the change on the schedule. The person giving up the shift, the person taking
                it, and the manager should all end up looking at the same week. A swap that lives
                only in a message thread is a second schedule. The screenshot on someone&rsquo;s
                phone is the one they&rsquo;ll follow, and it&rsquo;s already wrong.
              </p>
              <p>
                A swap counts when it&rsquo;s on the schedule, and not before. Then you can see
                who&rsquo;s actually working, and the team can see it too. You don&rsquo;t have to
                remember which thread said yes.
              </p>
              <p>
                Staff can request time off or a swap in the app. A manager approves it from one
                place, and approved time off clears those shifts. Regular weekly shifts can repeat
                on their own.
              </p>

              <h2>Keep the schedule out of the group text and off the paper</h2>
              <p>
                A group text is quick to send, and it&rsquo;s a poor place to keep a schedule.
                Updates get buried, the person who was off that day never sees them, and a new hire
                isn&rsquo;t in the thread. Two people can both say they&rsquo;ll cover, and you still
                don&rsquo;t know who&rsquo;s on the shift.
              </p>
              <p>
                Paper on the wall is out of date the moment someone calls out. People photograph it
                and keep the old photo.
              </p>
              <p>
                You can tell them the week is posted in the group text, if that&rsquo;s how your team
                hears news. Print a copy if a closer wants one in the office. Make the changes in
                the real schedule, not in the thread and not on the paper.
              </p>

              <h2>Build the week in this order</h2>
              <ol>
                <li>
                  Mark the busy days, and the busy stretches on those days. If you&rsquo;re unsure,
                  check your POS for your busiest hours in recent weeks.
                </li>
                <li>Assign every open and every close to someone who can do that work.</li>
                <li>Fill the busy stretches next, with enough people who know the jobs.</li>
                <li>
                  Fill the quieter hours last. If you need to cut, cut there before you cut an open,
                  a close, or a rush.
                </li>
                <li>
                  Read each person&rsquo;s week. Look for a day off that disappeared, a shift they
                  can&rsquo;t work, and a close followed straight by an open.
                </li>
                <li>
                  Publish one version, on your usual day. Tell the team this is the schedule to
                  follow.
                </li>
                <li>When a shift changes, change it in that same place.</li>
              </ol>

              <h2>Read it once before you send it</h2>
              <p>Walk through one busy day and one quiet day before you publish.</p>
              <ul>
                <li>Who&rsquo;s first in, and do they know the opening work?</li>
                <li>Who covers the rush, including while someone steps off the floor?</li>
                <li>Who&rsquo;s last out, and can they close without waiting on a reply?</li>
                <li>
                  If one person calls out of the busiest stretch, who do you call, and are they
                  already scheduled for a full day?
                </li>
              </ul>
              <p>If you can&rsquo;t answer one of those, fix the week before you send it.</p>

              <h2>A published schedule isn&rsquo;t the hours record</h2>
              <p>
                The week you post tells people when to show up. It doesn&rsquo;t, by itself, record
                the hours they worked. In the United States, the Department of Labor&rsquo;s{' '}
                <a href={DOL_RECORDKEEPING}>Fact Sheet #21</a> describes one case: employees who work
                a fixed schedule and seldom vary from it. For that case, a covered employer may keep
                the scheduled daily and weekly hours and note that the worker followed the schedule.
                When someone works a longer or shorter time than the schedule shows, the employer has
                to record the hours actually worked.
              </p>
              <p>
                Restaurant, cafe, and bakery weeks change often, so don&rsquo;t treat the posted week
                as the time record. When a shift runs long or short, write down the hours that person
                actually worked. The fact sheet is general information, and some jobs are exempt, so
                read it against your own team.
              </p>

              <h2>How ResCommand helps</h2>
              <p>
                In ResCommand, you build the week and publish it. Staff get an in-app notice and an
                email with their changes, and phone notifications are supported. Employees see
                who&rsquo;s working, with their own shifts highlighted, and they can&rsquo;t edit.
                Managers see and edit everyone.
              </p>
              <p>
                ResCommand has built-in team messaging, so a question about a swap can stay there
                instead of in a separate group text. The change still belongs on the published week.
              </p>
              <p>
                Daily opening and closing checklists can be tied to a role or to a person. You can
                see who checked off what. Tie the opening checklist to whoever opens, and the closing
                checklist to whoever closes.
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
        copy="Staff get an in-app notice and an email with their changes."
        primaryLabel="Get started"
        primaryHref={`${SITE.appUrl}/signup`}
      />
    </>
  )
}
