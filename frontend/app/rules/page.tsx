import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGrammarRules } from '@/lib/supabase/grammarRules';
import { BookOpen, ArrowRight, Brain, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Grammar Rules & Writing Guide | Improve Your English Writing | Wrytt',
  description:
    'Master essential grammar rules with AI-powered explanations. Learn why errors happen, not just the fixes. Personalized quizzes from your actual mistakes. Perfect for students, professionals, and ESL learners.',
  keywords: [
    'grammar rules',
    'writing improvement',
    'English grammar guide',
    'grammar mistakes',
    'writing skills',
    'ESL grammar',
    'professional writing',
    'academic writing',
    'grammar learning',
    'English language tips',
    'writing errors',
    'grammar explanations',
  ],
  openGraph: {
    title: 'Master Grammar Rules | Personalized Learning with Wrytt',
    description:
      'Learn grammar through practice quizzes generated from your actual writing mistakes. AI-powered guidance in 18+ languages.',
    type: 'website',
    url: 'https://wrytt.me/rules',
    images: [
      {
        url: 'https://wrytt.me/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

function generateStructuredData(rules: any[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Wrytt',
      url: 'https://wrytt.me',
      logo: 'https://wrytt.me/logo.svg',
      description: 'AI-powered writing coach helping students, professionals, and ESL learners master English grammar and improve their writing skills',
      sameAs: [
        'https://twitter.com/wrytt',
        'https://github.com/wrytt',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Grammar Rules & Writing Guide - Master English Grammar',
      description: 'Learn 50+ grammar rules with personalized AI-powered quizzes. Master writing skills with explanations in 18+ languages.',
      url: 'https://wrytt.me/rules',
      hasPart: rules.map((rule) => ({
        '@type': 'LearningResource',
        name: rule.title,
        url: `https://wrytt.me/rules/${rule.error_key}`,
        author: {
          '@type': 'Organization',
          name: 'Wrytt',
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: rules.slice(0, 8).map((rule) => ({
        '@type': 'Question',
        name: `What is the rule for ${rule.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: rule.definition,
          url: `https://wrytt.me/rules/${rule.error_key}`,
        },
      })),
    },
  ];
}

export default async function RulesPage() {
  const rules = await getAllGrammarRules();

  // Categorize rules based on keywords in title
  const getCategoryIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('tense') || titleLower.includes('verb')) return { icon: '⏰', label: 'Verb Tenses', color: 'from-purple-500 to-purple-600' };
    if (titleLower.includes('article')) return { icon: '📖', label: 'Articles', color: 'from-blue-500 to-blue-600' };
    if (titleLower.includes('agreement')) return { icon: '✓', label: 'Agreement', color: 'from-green-500 to-green-600' };
    if (titleLower.includes('preposition')) return { icon: '🔗', label: 'Prepositions', color: 'from-pink-500 to-pink-600' };
    if (titleLower.includes('punctuation') || titleLower.includes('comma') || titleLower.includes('period')) return { icon: '❗', label: 'Punctuation', color: 'from-amber-500 to-amber-600' };
    if (titleLower.includes('fragment') || titleLower.includes('run-on') || titleLower.includes('splice')) return { icon: '⛓️', label: 'Sentences', color: 'from-red-500 to-red-600' };
    if (titleLower.includes('order')) return { icon: '↔️', label: 'Word Order', color: 'from-indigo-500 to-indigo-600' };
    return { icon: '📝', label: 'Grammar', color: 'from-teal-500 to-teal-600' };
  };

  const getDifficulty = (index: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (index < 8) return 'beginner';
    if (index < 16) return 'intermediate';
    return 'advanced';
  };

  const difficultyConfig = {
    beginner: { label: 'Beginner', color: 'bg-emerald-100 text-emerald-700', badge: '⭐' },
    intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700', badge: '⭐⭐' },
    advanced: { label: 'Advanced', color: 'bg-rose-100 text-rose-700', badge: '⭐⭐⭐' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(rules)),
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        {/* Hero */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900">Master English Grammar Rules</h1>
              <p className="text-xl text-slate-600 max-w-2xl">
                Learn every essential grammar rule with clear explanations, real examples, and personalized practice quizzes.
                Improve your writing at any level—from student essays to professional documents.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Rules Grid */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">All Grammar Rules</h2>
                <p className="text-slate-600">Explore {rules.length} essential rules to improve your English writing skills</p>
              </div>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No grammar rules found. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map((rule, index) => {
                  const category = getCategoryIcon(rule.title);
                  const difficulty = getDifficulty(index);
                  const diffConfig = difficultyConfig[difficulty];

                  return (
                    <Link
                      key={rule.id}
                      href={`/rules/${rule.error_key}`}
                      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      {/* Card Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      {/* Main Card */}
                      <div className="relative h-full p-6 bg-white rounded-2xl border border-slate-200 group-hover:border-slate-300 backdrop-blur-sm flex flex-col">
                        {/* Top Section: Category & Difficulty */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${diffConfig.color}`}>
                            {diffConfig.badge} {diffConfig.label}
                          </span>
                          <span className="text-2xl">{category.icon}</span>
                        </div>

                        {/* Category Tag */}
                        <div className="mb-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${category.color}`}>
                            {category.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                          {rule.title}
                        </h3>

                        {/* Definition */}
                        <p className="text-sm text-slate-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
                          {rule.definition}
                        </p>

                        {/* Features */}
                        <div className="flex flex-col gap-2 mb-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Target size={14} className="text-teal-600" />
                            <span>Practice with targeted quizzes</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Brain size={14} className="text-teal-600" />
                            <span>Learn with real examples</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-sm font-semibold text-teal-600 group-hover:text-teal-700">Explore Rule</span>
                          <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Shimmer Effect on Hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Learning Path */}
          <div className="mb-20 p-8 bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">Master Your Writing</h2>
            <p className="text-teal-50 mb-6">
              Learn grammar rules → Practice with AI quizzes → Track your progress → Become a better writer
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Analyzing Essays <ArrowRight size={18} />
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How do I use these grammar rules?',
                  a: 'Each rule page includes definitions, examples of correct and incorrect usage, and tips. Use them as reference while writing or practicing AI-generated quizzes.',
                },
                {
                  q: 'Are these rules useful for my level?',
                  a: 'Yes! Rules are organized by difficulty level (Beginner, Intermediate, Advanced) and apply to academic, professional, and general writing—perfect for students, ESL learners, and professionals.',
                },
                {
                  q: 'Can I practice these rules?',
                  a: 'Absolutely. Each rule links to AI-powered practice quizzes that adapt to your learning. Get 6 quizzes/day free, unlimited with Pro access.',
                },
                {
                  q: 'How often are new rules added?',
                  a: 'We regularly add new rules based on common writing errors from real user submissions. Check our changelog for the latest updates.',
                },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
