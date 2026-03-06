import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostsByCategory, BLOG_CATEGORIES } from '@/lib/supabase/blogPosts';
import { BookOpen, Clock3, ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  
  if (!(category in BLOG_CATEGORIES)) {
    return {
      title: 'Category Not Found | Wrytt Blog',
    };
  }

  const categoryInfo = BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES];

  return {
    title: `${categoryInfo.name} - English Learning Blog | Wrytt`,
    description: `${categoryInfo.description}. Free articles, tips, and guides for English learners.`,
    openGraph: {
      title: `${categoryInfo.name} | Wrytt Blog`,
      description: categoryInfo.description,
      type: 'website',
      url: `https://wrytt.me/blog/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!(category in BLOG_CATEGORIES)) {
    notFound();
  }

  const categoryInfo = BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES];
  const posts = await getBlogPostsByCategory(category);
  const leadPost = posts[0];
  const restPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-y-4 border-slate-900 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 hover:text-teal-700 transition-colors">
              <ArrowLeft size={14} /> Back to Journal
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <GraduationCap size={14} />
              {posts.length} Articles
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Category Archive</p>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                {categoryInfo.name}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
                {categoryInfo.description}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-300 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Focus</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{categoryInfo.name}</p>
              <p className="text-sm text-slate-600">Practical and structured learning notes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-300 bg-white p-12 text-center">
            <BookOpen size={42} className="mx-auto mb-3 text-slate-300" />
            <p className="mb-4 text-slate-600">No articles in this category yet.</p>
            <Link href="/blog" className="font-semibold text-teal-700 hover:text-teal-800">
              Browse all articles →
            </Link>
          </div>
        ) : (
          <>
            {leadPost && (
              <article className="mb-10 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm md:p-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Lead Article</p>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
                  <Link href={`/blog/${leadPost.category}/${leadPost.slug}`} className="hover:text-teal-700 transition-colors">
                    {leadPost.title}
                  </Link>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-700">{leadPost.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-slate-200 pt-5 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><Clock3 size={15} /> {leadPost.reading_time} min read</span>
                  <span>{new Date(leadPost.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <Link href={`/blog/${leadPost.category}/${leadPost.slug}`} className="inline-flex items-center gap-2 font-bold text-teal-700 hover:text-teal-800">
                    Read Full Article <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            )}

            <section className="rounded-2xl border border-slate-300 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">All {categoryInfo.name} Publications</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {restPosts.map((post, index) => (
                  <article key={post.id} className="px-6 py-5 transition-colors hover:bg-slate-50">
                    <div className="grid gap-3 md:grid-cols-[56px_1fr_auto] md:items-center md:gap-5">
                      <p className="text-2xl font-black text-slate-300">{String(index + 2).padStart(2, '0')}</p>
                      <div>
                        <h4 className="text-lg font-black leading-snug text-slate-900">
                          <Link href={`/blog/${post.category}/${post.slug}`} className="hover:text-teal-700 transition-colors">
                            {post.title}
                          </Link>
                        </h4>
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
          </>
        )}

        <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 px-8 py-10 text-white md:px-12">
          <h2 className="text-3xl font-black tracking-tight">About This Category</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300">
            Each article in this track is designed as a deep textual analysis. The goal is conceptual clarity and durable understanding through rigorous explanation.
          </p>
        </section>

        <div className="mt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-600 hover:text-teal-700 transition-colors">
            <ArrowLeft size={14} /> Back to all categories
          </Link>
        </div>
      </main>
    </div>
  );
}
