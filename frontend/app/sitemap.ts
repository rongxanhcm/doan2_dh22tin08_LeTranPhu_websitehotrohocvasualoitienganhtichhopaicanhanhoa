import type { MetadataRoute } from 'next';
import { getAllGrammarRules } from '@/lib/supabase/grammarRules';

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
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: 'weekly',
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

  // Dynamic grammar rule pages
  try {
    const rules = await getAllGrammarRules();

    const rulePages: MetadataRoute.Sitemap = rules.map((rule) => ({
      url: `${baseUrl}/rules/${rule.error_key}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    }));

    return [...staticPages, ...rulePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database fetch fails
    return staticPages;
  }
}
