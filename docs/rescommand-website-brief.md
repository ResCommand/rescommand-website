# ResCommand Marketing Website Brief
## Complete Specification for Claude Code Build

**Domain:** rescommand.com  
**App URL:** app.rescommand.com  
**Host:** Vercel + GitHub  
**Tech Stack:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS  
**Deployment:** GitHub → Vercel auto-deploy  

---

## BRAND DIRECTION

### Identity
- **Product Name:** ResCommand (lowercase, no "the")
- **Company:** Built by Venturio Studios (small footer mention, not prominent)
- **Target Audience:** Owner-operators of small restaurants, coffee shops, donut shops, bakeries (1–5 locations)
- **Positioning:** "Everything a restaurant team needs to run like a big operation"
- **Design Inheritance:** Scramblers Golf aesthetic (dark, moody, precise)

### Design System (Scramblers Adapted)

**Color Palette:**
```
Primary Navy:     #010D17 (darkest backgrounds)
Panel Navy:       #071A2C (card backgrounds, sections)
Deep Panel:       #0C2740 (alternate sections, depth)
Sky Blue Accent:  #6BB3DE (CTAs, highlights, interactive)
Bright Sky:       #9AD0F0 (hover states, secondary accents)
Ink/Text:         #EAF2F8 (primary text, high contrast)
Muted:            #8DA4B8 (secondary text, labels, metadata)
Success Green:    #2D8659 (confirmation, positive states)
Warning Amber:    #D97706 (alerts, cautions)
Error Red:        #DC2626 (errors, destructive actions)
```

**Typography:**
- **Display Font:** Fraunces (serif, bold weights for headlines)
- **Body Font:** Hanken Grotesk (sans-serif, all body text and UI)
- **Scale:** 
  - Hero H1: 56–64px (Fraunces Bold)
  - H2: 40–48px (Fraunces Bold)
  - H3: 32–36px (Fraunces SemiBold)
  - Body: 16–18px (Hanken Regular)
  - Small: 12–14px (Hanken Regular)

**Spacing & Layout:**
- Base unit: 8px (all spacing multiples of 8)
- Container max-width: 1280px
- Grid: 12-column on desktop, 6-column on tablet, 1-column on mobile
- Gutter: 24px (desktop), 16px (tablet), 12px (mobile)

**Component Style:**
- No warm tones (no gold, brass, warm orange)
- High contrast for readability
- Subtle shadows only (`0 4px 12px rgba(0,0,0,0.15)`)
- Smooth transitions (300ms ease-in-out)
- Hover states: brighten sky blue or add subtle shadow

---

## SITE ARCHITECTURE

### Page Hierarchy

```
rescommand.com/
├── /                          (Homepage / Hero)
├── /features                  (Feature showcase)
├── /pricing                   (Pricing plans)
├── /demo                      (Demo booking + video intro)
├── /blog                      (Blog landing + individual posts)
├── /about                     (Why we built this, team story)
├── /help                      (FAQ, docs links)
├── /privacy                   (Privacy policy)
└── /terms                     (Terms of service)
```

### Navigation Model
- **Primary Nav:** Features, Pricing, Demo, Blog, Help
- **CTA Button:** "Book a Demo" (always visible, right side of nav)
- **Footer:** Quick links, contact, privacy/terms, Venturio credit

---

## HOMEPAGE / HERO

**Goal:** Capture problem, introduce solution, convert to demo or waitlist

### Sections

#### 1. Hero (Full Screen)
```
Headline:        "Everything Your Restaurant Team Needs to Run Like the Big Guys"
Subheadline:     "One app for scheduling, inventory, recipes, prep, compliance. Built for small restaurants. Priced for them, too."
Hero Image:      Mockup of ResCommand dashboard or Duffers Donuts operation photo
CTA Button:      "Book a Demo" (Sky Blue #6BB3DE)
Secondary CTA:   "Watch 2-min demo" (text link, links to /demo)

Background:      Primary Navy #010D17
Accent:          Sky Blue panel on right side with mockup
```

