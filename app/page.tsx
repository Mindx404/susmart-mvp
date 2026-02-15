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
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
              <Droplets className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none block">SuSmart</span>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">{t.officialPortal}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <nav className="hidden lg:flex items-center gap-8 font-bold text-slate-500 text-sm uppercase tracking-wider">
              <a href="#features" className="hover:text-primary transition-colors">{t.coreCapabilities}</a>
              <a href="#regional" className="hover:text-primary transition-colors">{t.regionalFocus}</a>
            </nav>

            <div className="bg-slate-100 rounded-lg p-0.5 sm:p-1 flex gap-0.5 sm:gap-1">
              {(['en', 'ru', 'kg'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase rounded-md transition-all",
                    lang === l ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <Link href={role === 'operator' ? '/operator' : '/farmer'}>
                  <Button className="font-extrabold px-3 sm:px-6 text-xs sm:text-sm h-9 sm:h-10 shadow-lg shadow-primary/20">
                    <span className="hidden sm:inline">{lang === 'ru' ? 'Мой Профиль' : lang === 'kg' ? 'Менин Профилим' : 'My Profile'}</span>
                    <span className="sm:hidden">{lang === 'ru' ? 'Профиль' : lang === 'kg' ? 'Профилим' : 'Profile'}</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="font-bold text-slate-600 hover:text-primary">{t.signIn}</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-extrabold px-4 sm:px-8 text-xs sm:text-sm h-9 sm:h-10 shadow-lg shadow-primary/20">{t.getStarted}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">

        <section className="relative pt-12 sm:pt-24 pb-16 sm:pb-32 overflow-hidden bg-slate-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-40 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-primary/20 bg-white px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary shadow-sm mb-6 sm:mb-10">
              <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" /> {t.trustedResource}
            </div>
            <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.15] sm:leading-[1.1] tracking-tight px-2">
              {t.landingTitle}
            </h1>
            <p className="mx-auto mt-6 sm:mt-10 max-w-2xl text-base sm:text-xl text-slate-500 leading-relaxed font-medium px-4">
              {t.landingSubtitle}
            </p>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4">
              {user ? (
                <Link href={role === 'operator' ? '/operator' : '/farmer'} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-black shadow-xl shadow-primary/20 transition-transform active:scale-95">
                    {lang === 'ru' ? 'Перейти в Панель' : lang === 'kg' ? 'Башкаруу Панели' : 'Go to Dashboard'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-black shadow-xl shadow-primary/20 transition-transform active:scale-95">
                      {t.registerField}
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-bold border-2 border-slate-200 text-slate-600 hover:bg-white hover:border-primary hover:text-primary transition-all shadow-md">
                      {t.signIn}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>


        <section id="features" className="py-16 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-24">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4">{t.coreCapabilities}</h2>
              <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight px-4">{t.efficiency}</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:gap-12 md:grid-cols-3">
              <div className="group rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 sm:p-10 transition-all hover:border-primary hover:bg-white hover:shadow-2xl">
                <div className="mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <Activity className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4">{t.aiRisk}</h3>
                <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  {t.aiRiskDesc}
                </p>
              </div>
              <div className="group rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 sm:p-10 transition-all hover:border-primary hover:bg-white hover:shadow-2xl">
                <div className="mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <MapPin className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4">{t.geoSync}</h3>
                <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  {t.geoSyncDesc}
                </p>
              </div>
              <div className="group rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 sm:p-10 transition-all hover:border-primary hover:bg-white hover:shadow-2xl">
                <div className="mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4">{t.fairness}</h3>
                <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  {t.fairnessDesc}
                </p>
              </div>
            </div>
          </div>
        </section>


        <section id="regional" className="py-16 sm:py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden lg:block">
            <Globe2 className="w-full h-full scale-110" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/20 px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary mb-6 sm:mb-10 border border-primary/30">
                  {t.regionalFocus}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-6 sm:mb-8">
                  {t.empowering}
                </h2>
                <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed mb-8 sm:mb-10 max-w-xl">
                  {t.empoweringDesc}
                </p>
                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                  <div className="border-l-4 border-primary pl-4 sm:pl-6">
                    <p className="text-3xl sm:text-4xl font-black mb-2">40k+</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase">{t.hectares}</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 sm:pl-6">
                    <p className="text-3xl sm:text-4xl font-black mb-2">30%</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase">{t.efficiencyGain}</p>
                  </div>
                </div>
              </div>
              <div className="relative h-full min-h-[300px] sm:min-h-[500px]">

                <div className="h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-primary/20 shadow-2xl relative bg-slate-800">
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


      <footer className="bg-white border-t border-slate-100 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:gap-10 md:flex-row">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 text-primary">
                <Droplets className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter uppercase">SuSmart</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
              © 2026 SuSmart Digital. North Kyrgyzstan Water Authority.
            </p>
            <div className="flex gap-6 sm:gap-10 text-xs font-black text-slate-500 uppercase tracking-widest">
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
