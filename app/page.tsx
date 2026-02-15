'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Droplets, ShieldCheck, MapPin, Activity, CheckCircle2, Globe2 } from 'lucide-react'
import MapComponent from '@/components/MapComponent'
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { translations } from '@/utils/translations'
import { cn } from '@/lib/utils'

type Lang = 'en' | 'ru' | 'kg'

const MOCK_CANALS = [
  {
    id: 'c1',
    name: 'Big Chuy Canal (БЧК)',
    path: [
      [42.9100, 74.5000],
      [42.9050, 74.5500],
      [42.8980, 74.6000],
      [42.8950, 74.6500],
      [42.8900, 74.7000]
    ] as [number, number][]
  }
]

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('ru')
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<'farmer' | 'operator' | null>(null)
  const supabase = createClient()
  const t = translations[lang]

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile) setRole(profile.role)
      }
    }
    getUser()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans selection:bg-primary/20">

      <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-primary/10 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tight leading-none block">SuSmart</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.officialPortal}</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8 font-bold text-slate-500 text-sm uppercase tracking-wider">
              <a href="#features" className="hover:text-primary transition-colors">{t.coreCapabilities}</a>
              <a href="#regional" className="hover:text-primary transition-colors">{t.regionalFocus}</a>
            </nav>


            <div className="bg-slate-100 rounded-lg p-1 flex gap-1">
              {(['en', 'ru', 'kg'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-black uppercase rounded-md transition-all",
                    lang === l ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link href={role === 'operator' ? '/operator' : '/farmer'}>
                  <Button className="font-extrabold px-6 shadow-lg shadow-primary/20">
                    {lang === 'ru' ? 'Мой Профиль' : lang === 'kg' ? 'Менин Профилим' : 'My Profile'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="font-bold text-slate-600 hover:text-primary">{t.signIn}</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-extrabold px-8 shadow-lg shadow-primary/20">{t.getStarted}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">

        <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-40 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-primary shadow-sm mb-10">
              <ShieldCheck className="h-4 w-4" /> {t.trustedResource}
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-black text-slate-900 sm:text-7xl leading-[1.1] tracking-tight">
              {t.landingTitle}
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-xl text-slate-500 leading-relaxed font-medium">
              {t.landingSubtitle}
            </p>
            <div className="mt-12 flex items-center justify-center gap-6">
              {user ? (
                <Link href={role === 'operator' ? '/operator' : '/farmer'}>
                  <Button size="lg" className="h-16 px-12 text-lg font-black shadow-xl shadow-primary/20 transition-transform active:scale-95">
                    {lang === 'ru' ? 'Перейти в Панель' : lang === 'kg' ? 'Башкаруу Панели' : 'Go to Dashboard'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="h-16 px-12 text-lg font-black shadow-xl shadow-primary/20 transition-transform active:scale-95">
                      {t.registerField}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="h-16 px-12 text-lg font-bold border-2 border-slate-200 text-slate-600 hover:bg-white hover:border-primary hover:text-primary transition-all shadow-md">
                      {t.signIn}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>


        <section id="features" className="py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-24">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">{t.coreCapabilities}</h2>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{t.efficiency}</p>
            </div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="group rounded-3xl border-2 border-slate-100 bg-slate-50 p-10 transition-all hover:border-primary hover:bg-white hover:shadow-2xl">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <Activity className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{t.aiRisk}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {t.aiRiskDesc}
                </p>
              </div>
              <div className="group rounded-3xl border-2 border-slate-100 bg-slate-50 p-10 transition-all hover:border-primary hover:bg-white hover:shadow-2xl">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{t.geoSync}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {t.geoSyncDesc}
                </p>
              </div>
              <div className="group rounded-3xl border-2 border-slate-100 bg-slate-50 p-10 transition-all hover:border-primary hover:bg-white hover:shadow-2xl">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{t.fairness}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {t.fairnessDesc}
                </p>
              </div>
            </div>
          </div>
        </section>


        <section id="regional" className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Globe2 className="w-full h-full scale-110" />
          </div>
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-5 py-2 text-xs font-black uppercase tracking-widest text-primary mb-10 border border-primary/30">
                  {t.regionalFocus}
                </div>
                <h2 className="text-5xl font-black leading-tight tracking-tight mb-8">
                  {t.empowering}
                </h2>
                <p className="text-lg text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
                  {t.empoweringDesc}
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="border-l-4 border-primary pl-6">
                    <p className="text-4xl font-black mb-2">40k+</p>
                    <p className="text-sm font-bold text-slate-500 uppercase">{t.hectares}</p>
                  </div>
                  <div className="border-l-4 border-primary pl-6">
                    <p className="text-4xl font-black mb-2">30%</p>
                    <p className="text-sm font-bold text-slate-500 uppercase">{t.efficiencyGain}</p>
                  </div>
                </div>
              </div>
              <div className="relative h-full min-h-[500px]">

                <div className="h-full w-full rounded-3xl overflow-hidden border-4 border-primary/20 shadow-2xl relative bg-slate-800">
                  <MapComponent
                    center={[41.2, 74.8]}
                    zoom={8}
                    canals={MOCK_CANALS}
                    interactive={false}
                  />
                </div>


                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-primary to-blue-600 p-8 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-white/70">{t.currentCanalDepth}</p>
                  <p className="text-3xl font-black text-white">2.4m <span className="text-sm opacity-70 uppercase">Безопасно</span></p>
                </div>


                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-xl border-2 border-primary/20 z-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">🇰🇬 Кыргызстан</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>


      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-primary">
                <Droplets className="h-6 w-6" />
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">SuSmart</span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              © 2026 SuSmart Digital. North Kyrgyzstan Water Authority.
            </p>
            <div className="flex gap-10 text-xs font-black text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
