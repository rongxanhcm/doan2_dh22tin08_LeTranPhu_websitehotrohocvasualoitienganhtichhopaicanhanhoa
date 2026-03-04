import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-600 transition-colors mb-6">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 text-slate-600">
            <FileText size={24} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500 text-lg">Effective Date: February 13, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-cyan-600 hover:prose-a:text-cyan-700">
          <p>
            Welcome to <strong>Wrytt</strong>. By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
          </p>

          <h3>1. Use of Services</h3>
          <p>
            Wrytt provides an AI-powered writing assistant for educational purposes. You engage with our service at your own risk. While we strive for accuracy (using Vertex AI), we do not guarantee that the AI feedback is 100% error-free or that it will guarantee a specific score or outcome.
          </p>

          <h3>2. User Accounts</h3>
          <p>
            To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h3>3. Intellectual Property</h3>
          <p>
            You retain ownership of the text you submit to Wrytt. However, by using the service, you grant us a license to process your text solely for the purpose of providing feedback. Wrytt's interface, logo, and code are the property of Wrytt Inc.
          </p>

          <h3>4. Pro Subscriptions & Refunds</h3>
          <p>
            Premium features are billed on a subscription basis. You may cancel your subscription at any time. Refunds are handled on a case-by-case basis, generally only for technical errors preventing service usage.
          </p>

          <h3>5. Termination</h3>
          <p>
            We reserve the right to suspend or terminate your access to Wrytt at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the service.
          </p>

          <h3>6. Limitation of Liability</h3>
          <p>
            In no event shall Wrytt be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
        </div>

         {/* Footer of Terms */}
         <div className="mt-16 pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm">
                Contact for legal inquiries: <a href="mailto:legal@wrytt.ai" className="text-cyan-600 font-medium">legal@wrytt.ai</a>
            </p>
        </div>
      </div>
    </div>
  );
}