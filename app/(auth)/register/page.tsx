'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Droplets, Mail, Lock, User, UserCog, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<'farmer' | 'operator'>('farmer')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        alert('Регистрация успешна! Перенаправляем на вход...')
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-green-400 rounded-3xl shadow-2xl shadow-green-500/30 mb-4">
                        <Droplets className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Регистрация</h1>
                    <p className="text-slate-500 font-medium mt-2">Создайте аккаунт в системе SuSmart</p>
                </div>


                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                    Полное имя
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Иван Иванов"
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

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
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
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
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                                    Выберите роль
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('farmer')}
                                        className={`h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${role === 'farmer'
                                            ? 'bg-green-50 border-green-500 shadow-lg shadow-green-200'
                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'farmer' ? 'bg-green-500' : 'bg-slate-300'
                                            }`}>
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-wider ${role === 'farmer' ? 'text-green-700' : 'text-slate-500'
                                            }`}>
                                            Фермер
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRole('operator')}
                                        className={`h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${role === 'operator'
                                            ? 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-200'
                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'operator' ? 'bg-blue-500' : 'bg-slate-300'
                                            }`}>
                                            <UserCog className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-wider ${role === 'operator' ? 'text-blue-700' : 'text-slate-500'
                                            }`}>
                                            Оператор
                                        </span>
                                    </button>
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
                                className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-black text-lg rounded-xl shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Создать аккаунт
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline">
                                Уже есть аккаунт? Войти →
                            </Link>
                        </div>
                    </div>
                </div>


                <div className="text-center mt-6">
                    <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-700 hover:underline">
                        ← Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    )
}
