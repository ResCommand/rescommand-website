import type { Metadata } from 'next'
import { LegalLayout } from '@/components/ui/LegalLayout'
import { SITE } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Privacy Policy',
    description: 'How ResCommand collects, uses, and protects your information.',
    path: '/privacy',
  }),
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 2025">
      <h2>Introduction</h2>
      <p>
        ResCommand (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy.
        This Privacy Policy explains what information we collect, how we use it, and the choices you
        have. By using our website and services, you agree to the practices described here.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect information you provide directly and information collected automatically:</p>
      <ul>
        <li>
          <strong>Information you provide:</strong> contact details submitted through demo requests
          or support inquiries, such as your name, email, and restaurant name.
        </li>
        <li>
          <strong>Usage data:</strong> pages visited, links clicked, and similar analytics collected
          to improve the site.
        </li>
        <li>
          <strong>Cookies:</strong> small files used to remember preferences and measure traffic.
        </li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Respond to demo requests and support questions.</li>
        <li>Provide, maintain, and improve our services.</li>
        <li>Send service-related communications you have requested.</li>
        <li>Understand how the site is used and improve its performance.</li>
      </ul>

      <h2>Sharing of Information</h2>
      <p>
        We do not sell your personal information. We may share it with service providers who help us
        operate the site and services, and where required by law.
      </p>

      <h2>Data Security</h2>
      <p>
        We use reasonable administrative, technical, and physical safeguards to protect your
        information. No method of transmission or storage is completely secure, however, and we
        cannot guarantee absolute security.
      </p>

      <h2>Your Choices</h2>
      <p>
        You may request access to, correction of, or deletion of your personal information by
        contacting us. You can also opt out of non-essential communications at any time.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about this policy? Email us at{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </LegalLayout>
  )
}
