import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts, getBlogPostsCountByCategory, BLOG_CATEGORIES } from '@/lib/supabase/blogPosts';
import { BookOpen, Clock3, ArrowRight, ChevronRight, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'English Language Journal - Grammar & Writing Research | Wrytt',
  description: 'Long-form essays and analytical articles on grammar, writing, and vocabulary development for serious English learners.',
  keywords: [
    'English learning blog',
    'grammar tips',
    'writing guides',
    'ESL resources',
    'English study tips',
    'grammar mistakes',
    'academic writing',
    'vocabulary building',
  ],
  openGraph: {
    title: 'English Language Journal | Grammar & Writing Research',
    description: 'Research-style articles on grammar, writing theory, lexical precision, and learner error analysis.',
    type: 'website',
    url: 'https://wrytt.me/blog',
    images: [
      {
        url: 'https://wrytt.me/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  const categoryCounts = await getBlogPostsCountByCategory();
  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-y-4 border-slate-900 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 hover:text-teal-700 transition-colors">
              Back to Home
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <GraduationCap size={14} />
              Wrytt Journal
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Issue 2026</p>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                English Learning Research & Guides
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
                A curated collection of practical grammar analysis, writing improvement strategies, and vocabulary frameworks for serious learners.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-300 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Archive Snapshot</p>
              <p className="mt-2 text-4xl font-black text-slate-900">{posts.length}</p>
              <p className="text-sm text-slate-600">peer-style learning articles</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="mb-14 grid gap-8 lg:grid-cols-[0.95fr_1.55fr]">
          <aside className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">Research Tracks</h2>
            <div className="space-y-3">
            {Object.entries(BLOG_CATEGORIES).map(([key, category]) => (
              <Link
                key={key}
                href={`/blog/${key}`}
                className="group flex items-start justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-teal-500 hover:bg-slate-50 transition-all"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{category.description}</p>
                </div>
                <div className="flex items-center gap-2 pl-3">
                  <span className="text-xs font-bold text-teal-700">{categoryCounts[key] || 0}</span>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
            </div>
          </aside>

          {featuredPost ? (
            <article className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm md:p-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Editor&apos;s Pick</p>
              <Link href={`/blog/${featuredPost.category}`} className="inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-teal-700 transition-colors">
                {BLOG_CATEGORIES[featuredPost.category].name}
              </Link>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
                <Link href={`/blog/${featuredPost.category}/${featuredPost.slug}`} className="hover:text-teal-700 transition-colors">
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">{featuredPost.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-5 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><Clock3 size={15} /> {featuredPost.reading_time} min read</span>
                <span>{new Date(featuredPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <Link href={`/blog/${featuredPost.category}/${featuredPost.slug}`} className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-800">
                  Read Full Article <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ) : (
            <div className="rounded-2xl border border-slate-300 bg-white p-12 text-center">
              <BookOpen size={42} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600">No blog posts yet. Check back soon.</p>
            </div>
          )}
        </section>

        {latestPosts.length > 0 && (
          <section className="rounded-2xl border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">Latest Publications</h2>
              <p className="mt-1 text-sm text-slate-600">Detailed guides and field notes for day-to-day English progress.</p>
            </div>
            <div className="divide-y divide-slate-200">
              {latestPosts.map((post, index) => (
                <article key={post.id} className="px-6 py-5 transition-colors hover:bg-slate-50">
                  <div className="grid gap-3 md:grid-cols-[56px_1fr_auto] md:items-center md:gap-5">
                    <p className="text-2xl font-black text-slate-300">{String(index + 2).padStart(2, '0')}</p>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{BLOG_CATEGORIES[post.category].name}</p>
                      <h3 className="text-lg font-black leading-snug text-slate-900">
                        <Link href={`/blog/${post.category}/${post.slug}`} className="hover:text-teal-700 transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 md:flex-col md:items-end md:gap-1">
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{post.reading_time} min</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 px-8 py-10 text-white md:px-12">
          <h2 className="text-3xl font-black tracking-tight">Editorial Direction</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300">
            This archive prioritizes long-form, text-first analysis. Articles are written as focused research essays, with no test-prep filler or interactive detours.
          </p>
        </section>
      </main>
    </div>
  );
}
