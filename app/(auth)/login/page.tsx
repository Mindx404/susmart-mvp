'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Droplets, Mail, Lock, LogIn, User, UserCog } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        if (data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profile?.role === 'operator') {
                router.push('/operator')
            } else {
                router.push('/farmer')
            }
        }
    }

    const handleDemo = (role: 'farmer' | 'operator') => {
        if (role === 'operator') {
            router.push('/operator')
        } else {
            router.push('/farmer')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl shadow-2xl shadow-blue-500/30 mb-4">
                        <Droplets className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">SuSmart</h1>
                    <p className="text-slate-500 font-medium mt-2">Система Управления Водными Ресурсами</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Вход в систему</h2>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@mail.com"
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                    Пароль
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Войти
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/register" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                                Нет аккаунта? Зарегистрироваться →
                            </Link>
                        </div>
                    </div>

                    {/* Demo Section */}
                    <div className="bg-slate-50 p-6 border-t-2 border-slate-100">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-4">
                            Демо-доступ
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleDemo('farmer')}
                                className="h-12 bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-500 rounded-xl font-bold text-sm text-slate-700 hover:text-green-600 transition-all flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" />
                                Фермер
                            </button>
                            <button
                                onClick={() => handleDemo('operator')}
                                className="h-12 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 rounded-xl font-bold text-sm text-slate-700 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                <UserCog className="w-4 h-4" />
                                Оператор
                            </button>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-700 hover:underline">
                        ← Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    )
}