#### 2. Problem Section (3 columns)
```
Headline:        "The Problem Every Small Restaurant Faces"

Column 1:
Icon:            Clock icon (team scheduling chaos)
Title:           "Scheduling Chaos"
Copy:            "Spreadsheets, group texts, last-minute no-shows. Your best staff is in 5 different scheduling apps."
Color:           Panel Navy #071A2C

Column 2:
Icon:            TrendingDown icon (food costs)
Title:           "Food Cost Bleeding"
Copy:            "You don't know if your prep is efficient. Par sheets are printed 6 months ago. Waste is silent."
Color:           Panel Navy #071A2C

Column 3:
Icon:            AlertCircle icon (compliance)
Title:           "Compliance Invisibility"
Copy:            "Cleaning logs, SOP adherence, temperature checks—scattered across people's memories."
Color:           Panel Navy #071A2C

Full Width Background: Deep Panel #0C2740
```

#### 3. Solution Section (Split Layout)
```
Left Side:
Headline:        "Built by operators, for operators"
Copy:            "ResCommand is built on real restaurant challenges. We started with Duffers Donuts—a scratch-made donut shop in Charleston. Every feature comes from 'we need this to survive.' It's not feature-bloated enterprise software. It's the exact tools a small team actually uses."
Link:            "Read how Duffers uses ResCommand" (links to /about)

Right Side:
Image:           Screenshot of Duffers Donuts operation or ResCommand dashboard

Background:      Primary Navy #010D17, text in Ink #EAF2F8
```

#### 4. Core Features Grid (4 columns)
```
Headline:        "One App. Everything You Need."
Subheadline:     "No more scattered tools. No more chaos."

Cards (4 across, hover lift effect):
1. Team Scheduling
   Copy:         "Mobile-friendly schedule builder. Alerts, shifts, auto-assignments."
   Icon:         Calendar

2. Inventory & Par
   Copy:         "Real-time inventory levels vs. par sheets. Know what's running low."
   Icon:         Package

3. Recipes & Prep
   Copy:         "Standardized recipes, prep schedules, yield tracking."
   Icon:         UtensilsCrossed

4. Compliance
   Copy:         "Digital logs for cleaning, temps, SOPs. Built-in workflows."
   Icon:         CheckCircle

Card Style:      Panel Navy #071A2C, Sky Blue borders on hover
Background:      Primary Navy #010D17
```

#### 5. Dashboard Preview Section
```
Headline:        "See ResCommand in Action"
Copy:            "This is what your daily reality looks like:"
Media:           Large embedded YouTube video placeholder
Video Link:      `<iframe> placeholder for YouTube`
Play Button:     Sky Blue #6BB3DE overlay

Background:      Deep Panel #0C2740
```

#### 6. Social Proof / Testimonial (Placeholder)
```
Headline:        "Loved by restaurant teams"

3-column layout:
Card 1:
Quote:           "[Placeholder testimonial from Duffers Donuts or sample customer]"
Attribution:     "Chef Catherine Williamson, Duffers Donuts, Charleston SC"
Avatar:          Placeholder image
Background:      Panel Navy #071A2C

(Repeat for 3 cards)

Background:      Primary Navy #010D17
CTA:             "See more stories" (future link)
```

#### 7. Pricing Preview
```
Headline:        "Simple, Honest Pricing"
Copy:            "No surprise fees. Pay for what you use."

2-column layout:
Col 1:           Starter Plan (for 1 location)
Col 2:           Pro Plan (for multi-unit)

CTA:             "See full pricing" (links to /pricing)

Background:      Deep Panel #0C2740
Text:            Ink #EAF2F8
```

#### 8. Final CTA Section
```
Headline:        "Ready to Run Better?"
Copy:            "Let's see if ResCommand is right for you."
CTA Button:      "Book a Demo" (large, Sky Blue #6BB3DE)
Secondary:       "Explore features first" (text link → /features)

Background:      Primary Navy #010D17 with accent Sky Blue panel
```

---

## FEATURES PAGE

**Goal:** Deep dive into each capability with benefit language

### Structure
```
Hero Section:
Headline:        "Built for the Chaos You Know"
Subheadline:     "Every feature designed by restaurant operators for restaurant operators."

Then 4 detailed feature sections (expand-collapse or tabbed):
```

