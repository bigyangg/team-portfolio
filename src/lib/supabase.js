import { createClient } from '@supabase/supabase-js'

const normalizeEnvValue = (value) => (typeof value === 'string' ? value.trim() : '')

const supabaseUrl = normalizeEnvValue(
  import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL,
)
const supabaseKey = normalizeEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
)

const isValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl)

export const isSupabaseConfigured = Boolean(isValidSupabaseUrl && supabaseKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const allowClientStorageFallback = () => {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
}

/*
Run this in Supabase SQL Editor:
  supabase/nghtt_schema.sql
  supabase/nghtt_manage_lock.sql
*/
