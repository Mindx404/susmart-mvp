import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        console.warn('⚠️ Supabase environment variables are missing during SSR/Build.')
        // We still call it, but it will likely throw a descriptive error from Supabase SDK
        // instead of a hard crash on undefined access (!)
        return createServerClient(url || '', key || '', {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value },
                set(name: string, value: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value, ...options }) } catch (error) { }
                },
                remove(name: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value: '', ...options }) } catch (error) { }
                },
            }
        })
    }

    return createServerClient(url, key, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value, ...options })
                } catch (error) {
                }
            },
            remove(name: string, options: CookieOptions) {
                try {
                    cookieStore.set({ name, value: '', ...options })
                } catch (error) {
                }
            },
        },
    })
}