### Feature Sections (Each with image/screenshot + detailed copy)

**1. Team Scheduling**
- Problem → Solution → Benefit flow
- Screenshot: Schedule dashboard
- Bullet points: 
  - Drag-and-drop shift building
  - SMS alerts for schedule changes
  - Self-service availability picking
  - Overtime flagging
- CTA: "See demo" → /demo

**2. Inventory & Par Management**
- Problem → Solution → Benefit flow
- Screenshot: Inventory dashboard
- Bullet points:
  - Live stock levels
  - Par sheet comparison
  - Usage trending
  - Low-stock alerts
- CTA: "See demo" → /demo

**3. Recipes, Prep & Yield**
- Problem → Solution → Benefit flow
- Screenshot: Recipe/prep interface
- Bullet points:
  - Standardized recipes
  - Prep scheduling
  - Yield tracking
  - Batch documentation
- CTA: "See demo" → /demo

**4. Compliance & Documentation**
- Problem → Solution → Benefit flow
- Screenshot: Compliance logs
- Bullet points:
  - Temperature logs
  - Cleaning checklists
  - SOP tracking
  - Audit-ready documentation
- CTA: "See demo" → /demo

**Bottom CTA:** "Ready to see it in action?" → Book Demo button

---

## PRICING PAGE

**Goal:** Make pricing transparent, remove friction

### Structure

**Hero:**
```
Headline:        "Pricing That Grows With You"
Subheadline:     "No setup fees. No contracts. Cancel anytime."
```

**Pricing Table (2 tiers minimum, simple layout):**

| Feature | Starter | Pro |
|---------|---------|-----|
| Locations | 1 | Up to 5 |
| Team Members | Up to 10 | Unlimited |
| Scheduling | ✓ | ✓ |
| Inventory | ✓ | ✓ |
| Recipes & Prep | ✓ | ✓ |
| Compliance Logs | ✓ | ✓ |
| API Access | — | ✓ |
| Priority Support | — | ✓ |
| **Price** | **$199/mo** | **$499/mo** |
| **CTA** | "Start Free Trial" | "Start Free Trial" |

**Each tier card:**
- Panel Navy #071A2C background
- Sky Blue border and CTA button
- Checkmarks in Success Green #2D8659
- Crossed items in Muted #8DA4B8

**FAQ Section (below pricing):**
```
Headline:        "Questions?"

Accordion items:
- What's included in the free trial?
- Can I change plans anytime?
- Do you offer discounts for annual billing?
- Is there a setup fee?
- What if I need more than 5 locations?
- Do you have an API?

(Keep copy short, link to /help for detailed answers)
```

**Final CTA:**
```
Headline:        "Start Today."
Copy:            "Try ResCommand free for 14 days."
Button:          "Start Your Free Trial" (Sky Blue)
```

---

## DEMO BOOKING PAGE

**Goal:** Capture demo request + introduce product via video

### Structure

**Left Side (60%): Booking Form**
```
Headline:        "Let's See If ResCommand is Right for You"
Subheadline:     "Book a 20-minute demo with our team. No pressure."

Form Fields (Calendly embed or custom form):
- First Name (required)
- Last Name (required)
- Email (required)
- Restaurant Name (required)
- Number of Locations (dropdown: 1, 2-3, 4-5, 5+)
- Pain Point (dropdown: Scheduling, Food Cost, Compliance, Other)
- Message (optional textarea)
- [Submit] button

Calendly Integration:
`<Calendly inline widget embed>`

Form Background:      Panel Navy #071A2C
Submit Button:        Sky Blue #6BB3DE
```

**Right Side (40%): Video Intro**
```
Headline:        "See It in Action First"
Subheadline:     "2-minute product walkthrough"

YouTube Embed Placeholder:
`<div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center">
  <div className="text-center">
    <Play icon (Sky Blue)
    "Product Demo Video" (text link to YouTube)
  </div>
</div>`

Fallback text:   "Can't watch now? We'll show you everything in the demo."
```

