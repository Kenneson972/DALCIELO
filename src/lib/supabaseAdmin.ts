import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        global: {
          fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
        },
      })
    : null

/** Lance une erreur si Supabase n'est pas configuré (pour les stores qui en dépendent). */
export function getSupabase(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase non configuré : définir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY')
  }
  return supabaseAdmin
}
