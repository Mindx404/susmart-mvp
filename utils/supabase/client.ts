import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        if (typeof window === 'undefined') {
            console.warn('⚠️ Supabase environment variables are missing during SSR/Build.')
        }
        return createBrowserClient(url || '', key || '')
    }

    return createBrowserClient(url, key)
}