**Mobile Layout:** Stack vertically, form first, then video

---

## BLOG PAGE

**Goal:** Build SEO, establish thought leadership, keep visitors coming back

### Blog Landing

**Hero:**
```
Headline:        "Restaurant Operations Tips & Insights"
Subheadline:     "Practical guides for restaurant owners and teams."
```

**Filter/Sort:**
- All Posts (default)
- Scheduling
- Food Cost
- Compliance
- Operations

**Blog Grid:**
```
Each post card (3 columns, responsive):
- Thumbnail image placeholder
- Category tag (Sky Blue background)
- Title (Fraunces, 20px)
- Excerpt (100 words max)
- Author (optional)
- Published date (Muted text)
- Read time (e.g., "5 min read")
- "Read More" link (text link)

Hover state: card lifts, thumbnail brightens
```

**CTA at bottom:** "Subscribe to updates" (email signup, optional)

### Blog Post Template

**Meta:**
```
Title:           H1, Fraunces, 48px
Published Date:  Muted #8DA4B8, 14px
Author:          "ResCommand Team" (or name if known)
Read Time:       "X min read"
Category:        Tag (Sky Blue background, white text)
```

**Content:**
```
Featured Image:  Placeholder image (1200x600px)
Body Copy:       Markdown rendered with:
                 - H2: 36px Fraunces
                 - H3: 28px Fraunces
                 - Body: 18px Hanken
                 - Line height: 1.8
                 - Max-width: 720px (for readability)
                 - Images embedded full-width
                 - Code blocks with syntax highlight
```

**Related Posts:** 3-column grid at bottom linking to similar posts

**CTA at bottom:** "Ready to try ResCommand?" → Book Demo button

### Blog Post Placeholders (at launch)
```
Post 1: "How to Cut Food Costs Without Cutting Quality"
- Category: Food Cost
- Excerpt: Practical tips for inventory and par sheet management
- Date: [Placeholder - to be filled]

Post 2: "Your Team Wants to Love Their Schedule"
- Category: Scheduling
- Excerpt: Why flexible scheduling reduces no-shows and turnover
- Date: [Placeholder - to be filled]

Post 3: "Compliance Doesn't Have to Be a Nightmare"
- Category: Compliance
- Excerpt: Digital logs, automation, and staying audit-ready
- Date: [Placeholder - to be filled]

Post 4: "From Duffers Donuts: How We Standardized Our Recipes"
- Category: Operations
- Excerpt: Case study on recipe documentation and consistency
- Date: [Placeholder - to be filled]

Post 5: "The True Cost of Manual Scheduling"
- Category: Scheduling
- Excerpt: Labor math, turnover impact, and how software changes that
- Date: [Placeholder - to be filled]
```

---

## ABOUT PAGE

**Goal:** Build trust, show origin story, explain philosophy

### Structure

**Hero Section:**
```
Headline:        "Built by Operators, for Operators"
Subheadline:     "ResCommand came from real restaurant chaos."
```

**The Origin Story (split layout):**

**Left Text:**
```
Copy:
"ResCommand wasn't born from a boardroom. It came from Duffers Donuts—a scratch-made donut shop in Charleston, South Carolina.

Catherine Williamson, our head baker, was juggling recipes in notebooks. The team was scattered across text messages. Prep schedules were printed yesterday, now outdated. We watched the chaos and decided: there has to be a better way.

We built ResCommand as the operating system our restaurant needed. Every feature answered a real question: 'How do we stop the bleeding here?' Not features we thought restaurants should want. Features restaurants are already trying to use in ten different tools."

Key Stats (callout boxes, Sky Blue background):
- 1 donut shop
- 4+ operations challenges solved
- 0 enterprise bloat
- ∞ sanity preserved
```

**Right Image:**
```
Photo:  Duffers Donuts kitchen, team photo, or operation shot
```

**Philosophy Section (full width):**

**Headline:** "Why We Do This"

**3-column narrative:**

Column 1: "Simple Doesn't Mean Stupid"
```
Copy:           "Small restaurants have the same compliance and operational rigor as big chains. We just don't have the staff to run five different tools. Everything in ResCommand is built for focus: do one thing, do it right."
```

