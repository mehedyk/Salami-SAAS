import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">EidCard</Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using EidCard, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to abide by these terms, please do not use this service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            EidCard is a platform that allows users to create, share, and view personalized Eid greeting cards. 
            Our service includes various themes, customizable messages, and shareable links.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            To access certain features, you must register for an account. You are responsible for maintaining 
            the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Subscription Plans</h2>
          <p className="mb-4">
            <strong>One-Time Plan (49 TK):</strong> Valid for 11 months from purchase date. Includes basic features 
            and limited card storage.
          </p>
          <p className="mb-4">
            <strong>Premium Plan (99 TK):</strong> Lifetime access with unlimited cards, priority support, 
            and all premium features.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
          <p className="mb-4">You agree NOT to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Use the service for any unlawful purpose</li>
            <li>Create cards with offensive, defamatory, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to any part of the service</li>
            <li>Interfere with or disrupt the service or servers connected to the service</li>
            <li>Collect or harvest any information from the service without permission</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Content Ownership</h2>
          <p className="mb-4">
            You retain ownership of any content you create using our service. By using EidCard, you grant us 
            a non-exclusive license to display your card content on our platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Payment Terms</h2>
          <p className="mb-4">
            All payments are processed through bKash. Refunds are not available once payment is confirmed. 
            Your subscription begins immediately upon successful payment.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="mb-4">
            EidCard shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your use or inability to use the service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon 
            posting on this page. Your continued use of the service constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms and Conditions, please contact us at support@eidcard.app
            or through our GitHub page.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
