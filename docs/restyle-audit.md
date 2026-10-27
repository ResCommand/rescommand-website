# Ink-and-paper restyle — audit of the live site

Audited against the live site at rescommand.com (deployment of commit `ead3f76`), October 27, 2026.
Screenshots of every page at 390px and 1440px are in `screenshots/before/` next to this repo.

## Rule 1 — ink on paper

- Whole site is dark: `bg-primary-navy` (#0C1D17) on every page, with `primary-panel` (#13271E) and `primary-deep` (#1B3A2D) alternating section bands (`Section background="navy|panel|deep"`).
- Light text on dark: `text-ink` (#EAF2F8) and `text-muted` (#8DA4B8) everywhere.
- Decorative dot grid (`.bg-grid`, radial-gradient) on the hero, every `PageHero`, the CTA band, image placeholders, blog thumbnails, the video placeholder and the 404 page.
- Blurred sky-blue glow orb behind the hero (`Hero.tsx`, `bg-accent-sky/10 blur-3xl`).
- Gold (`accent-gold`) "Most popular" badge on pricing; gold in the logo mark.
- Green/amber/red status colors used decoratively: checkmarks in pricing, feature bullets and the comparison table (`text-semantic-success`); the fake dashboard's tiles and traffic-light window dots.
- Colored icon tiles: problem cards, feature cards, feature detail blocks (`bg-primary-deep text-accent-sky` squares holding lucide icons).
- Stock-style decorative icons: quote marks on testimonials, image icon in placeholders, user/calendar/clock icons in post bylines, mail icon in the footer.

## Rule 2 — one signal color, only on clickable things

- Sky blue (#6BB3DE) is used decoratively: every eyebrow label, the hero pill, icon tiles, the "Operator" column header and price in the comparison table, stat values on About, blog thumbnail "RC" letters, the hero logo mark, testimonial initials, accordion chevrons, the blockquote rule in blog posts.
- More than one filled button per section: the hero has a filled button plus a link (fine), but the pricing preview has a filled "Start Free Trial" in each card plus a secondary bordered button; the 404 page has two buttons.
- Secondary buttons are a second blue treatment (`border-2 border-accent-sky bg-primary-panel`).

## Rule 3 — one huge line per section, no in-between sizes

- Six heading sizes in the scale (64/56/48/40/36/32/28px) and all are in use. Section heads are 36–48px, card titles 28–32px, so there is no clear jump between the headline and everything else.
- Headlines are set in Young Serif (single weight) at a loose 1.1–1.3 line height and normal tracking.
- Problem, feature, testimonial, philosophy and pricing cards each carry their own mid-size heading.

## Rule 4 — layered hero

- No layered background phrase. The hero leads with a 128px radar icon, then a pill badge, then the headline.

## Rule 5 — space and restraint

- Boxes and shadows everywhere: `Card`, `rounded-xl ... shadow-md` on problem, feature, testimonial, pricing, about-stat and philosophy cards, form, accordion, comparison table and blog cards.
- Hover lift (`hover:-translate-y-1`) and glow shadows (`shadow-sky-md`) on cards and buttons.
- 12–16px radius on cards and pills (`rounded-xl`, `rounded-full`).
- Text runs to 720–768px measure in places; hero copy sits in a half-width column.

## Rule 6 — real product, not art

- Hero product shot is a hand-drawn CSS dashboard (`DashboardMockup.tsx`) with made-up numbers ("8 / 8 shifts", "74% prep done"), not an app screenshot.
- Every other product slot is an empty grey box: four feature screenshots, the Duffers photo, the About photo, every blog featured image.

## Rule 7 — mobile first

- 390px: no horizontal overflow, but the hero headline runs 6 lines at 48px and the "Book a Demo" button starts 793px down, below the first screen on a 390×844 phone.
- Header logo is 48px tall; the only mobile header action is the menu button.
- The blog category filter pills are 42px tall (under the 44px tap target).

## Typography

- Two families: Young Serif (display) and Instrument Sans (body) in four weights (400/500/600/700).
- Italics in blog blockquotes; all-caps on every eyebrow label and badge.

## Missing

- No link to the app. `SITE.appUrl` (https://app.rescommand.com) is defined in `lib/constants.ts` but never used.

## Content flags (not changed — needs a decision)

- Two of the three testimonials are placeholders: "Sample Owner" and "Sample Manager". This restyle hides them (`placeholder: true` in `lib/content.ts`); only Catherine Williamson's quote shows.
- `/privacy` and `/terms` publicly say "This is placeholder legal text provided for layout purposes. Replace it ... before launch."
- The demo video sections show "Video coming soon" (home and /demo) because no YouTube ID is set.
- About → "The Team" says "Full team bios coming soon."
- Footer copyright is hard-coded to 2025.