Column 2: "Priced for Reality"
```
Copy:           "Enterprise software costs enterprise money. We price for a team of 5–50, not 500. You should never need a payment plan to manage your restaurant better."
```

Column 3: "Built to Last"
```
Copy:           "We don't chase hype features. We improve what matters: reliability, speed, and supporting the way you actually work."
```

**Team (optional, for future):**
```
Section heading: "The Team"
Copy:            "Placeholder: Team members and their roles. (To be filled when ready.)"
```

**CTA Bottom:**
```
Headline:        "Ready to Stop the Chaos?"
Button:          "Book a Demo" (Sky Blue)
```

---

## HELP / FAQ PAGE

**Goal:** Answer common questions, reduce support burden

### Structure

**Hero:**
```
Headline:        "How Can We Help?"
Subheadline:     "Answers to common questions about ResCommand."
```

**Accordion Sections:**

**Getting Started**
- How do I sign up?
- Is there a free trial?
- What does the onboarding process look like?
- Do you offer a demo first?

**Pricing & Billing**
- What's included in each plan?
- Can I change plans anytime?
- Do you offer annual discounts?
- What happens if I cancel?
- Do you have volume discounts for multi-unit operators?

**Features & Functionality**
- Can I import my current scheduling data?
- Is ResCommand mobile-friendly?
- Can I set up different user permissions?
- How do I add recipes to the system?
- Can I customize par sheets?

**Integration & API**
- Does ResCommand connect to other tools? (POS, accounting, etc.)
- Is there an API?
- Can I export my data?

**Support & Account**
- How do I contact support?
- What's your response time?
- Do you offer training?
- Can I change my account password?

**Styling:**
- Accordion headers: Fraunces, Sky Blue on hover
- Accordion body: Muted text, Panel Navy background
- Links: Sky Blue, underlined on hover

**Bottom CTA:**
```
Headline:        "Still Have Questions?"
Copy:            "Reach out to our team. We're here to help."
Button:          "Email Support" (links to contact form or mailto)
```

---

## FOOTER

**Layout:**
```
4-column footer (stacks to 1-col on mobile):

Column 1: Product
- Features
- Pricing
- Blog
- Demo

Column 2: Company
- About
- Help / FAQ
- Privacy Policy
- Terms of Service

Column 3: Contact
- Email support link
- (optional) phone
- (optional) social links

Column 4: Built By
- "ResCommand is built by Venturio Studios"
- Venturio Studios link
- © [Year] ResCommand
```

**Footer Background:** Primary Navy #010D17  
**Text Color:** Ink #EAF2F8  
**Link Hover:** Sky Blue #6BB3DE

---

## TECHNICAL SPECIFICATIONS

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Modules
- **UI Components:** Headless UI or Radix UI (for accessibility)
- **Icons:** Lucide React
- **Blog:** 
  - Option A: MDX (markdown files in `/content/blog`)
  - Option B: Contentful CMS (optional, for future)
  - Option C: Notion API integration (optional)
- **Video Embedding:** YouTube embed (iframe placeholders)
- **Demo Booking:**
  - Google Calendar API integration (Calendly as fallback)
  - Form submission → email notification
- **Analytics:** Vercel Web Analytics (built-in) + Google Analytics 4
- **Forms:** React Hook Form + Zod validation
- **CMS/Blog Admin:** (For now, static MDX files; upgrade to Contentful/Prismic later)

### File Structure
```
rescommand/
├── app/
│   ├── layout.tsx              (Root layout, nav, footer)
│   ├── page.tsx                (Home)
│   ├── features/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── demo/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx            (Blog landing)
│   │   └── [slug]/
│   │       └── page.tsx        (Individual post)
│   ├── about/
│   │   └── page.tsx
│   ├── help/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   └── terms/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Nav.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── Testimonials.tsx
│   │   └── ... (one per section)
│   ├── features/
│   │   └── FeatureCard.tsx
│   ├── pricing/
│   │   └── PricingCard.tsx
│   ├── blog/
│   │   ├── PostCard.tsx
│   │   └── PostMeta.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── ... (reusable components)
├── content/
│   └── blog/
│       ├── post-1.mdx
│       ├── post-2.mdx
│       └── ... (one .mdx per blog post)
├── lib/
│   ├── blogMeta.ts
│   ├── constants.ts
│   └── utils.ts
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── features/
│   │   ├── testimonials/
│   │   └── ...
│   └── videos/               (Placeholder video thumbs)
├── styles/
│   ├── globals.css
│   └── theme.css
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── .env.example
```

