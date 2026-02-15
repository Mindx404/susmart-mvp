'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Sprout, MapPin, AlertCircle, CheckCircle2, Clock, Home, TrendingUp, Users, Calendar, Timer } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Field {
    id: string
    name: string
    crop_type: string
    area: number
    risk_score: number
    status: string
    lat: number
    lng: number
    owner_id: string
    queue_position?: number
    estimated_start_time?: string
    estimated_duration_hours?: number
    region?: string
    district?: string
    street?: string
}

export default function FarmerDashboard() {
    const [myFields, setMyFields] = useState<Field[]>([])
    const [allPendingFields, setAllPendingFields] = useState<Field[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string>('')

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadData()


        const channel = supabase
            .channel('farmer-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fields' }, () => {
                loadData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        setUserId(user.id)


        const { data: myData } = await supabase
            .from('fields')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })

        if (myData) {
            setMyFields(myData)
        }


        const { data: allData } = await supabase
            .from('fields')
            .select('*')
            .eq('status', 'pending')
            .order('risk_score', { ascending: false })

        if (allData) {
            setAllPendingFields(allData)
        }

        setLoading(false)
    }

    const getStatusInfo = (status: string) => {
        if (status === 'pending') return { text: 'Ожидает', color: 'amber', icon: Clock }
        if (status === 'approved') return { text: 'Одобрено', color: 'green', icon: CheckCircle2 }
        if (status === 'watering') return { text: 'Полив идет', color: 'blue', icon: Sprout }
        return { text: status, color: 'gray', icon: AlertCircle }
    }


    const getQueuePosition = (fieldId: string) => {
        const index = allPendingFields.findIndex(f => f.id === fieldId)
        return index !== -1 ? index + 1 : null
    }


    const pendingFields = myFields.filter(f => f.status === 'pending')


    const approvedFields = myFields.filter(f => f.status === 'approved').sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0))

    const formatTime = (isoString?: string) => {
        if (!isoString) return '—'
        const date = new Date(isoString)
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDuration = (hours?: number) => {
        if (!hours) return '—'
        const h = Math.floor(hours)
        const m = Math.round((hours - h) * 60)
        return `${h}ч ${m}м`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 font-sans">

            <header className="bg-white border-b-2 border-slate-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">Мои поля</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Панель фермера</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Главная</span>
                            </button>
                        </Link>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.push('/login')
                            }}
                            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Выйти</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6">

                {pendingFields.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl shadow-xl shadow-blue-500/30 p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6" />
                            <h2 className="text-xl font-black">Статус очереди</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Заявок в очереди</p>
                                <p className="text-3xl font-black">{allPendingFields.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Ваша позиция</p>
                                <p className="text-3xl font-black">
                                    #{getQueuePosition(pendingFields[0].id) || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {approvedFields.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-green-600 to-green-500 rounded-3xl shadow-xl shadow-green-500/30 p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-6 h-6" />
                            <h2 className="text-xl font-black">Ваша очередь полива</h2>
                        </div>
                        <div className="space-y-3">
                            {approvedFields.map((field: Field) => (
                                <div key={field.id} className="bg-white/10 backdrop-blur rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-black text-lg mb-1">{field.name}</h3>
                                            <p className="text-green-100 text-sm">
                                                {field.crop_type} • {field.area} га
                                            </p>
                                            {field.street && (
                                                <p className="text-green-200 text-xs mt-1">
                                                    📍 {field.district}, {field.street}
                                                </p>
                                            )}
                                        </div>
                                        <div className="bg-white text-green-600 px-4 py-2 rounded-lg font-black text-lg">
                                            #{field.queue_position || '—'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/10 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="w-4 h-4 text-green-200" />
                                                <p className="text-xs font-bold uppercase tracking-wider text-green-200">Начало полива</p>
                                            </div>
                                            <p className="text-sm font-black">{formatTime(field.estimated_start_time)}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Timer className="w-4 h-4 text-green-200" />
                                                <p className="text-xs font-bold uppercase tracking-wider text-green-200">Длительность</p>
                                            </div>
                                            <p className="text-sm font-black">{formatDuration(field.estimated_duration_hours)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="mb-8">
                    <Link href="/farmer/new">
                        <button className="w-full h-16 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-500/30 transition-all flex items-center justify-center gap-3">
                            <Plus className="w-6 h-6" />
                            Создать новую заявку на полив
                        </button>
                    </Link>
                </div>


                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium">Загрузка полей...</p>
                    </div>
                ) : myFields.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sprout className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">Нет полей</h2>
                        <p className="text-slate-500 font-medium mb-6">
                            У вас пока нет зарегистрированных полей. Создайте первую заявку!
                        </p>
                        <Link href="/farmer/new">
                            <button className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all">
                                Создать заявку
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myFields.map((field: Field) => {
                            const statusInfo = getStatusInfo(field.status)
                            const StatusIcon = statusInfo.icon
                            const queuePosition = field.status === 'pending' ? getQueuePosition(field.id) : null

                            return (
                                <div key={field.id} className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-xl transition-all">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-black text-slate-900 mb-1">{field.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                    <Sprout className="w-4 h-4" />
                                                    {field.crop_type}
                                                    <span className="text-slate-300">•</span>
                                                    {field.area} га
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 ${statusInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                                    statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                                                        statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {statusInfo.text}
                                                </div>
                                                {queuePosition && (
                                                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        Позиция #{queuePosition}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                                                    Приоритет / Риск
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${field.risk_score > 70 ? 'bg-red-500' :
                                                        field.risk_score > 40 ? 'bg-amber-500' : 'bg-green-500'
                                                        }`}></div>
                                                    <span className={`text-2xl font-black ${field.risk_score > 70 ? 'text-red-600' :
                                                        field.risk_score > 40 ? 'text-amber-600' : 'text-green-600'
                                                        }`}>
                                                        {field.risk_score}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                                                    Координаты
                                                </p>
                                                <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                                                    <MapPin className="w-4 h-4" />
                                                    {field.lat.toFixed(4)}, {field.lng.toFixed(4)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
