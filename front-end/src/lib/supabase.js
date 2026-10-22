import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// null when Supabase isn't configured (no .env.local, the QA build, or under Vitest):
// the hub then has no accounts and saves to this browser (or your claude.ai account in the artifact).
export const supabase = url && key && import.meta.env.MODE !== 'test' ? createClient(url, key) : null