### Key Integrations

**1. Google Calendar API (Demo Booking)**
```
Endpoint:        Google Calendar API
OAuth Flow:      Standard OAuth 2.0
What Happens:    User books → form submitted → Google Calendar event created → confirmation email
Fallback:        Calendly embed (if API too complex initially)
```

**2. Email Notifications**
```
Service:         SendGrid or Resend
Trigger:         New demo booking
Template:        "Demo Scheduled" confirmation to user
Copy:            Confirmation details, Zoom link (if applicable)
```

**3. Analytics**
```
Built-in:        Vercel Web Analytics (page views, traffic)
Optional:        Google Analytics 4 (goal tracking, demo bookings)
Tracking Goals:
- CTA clicks ("Book Demo")
- Demo form submissions
- Blog post reads
- Pricing page visits
```

### Performance & SEO

**SEO:**
- Metadata generation for all pages (Next.js `generateMetadata()`)
- Structured data (JSON-LD schema for Organization, LocalBusiness, FAQPage)
- Sitemap generation (`/sitemap.xml`)
- Robots.txt
- Open Graph tags for social sharing

**Performance:**
- Image optimization (Next.js Image component)
- Font loading (subset Latin, preload Fraunces + Hanken)
- Code splitting (lazy load heavy components)
- API route caching for blog metadata
- Vercel Edge Functions for fast routing

**Lighthouse Target:** 90+ Core Web Vitals

---

## COPYWRITING GUIDELINES

### Tone & Voice
- **Audience:** Owner-operators (busy, pragmatic, skeptical of vendor hype)
- **Tone:** Honest, practical, clear. No fluff, no overselling.
- **Key Words:** "Built for you," "Real operations," "No bloat," "Your team," "Easier," "Clearer," "Your job just got simpler."
- **Avoid:** Corporate jargon ("synergy," "leverage," "optimize"), generic software language, condescension

### Headline Principles
- Lead with benefit, not feature
- Use active voice
- Short, punchy (no more than 12 words for H1, 15 for H2)
- Speak to a specific pain point or desired state

### CTA Copy
- Primary: "Book a Demo" (consistent across site)
- Secondary: "Start Free Trial," "Explore Features," "Learn More"
- Never: "Submit," "Click here," "Enter"

### Feature Descriptions
Structure:
```
[Problem] → [How we solve it] → [What that means for you]

Example:
"Scheduling chaos → Drag-and-drop builder, SMS alerts, availability picking → Your team sees their schedule instantly, no more group texts."
```

---

## CONTENT INVENTORY

### Images Needed (Placeholder Locations)
```
Hero mockup or lifestyle:        1200x800px
Feature screenshots:             5 images, 1000x800px each
Duffers Donuts operation:        1200x800px (optional but powerful)
Team photo:                      (for About, if available)
Testimonial avatars:             150x150px, 3 avatars
Blog post featured images:       1200x600px per post
Blog thumbnails:                 400x250px per post
```

### Copy Deliverables Needed (Placeholder = to be written)
```
✓ Homepage headlines & copy (to be written)
✓ Features page deep-dives (to be written)
✓ Pricing page FAQ (to be written)
✓ About page origin story (to be written)
✓ Help page FAQ answers (to be written)
✓ 5 blog post outlines (to be written)
✓ Email templates for booking confirmation (to be written)
```

---

## LAUNCH CHECKLIST

### Pre-Launch (Week 1–2)

**Domain & DNS:**
- [ ] Domain registrar: rescommand.com transferred or confirmed
- [ ] DNS records: A record → Vercel IP
- [ ] SSL certificate: Auto-generated by Vercel

