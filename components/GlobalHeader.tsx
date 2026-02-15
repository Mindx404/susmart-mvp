'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Droplets, Wifi, WifiOff, LogOut, User as UserIcon, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function GlobalHeader() {
    const [isOnline, setIsOnline] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [lang, setLang] = useState<'en' | 'ru' | 'kg'>('ru')

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline)
            window.addEventListener('offline', handleOffline)
            setIsOnline(navigator.onLine)
        }


        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                if (data) setProfile(data)
            }
        }
        getUser()

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('online', handleOnline)
                window.removeEventListener('offline', handleOffline)
            }
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 border-b border-primary/10 shadow-sm backdrop-blur-md h-16 flex items-center justify-between px-4 lg:px-6 transition-all">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                    <Droplets className="h-6 w-6" />
                </div>
                <div>
                    <span className="text-lg font-black text-slate-900 tracking-tight leading-none block group-hover:text-primary transition-colors">SuSmart</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Water Management</span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">

                <div className="hidden md:flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
                    {(['en', 'ru', 'kg'] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={cn(
                                "px-2.5 py-1 text-[10px] font-black uppercase rounded-md transition-all",
                                lang === l ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>


                <div className="md:hidden flex items-center justify-center h-8 w-8 bg-slate-50 text-slate-500 rounded-full text-xs font-black uppercase border border-slate-100">
                    {lang}
                </div>

                <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />


                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                    isOnline
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                )}>
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                </div>


                {user && (
                    <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-slate-100">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-800 leading-none">{profile?.full_name || user.email?.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{profile?.role || 'User'}</p>
                        </div>
                        <div className="relative group">
                            <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border-2 border-slate-50 ring-1 ring-slate-100 overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-4 w-4" />
                                )}
                            </div>
                            <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </header>
    )
}
