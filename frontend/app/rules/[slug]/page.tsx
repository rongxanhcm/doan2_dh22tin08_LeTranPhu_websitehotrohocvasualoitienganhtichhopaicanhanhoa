import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getGrammarRuleByKey } from '@/lib/supabase/grammarRules';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { GrammarRule } from '@/lib/supabase/grammarRules';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RulePage({ params }: Props) {
  const { slug } = await params;
  const rule = await getGrammarRuleByKey(slug);

  if (!rule) {
    notFound();
  }

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://wrytt.me',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Grammar Rules',
          item: 'https://wrytt.me/rules',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: rule.title,
          item: `https://wrytt.me/rules/${rule.error_key}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: rule.title,
      description: rule.definition,
      educationalLevel: 'IELTS Writing (Band 5-9)',
      learningResourceType: 'Grammar Guide',
      inLanguage: 'en-US',
      url: `https://wrytt.me/rules/${rule.error_key}`,
      author: {
        '@type': 'Organization',
        name: 'Wrytt',
        url: 'https://wrytt.me',
        logo: 'https://wrytt.me/logo.svg',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Wrytt',
        url: 'https://wrytt.me',
      },
      datePublished: new Date().toISOString(),
      isAccessibleForFree: true,
      hasPart: {
        '@type': 'CreativeWork',
        description: rule.rule,
        example: [
          {
            '@type': 'Thing',
            name: 'Incorrect Usage',
            description: rule.bad_example,
          },
          {
            '@type': 'Thing',
            name: 'Correct Usage',
            description: rule.good_example,
          },
        ],
      },
    },
  ];

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="min-h-screen bg-white">
        {/* Fixed Header */}
        <div className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link
              href="/rules"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-24 pt-20">
          {/* Header */}
          <div className="mb-16 space-y-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Grammar Rule</span>

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">{rule.title}</h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">{rule.definition}</p>
          </div>

          {/* Rule Explanation */}
          <div className="mb-16 pb-12 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">The Rule</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{rule.rule}</p>
          </div>

          {/* Examples Section */}
          <div className="mb-16 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Examples</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Incorrect Example */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-red-600 font-bold">✗</span>
                  <h3 className="font-semibold text-slate-900">Incorrect</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm p-4 bg-slate-50 rounded-lg whitespace-pre-wrap">{rule.bad_example}</p>
              </div>

              {/* Correct Example */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <h3 className="font-semibold text-slate-900">Correct</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm p-4 bg-emerald-50 rounded-lg whitespace-pre-wrap">{rule.good_example}</p>
              </div>
            </div>
          </div>

          {/* Tip Section */}
          {rule.tip && (
            <div className="mb-16 pb-12 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">💡 Pro Tip</h2>
              <p className="text-slate-700 leading-relaxed">{rule.tip}</p>
            </div>
          )}

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Practice this Rule <ArrowRight size={16} />
            </Link>
            <Link
              href="/rules"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              <ArrowLeft size={16} /> View All Rules
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