**Vercel Setup:**
- [ ] Create Vercel project
- [ ] Connect GitHub repo
- [ ] Configure environment variables (`.env.local`)
- [ ] Set up preview deployments
- [ ] Configure production domain

**Integrations:**
- [ ] Google Calendar API credentials (OAuth client ID/secret)
- [ ] SendGrid or Resend API key (for booking emails)
- [ ] Google Analytics 4 property ID
- [ ] (Optional) Calendly embed code

**Content:**
- [ ] Homepage copy finalized
- [ ] Features page copy + screenshots
- [ ] Pricing finalized
- [ ] Blog post placeholders created
- [ ] About page copy + team info
- [ ] FAQ copy finalized

**Analytics & Monitoring:**
- [ ] Vercel Web Analytics enabled
- [ ] Google Analytics configured
- [ ] Sentry or error tracking (optional)

### Launch Day

- [ ] Final QA on all pages (mobile + desktop)
- [ ] Test demo booking flow end-to-end
- [ ] Test email notifications
- [ ] Verify analytics tracking
- [ ] DNS propagation check
- [ ] Announce on LinkedIn (Kathryn, Shawn)
- [ ] Send to beta list (if applicable)

### Post-Launch (Week 1–4)

- [ ] Monitor analytics for traffic patterns
- [ ] Check email delivery for demo bookings
- [ ] Gather demo feedback, iterate
- [ ] Write first 2–3 blog posts
- [ ] Set up redirects for any old URLs (if applicable)
- [ ] Plan content calendar for next 30 days

---

## SUCCESS METRICS

### Traffic & Engagement
- Monthly unique visitors: Target 500+ (Month 1), 2,000+ (Month 3)
- Page views per visitor: Target 2.5+
- Time on site: Target 2+ minutes
- Bounce rate: Target <50%

### Conversion
- Demo bookings per month: Target 5+ (Month 1), 15+ (Month 3)
- Blog post engagement: Avg. 1+ min per post
- Email signup rate: (If newsletter, target 10%+)

### SEO
- Indexed pages: All 8+ pages in Google Search Console
- Avg. position (CTR) for "restaurant scheduling," "food cost," "compliance": Track and improve monthly
- Organic traffic: Target 100+ sessions/month by Month 3

---

## HANDOFF TO CLAUDE CODE

Claude Code will receive:
1. This brief (complete spec)
2. Design tokens (Tailwind config + CSS variables)
3. Content outline (copy structure, placeholders)
4. GitHub repo initialized with Next.js boilerplate
5. Deployment: Ready to push to Vercel on first commit

**Claude Code will build:**
✅ Full Next.js app with all pages
✅ Tailwind styling + Scramblers design system
✅ Blog infrastructure (MDX) with 5 placeholder posts
✅ Demo booking form + Google Calendar integration
✅ SEO setup (metadata, sitemap, schema)
✅ Responsive mobile + desktop layouts
✅ Analytics tracking (Vercel + GA4)
✅ Performance optimizations

**You will handle (post-build):**
📝 Final copywriting & personalization
📷 Image sourcing & optimization
🔗 Google Calendar API credential setup
📊 Analytics verification
🚀 Vercel deployment & DNS configuration
📧 Email template tuning

---

## NOTES FOR CLAUDE CODE

**Build Quality Standards:**
- Semantic HTML (proper heading hierarchy, ARIA labels)
- Mobile-first responsive design (test 320px, 768px, 1024px)
- Accessibility: WCAG 2.1 AA standard (keyboard nav, color contrast, form labels)
- Performance: Lazy load images, code split components
- TypeScript strict mode
- No console errors or warnings

**Design Integrity:**
- Stay true to Scramblers dark/moody aesthetic
- No deviation from color palette
- Use Fraunces + Hanken consistently
- Don't over-decorate; prioritize clarity
- Consistent spacing (8px grid)

**Code Quality:**
- Reusable components (DRY principle)
- Clear component naming
- Comments on complex sections
- Environment variables for API keys
- Error handling on form submissions

---

**Ready for Claude Code to build. Provide this brief + GitHub repo link when initiating.**
