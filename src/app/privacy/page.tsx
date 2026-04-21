import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">EidCard</Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            At EidCard, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email address</li>
            <li>Name (optional)</li>
            <li>Phone number (for Eid cards)</li>
            <li>Google account information (if you sign in with Google)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Card Content</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Custom messages you create</li>
            <li>Recipient names (optional)</li>
            <li>Selected themes and preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Automatically Collected</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Usage analytics and card view counts</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide and maintain our service</li>
            <li>Create and display your Eid cards</li>
            <li>Process payments through bKash</li>
            <li>Send important updates and notifications</li>
            <li>Improve our services and user experience</li>
            <li>Protect against fraud and abuse</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
          <p className="mb-4">
            Your data is stored securely using MongoDB database services. We implement industry-standard 
            security measures including encryption, access controls, and regular security audits to protect 
            your personal information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Third-Party Services</h2>
          <p className="mb-4">We use the following third-party services:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>bKash:</strong> For payment processing in Bangladesh</li>
            <li><strong>Google:</strong> For authentication (if you use Google login)</li>
            <li><strong>Vercel:</strong> For hosting and deploying our application</li>
            <li><strong>Resend:</strong> For sending email communications</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your personal information for as long as your account is active or as needed to provide 
            services. Card data is retained for the duration of your subscription. You may request deletion 
            of your account and associated data at any time.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
          <p className="mb-4">Under applicable data protection laws, you have the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cookies</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to maintain session state, authenticate users, 
            and remember your preferences. You can control cookie settings through your browser.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children&apos;s Privacy</h2>
          <p className="mb-4">
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at support@eidcard.app 
            or through our GitHub page.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
