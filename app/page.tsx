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

      <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900/90 to-transparent backdrop-blur-sm border-b border-white/10">
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-white text-primary shadow-lg">
              <Droplets className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none block">SuSmart</span>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/70 hidden sm:block">{t.officialPortal}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <nav className="hidden lg:flex items-center gap-8 font-bold text-white/90 text-sm uppercase tracking-wider">
              <a href="#features" className="hover:text-white transition-colors">{t.coreCapabilities}</a>
              <a href="#regional" className="hover:text-white transition-colors">{t.regionalFocus}</a>
            </nav>

            <div className="bg-white/10 backdrop-blur rounded-lg p-0.5 sm:p-1 flex gap-0.5 sm:gap-1 border border-white/20">
              {(['en', 'ru', 'kg'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase rounded-md transition-all",
                    lang === l ? "bg-white text-primary shadow-sm" : "text-white/70 hover:text-white"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                <Link href={role === 'operator' ? '/operator' : '/farmer'}>
                  <Button className="font-extrabold px-3 sm:px-6 text-xs sm:text-sm h-9 sm:h-10 shadow-lg shadow-primary/20 bg-white text-primary hover:bg-white/90">
                    <span className="hidden sm:inline">{lang === 'ru' ? 'Мой Профиль' : lang === 'kg' ? 'Менин Профилим' : 'My Profile'}</span>
                    <span className="sm:hidden">{lang === 'ru' ? 'Профиль' : lang === 'kg' ? 'Профилим' : 'Profile'}</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="font-bold text-white hover:text-white hover:bg-white/10">{t.signIn}</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="font-extrabold px-4 sm:px-8 text-xs sm:text-sm h-9 sm:h-10 shadow-lg shadow-primary/20 bg-white text-primary hover:bg-white/90">{t.getStarted}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">

        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/85 z-10"></div>
            <img
              src="/slide-1960x857-07.jpg"
              alt="Water Management"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 text-center py-20">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-lg mb-6 sm:mb-8">
              <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" /> {t.trustedResource}
            </div>

            <h1 className="mx-auto max-w-5xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight px-2 mb-6 sm:mb-8 drop-shadow-2xl [text-shadow:_0_4px_12px_rgb(0_0_0_/_80%)]">
              {t.landingTitle}
            </h1>

            <div className="w-24 h-1 bg-primary mx-auto mb-6 sm:mb-8 shadow-lg shadow-primary/50"></div>

            <p className="mx-auto mt-6 sm:mt-8 max-w-3xl text-lg sm:text-xl md:text-2xl text-white leading-relaxed font-medium px-4 drop-shadow-lg [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)]">
              {t.landingSubtitle}
            </p>

            <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
              {user ? (
                <Link href={role === 'operator' ? '/operator' : '/farmer'} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-black shadow-2xl bg-primary hover:bg-primary/90 transition-all">
                    {lang === 'ru' ? 'Перейти в Панель' : lang === 'kg' ? 'Башкаруу Панели' : 'Go to Dashboard'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-black shadow-2xl bg-primary hover:bg-primary/90 transition-all">
                      {t.registerField}
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-bold border-2 border-white/50 bg-white/10 backdrop-blur text-white hover:bg-white hover:text-primary transition-all shadow-xl">
                      {t.signIn}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>


        <section id="features" className="py-16 sm:py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-block mb-4">
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-2 rounded-full">{t.coreCapabilities}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight px-4 mb-4">{t.efficiency}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
              <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 sm:p-8 transition-all hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 border border-blue-200/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <Activity className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors">{t.aiRisk}</h3>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    {t.aiRiskDesc}
                  </p>
                </div>
              </div>

              <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 p-6 sm:p-8 transition-all hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 border border-green-200/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <MapPin className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4 group-hover:text-green-600 transition-colors">{t.geoSync}</h3>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    {t.geoSyncDesc}
                  </p>
                </div>
              </div>

              <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 sm:p-8 transition-all hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 border border-purple-200/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="mb-6 sm:mb-8 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 sm:mb-4 group-hover:text-purple-600 transition-colors">{t.fairness}</h3>
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    {t.fairnessDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="regional" className="py-16 sm:py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-slate-900"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none hidden lg:block">
            <Globe2 className="w-full h-full scale-110" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/20 backdrop-blur px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary mb-6 sm:mb-8 border border-primary/30">
                  {t.regionalFocus}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-4 sm:mb-6 text-white">
                  {t.empowering}
                </h2>
                <div className="w-24 h-1 bg-primary mb-6 sm:mb-8"></div>
                <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed mb-8 sm:mb-10 max-w-xl">
                  {t.empoweringDesc}
                </p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all">
                      <p className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">40k+</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-200 uppercase">{t.hectares}</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all">
                      <p className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">30%</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-200 uppercase">{t.efficiencyGain}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-full min-h-[300px] sm:min-h-[500px]">

                <div className="h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-primary/30 shadow-2xl shadow-primary/20 relative bg-slate-800">
                  <MapComponent
                    center={[41.2, 74.8]}
                    zoom={8}
                    canals={MOCK_CANALS}
                    interactive={false}
                  />
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm px-6 py-3 rounded-xl shadow-xl border-2 border-primary/20 z-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">🇰🇬 Кыргызстан</p>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-primary to-blue-600 p-8 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-white/70">{t.currentCanalDepth}</p>
                  <p className="text-3xl font-black text-white">2.4m <span className="text-sm opacity-70 uppercase">Безопасно</span></p>
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
    </div >
  )
}
