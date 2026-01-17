import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // Next.js tự động map biến bắt đầu bằng NEXT_PUBLIC_ vào process.env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("❌ Thiếu biến môi trường Supabase ở Frontend!")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}