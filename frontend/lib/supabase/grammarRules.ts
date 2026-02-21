import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface GrammarRule {
  id: number;
  error_key: string;
  title: string;
  definition: string;
  rule: string;
  bad_example: string;
  good_example: string;
  tip: string;
}

function normalizeErrorKey(rawKey: string): string {
  const decoded = decodeURIComponent(rawKey || '').trim().toLowerCase();
  const normalized = decoded
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || decoded;
}

/**
 * Fetch all grammar rules (for generateStaticParams)
 */
export async function getAllGrammarRules(): Promise<GrammarRule[]> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot fetch grammar rules');
    return [];
  }

  const { data, error } = await supabase
    .from('grammar_rules')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching grammar rules:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single grammar rule by error_key
 */
export async function getGrammarRuleByKey(errorKey: string): Promise<GrammarRule | null> {
  if (!supabase) {
    console.warn('Supabase not configured - cannot fetch grammar rule');
    return null;
  }

  const fetchByKey = async (key: string) => {
    const { data, error } = await supabase
      .from('grammar_rules')
      .select('*')
      .eq('error_key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching grammar rule ${key}:`, error);
      return null;
    }

    return data || null;
  };

  const directMatch = await fetchByKey(errorKey);
  if (directMatch) {
    return directMatch;
  }

  const normalizedKey = normalizeErrorKey(errorKey);
  if (normalizedKey !== errorKey) {
    return fetchByKey(normalizedKey);
  }

  return null;
}
