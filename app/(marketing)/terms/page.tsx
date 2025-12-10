import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms of Service - BlogSpy',
  description: 'Terms of Service for BlogSpy - The rules and guidelines for using our platform.',
};

export default function TermsPage() {
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
          <h1>Terms of Service</h1>
          <p className="lead">Last updated: December 1, 2024</p>

          <p>
            Welcome to BlogSpy. These Terms of Service ("Terms") govern your access to and use of 
            our website, products, and services ("Services"). Please read these Terms carefully 
            before using our Services.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our Services, you agree to be bound by these Terms and our 
            Privacy Policy. If you do not agree to these Terms, you may not use our Services.
          </p>

          <h2>2. Description of Services</h2>
          <p>
            BlogSpy provides AI-powered SEO tools including keyword research, rank tracking, 
            content analysis, and AI-assisted content creation. We reserve the right to modify, 
            suspend, or discontinue any part of our Services at any time.
          </p>

          <h2>3. Account Registration</h2>
          <p>To use certain features of our Services, you must register for an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update any changes to your information</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h2>4. Subscription and Billing</h2>
          <h3>4.1 Paid Plans</h3>
          <p>
            Some features require a paid subscription. By subscribing, you agree to pay all 
            applicable fees. Subscriptions automatically renew unless cancelled before the 
            renewal date.
          </p>
          
          <h3>4.2 Free Trial</h3>
          <p>
            We may offer free trials. At the end of the trial period, you will be automatically 
            charged unless you cancel before the trial ends.
          </p>
          
          <h3>4.3 Refunds</h3>
          <p>
            We offer a 30-day money-back guarantee on all paid plans. After 30 days, payments 
            are non-refundable except where required by law.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit malware or harmful code</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use our Services for spam or unsolicited communications</li>
            <li>Resell or redistribute our Services without permission</li>
            <li>Use automated tools to scrape or collect data</li>
            <li>Interfere with the proper functioning of our Services</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <h3>6.1 Our Content</h3>
          <p>
            All content, features, and functionality of our Services are owned by BlogSpy and 
            protected by intellectual property laws. You may not copy, modify, or distribute 
            our content without permission.
          </p>
          
          <h3>6.2 Your Content</h3>
          <p>
            You retain ownership of content you create using our Services. By using our Services, 
            you grant us a license to use, store, and process your content to provide our Services.
          </p>

          <h2>7. AI-Generated Content</h2>
          <p>
            Our AI Writer generates content based on your inputs. You are responsible for reviewing 
            and editing AI-generated content before use. We do not guarantee the accuracy, 
            completeness, or originality of AI-generated content.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>
            Our Services may integrate with third-party services. We are not responsible for the 
            availability, accuracy, or practices of third-party services. Your use of third-party 
            services is governed by their respective terms.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
            WE DO NOT GUARANTEE THAT OUR SERVICES WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLOGSPY SHALL NOT BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR 
            SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS 
            PRECEDING THE CLAIM.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold BlogSpy harmless from any claims, damages, or expenses 
            arising from your use of our Services or violation of these Terms.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violation of these Terms. 
            Upon termination, your right to use our Services will immediately cease. Provisions 
            that by their nature should survive termination shall remain in effect.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of material changes via 
            email or through our Services. Your continued use of our Services after changes 
            become effective constitutes acceptance of the new Terms.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of California, without regard to 
            its conflict of law provisions. Any disputes shall be resolved in the courts of 
            San Francisco County, California.
          </p>

          <h2>15. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul>
            <li>Email: legal@blogspy.io</li>
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
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
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
