import type { Metadata } from 'next'
import { LegalLayout } from '@/components/ui/LegalLayout'
import { SITE } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Terms of Service',
    description: 'The terms that govern your use of the ResCommand website and services.',
    path: '/terms',
  }),
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="June 2025">
      <h2>Agreement to Terms</h2>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the ResCommand
        website and services. By accessing or using our services, you agree to be bound by these
        Terms.
      </p>

      <h2>Use of the Service</h2>
      <p>
        You agree to use the service only for lawful purposes and in accordance with these Terms. You
        are responsible for maintaining the confidentiality of your account credentials and for all
        activity that occurs under your account.
      </p>

      <h2>Subscriptions and Billing</h2>
      <ul>
        <li>Paid plans are billed in advance on a recurring basis.</li>
        <li>Free trials convert to paid plans unless cancelled before the trial ends.</li>
        <li>You may cancel at any time; cancellation takes effect at the end of the billing period.</li>
        <li>There are no setup fees or long-term contracts.</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        The service and its original content, features, and functionality are owned by ResCommand and
        are protected by applicable intellectual property laws. Your data remains yours.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties
        of any kind, whether express or implied, to the fullest extent permitted by law.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, ResCommand shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising out of your use of the
        service.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the service after changes take
        effect constitutes acceptance of the revised Terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </LegalLayout>
  )
}
