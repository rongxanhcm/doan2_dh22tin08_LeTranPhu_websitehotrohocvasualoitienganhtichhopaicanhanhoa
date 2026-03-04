import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-600 transition-colors mb-6">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 text-cyan-600">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">Last updated: February 13, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-cyan-600 hover:prose-a:text-cyan-700">
          <p>
            At <strong>Wrytt</strong> ("we," "our," or "us"), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and AI writing services.
          </p>

          <h3>1. Information We Collect</h3>
          <p>We collect information to provide better services to all our users:</p>
          <ul>
            <li><strong>Personal Account Info:</strong> When you sign up via Google or email, we collect your name, email address, and profile picture.</li>
            <li><strong>User Content:</strong> The essays, text, and documents you submit for AI analysis.</li>
            <li><strong>Usage Data:</strong> Information about how you use our app (e.g., time spent, features used) to improve our AI models.</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>We use the collected data for the following purposes:</p>
          <ul>
            <li>To provide AI-generated feedback on your writing (scoring, grammar checks).</li>
            <li>To maintain and improve our Vertex AI & Gemini integration.</li>
            <li>To communicate with you about updates, security alerts, and support.</li>
          </ul>

          <h3>3. Data Sharing & Security</h3>
          <p>
            We do not sell your personal data. We only share data with third-party service providers (like Google Cloud, Supabase) necessary to operate our service. All data transmission is encrypted using SSL/TLS protocols.
          </p>

          <h3>4. Your Rights</h3>
          <p>
            You have the right to access, correct, or delete your personal data at any time. You can manage your account settings directly in the dashboard or contact us at <a href="mailto:privacy@wrytt.ai">privacy@wrytt.ai</a>.
          </p>
        </div>

        {/* Footer of Policy */}
        <div className="mt-16 pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm">
                Questions about this policy? Contact us at <a href="mailto:privacy@wrytt.ai" className="text-cyan-600 font-medium">privacy@wrytt.ai</a>
            </p>
        </div>
      </div>
    </div>
  );
}