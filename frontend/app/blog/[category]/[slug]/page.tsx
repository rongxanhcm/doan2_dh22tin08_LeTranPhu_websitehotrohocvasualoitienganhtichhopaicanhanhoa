import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost, getRelatedBlogPosts, BLOG_CATEGORIES } from '@/lib/supabase/blogPosts';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { renderBlogContent } from '@/lib/blogContent';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await getBlogPost(category, slug);

  if (!post) {
    return {
      title: 'Post Not Found | Wrytt Blog',
    };
  }

  return {
    title: `${post.title} | Wrytt Blog`,
    description: post.excerpt,
    keywords: [
      post.category,
      'English learning',
      'grammar',
      'writing',
      'ESL',
    ],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://wrytt.me/blog/${category}/${slug}`,
      images: [
        {
          url: 'https://wrytt.me/og-image.png',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { category, slug } = await params;
  const post = await getBlogPost(category, slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(category, slug, 3);
  const categoryInfo = BLOG_CATEGORIES[post.category];
  const articleHtml = renderBlogContent(post.content);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/blog" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">
              Blog
            </Link>
            <span className="text-slate-300">/</span>
            <Link href={`/blog/${category}`} className="text-sm text-slate-500 hover:text-teal-600 transition-colors">
              {categoryInfo.name}
            </Link>
          </div>
          
          <Link 
            href={`/blog/${category}`}
            className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wide hover:bg-teal-100 transition-colors mb-6"
          >
            {categoryInfo.name}
          </Link>
          
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{post.reading_time} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div 
          className="journal-content"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.category}/${relatedPost.slug}`}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all p-6"
                >
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{relatedPost.reading_time} min read</span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold transition-colors"
              >
                <ArrowLeft size={16} /> View All Articles
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            author: {
              '@type': 'Organization',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Wrytt',
              logo: {
                '@type': 'ImageObject',
                url: 'https://wrytt.me/logo.svg',
              },
            },
            datePublished: post.created_at,
            dateModified: post.updated_at,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://wrytt.me/blog/${category}/${slug}`,
            },
            image: 'https://wrytt.me/og-image.png',
          }),
        }}
      />
    </div>
  );
}
