import type { MetadataRoute } from 'next';
import { getAllGrammarRules } from '@/lib/supabase/grammarRules';
import { getAllBlogPosts, BLOG_CATEGORIES } from '@/lib/supabase/blogPosts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wrytt.me';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
      changeFrequency: 'daily',
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/analyze`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      priority: 0.4,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/update-password`,
      lastModified: new Date(),
      priority: 0.3,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      priority: 0.5,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      priority: 0.5,
      changeFrequency: 'monthly',
    },
  ];

  try {
    // Dynamic grammar rule pages
    const rules = await getAllGrammarRules();
    const rulePages: MetadataRoute.Sitemap = rules.map((rule) => ({
      url: `${baseUrl}/rules/${rule.error_key}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    }));

    // Blog category pages
    const categoryPages: MetadataRoute.Sitemap = Object.keys(BLOG_CATEGORIES).map((category) => ({
      url: `${baseUrl}/blog/${category}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    }));

    // Blog post pages
    const blogPosts = await getAllBlogPosts();
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.category}/${post.slug}`,
      lastModified: new Date(post.updated_at),
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    }));

    return [...staticPages, ...rulePages, ...categoryPages, ...blogPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database fetch fails
    return staticPages;
  }
}
