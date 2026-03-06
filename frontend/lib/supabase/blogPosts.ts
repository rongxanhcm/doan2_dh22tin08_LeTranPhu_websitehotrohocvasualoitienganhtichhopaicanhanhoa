import { createClient as createServerClient } from './server';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'grammar' | 'writing' | 'mistakes' | 'vocabulary' | 'guides';
  author: string;
  reading_time: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const BLOG_CATEGORIES = {
  grammar: { name: 'Grammar Analysis', description: 'In-depth analysis of grammar mechanics and usage patterns' },
  writing: { name: 'Writing Theory', description: 'Long-form essays on clarity, structure, and rhetorical strategy' },
  mistakes: { name: 'Error Studies', description: 'Deep dives into high-frequency learner error patterns' },
  vocabulary: { name: 'Lexical Studies', description: 'Precision, register, collocations, and advanced word choice' },
  guides: { name: 'Research Notes', description: 'Methodology notes and conceptual frameworks for language learning' },
} as const;

/**
 * Get all published blog posts
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data as BlogPost[];
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts by category:', error);
    return [];
  }

  return data as BlogPost[];
}

/**
 * Get a single blog post by category and slug
 */
export async function getBlogPost(category: string, slug: string): Promise<BlogPost | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('category', category)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data as BlogPost;
}

/**
 * Get related blog posts in the same category
 */
export async function getRelatedBlogPosts(category: string, currentSlug: string, limit: number = 3): Promise<BlogPost[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related blog posts:', error);
    return [];
  }

  return data as BlogPost[];
}

/**
 * Get blog posts count by category
 */
export async function getBlogPostsCountByCategory(): Promise<Record<string, number>> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching blog post counts:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  data.forEach((post: { category: string }) => {
    counts[post.category] = (counts[post.category] || 0) + 1;
  });

  return counts;
}
