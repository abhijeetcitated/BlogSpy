import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy - BlogSpy',
  description: 'Privacy Policy for BlogSpy - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              BlogSpy
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-4">
        <article className="container max-w-3xl prose prose-slate dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: December 1, 2024</p>

          <p>
            At BlogSpy ("we", "our", or "us"), we take your privacy seriously. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our 
            website and services.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>We may collect personal information that you provide directly to us, including:</p>
          <ul>
            <li>Name and email address when you create an account</li>
            <li>Payment information when you subscribe to a paid plan</li>
            <li>Profile information you choose to provide</li>
            <li>Communications you send to us</li>
          </ul>

          <h3>Usage Information</h3>
          <p>We automatically collect certain information when you use our services:</p>
          <ul>
            <li>Log data (IP address, browser type, pages visited)</li>
            <li>Device information (device type, operating system)</li>
            <li>Usage patterns and feature interactions</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Monitor and analyze trends and usage</li>
            <li>Detect and prevent fraud and abuse</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Professional advisors (lawyers, accountants)</li>
            <li>Law enforcement when required by law</li>
            <li>Business partners with your consent</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your 
            personal information against unauthorized access, alteration, disclosure, or destruction. 
            However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services 
            and fulfill the purposes described in this policy. When you delete your account, we 
            will delete or anonymize your personal information within 30 days.
          </p>

          <h2>Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information and improve our services. 
            You can control cookies through your browser settings. Disabling cookies may affect 
            the functionality of our services.
          </p>

          <h2>Children's Privacy</h2>
          <p>
            Our services are not directed to children under 16. We do not knowingly collect 
            personal information from children. If you believe we have collected information 
            from a child, please contact us.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your 
            country of residence. We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@blogspy.io</li>
            <li>Address: BlogSpy Inc., San Francisco, CA 94105</li>
          </ul>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 BlogSpy. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
