import type { Metadata, ResolvingMetadata } from 'next';
import { getAllGrammarRules, getGrammarRuleByKey } from '@/lib/supabase/grammarRules';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const rule = await getGrammarRuleByKey(slug);

  if (!rule) {
    return {
      title: 'Rule Not Found | Wrytt',
      description: 'This grammar rule could not be found.',
    };
  }

  const title = `${rule.title} - Grammar Explained | Wrytt`;
  const description = rule.definition.substring(0, 160);

  return {
    title,
    description,
    keywords: [
      rule.title.toLowerCase(),
      'writing',
      'grammar',
      'English learning',
      'academic writing',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://wrytt.me/rules/${slug}`,
      images: [
        {
          url: 'https://wrytt.me/og-image.png',
          width: 1200,
          height: 630,
          alt: rule.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://wrytt.me/og-image.png'],
    },
    alternates: {
      canonical: `https://wrytt.me/rules/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const rules = await getAllGrammarRules();
    return rules.map((rule) => ({
      slug: rule.error_key,
    }));
  } catch (error) {
    console.warn('Could not generate static params for grammar rules:', error);
    // Return empty array - pages will be generated on-demand
    return [];
  }
}

export default function RuleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
