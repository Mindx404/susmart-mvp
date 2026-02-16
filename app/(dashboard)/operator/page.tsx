'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Activity, Trash2, CheckCircle2, Clock, Home, MapPin, Calendar, Timer, Sun, Moon } from 'lucide-react'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export const dynamic = 'force-dynamic'

interface Field {
    id: string
    name: string
    crop_type: string
    area: number
    risk_score: number
    status: string
    owner_id: string
    lat: number
    lng: number
    region?: string
    district?: string
    street?: string
    approved_at?: string
    queue_position?: number
    estimated_start_time?: string
    estimated_duration_hours?: number
    profiles?: {
        full_name: string
    }
}

const KYRGYZSTAN_CANALS = [
    {
        id: 'bchk',
        name: 'Большой Чуйский Канал (БЧК)',
        path: [
            [42.9200, 74.4500],
            [42.9100, 74.5000],
            [42.9050, 74.5500],
            [42.8980, 74.6000],
            [42.8950, 74.6500],
            [42.8900, 74.7000],
            [42.8850, 74.7500]
        ] as [number, number][]
    }
]

export default function OperatorDashboard() {
    const [pendingFields, setPendingFields] = useState<Field[]>([])
    const [approvedFields, setApprovedFields] = useState<Field[]>([])
    const [loading, setLoading] = useState(true)
    const [simulationActive, setSimulationActive] = useState(false)
    const [activeTab, setActiveTab] = useState<'queue' | 'requests' | 'map'>('queue')
    const { theme, toggleTheme } = useTheme()

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        loadFields()

        const channel = supabase
            .channel('fields-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'fields'
            }, () => {
                loadFields()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const loadFields = async () => {

        const { data: pending } = await supabase
            .from('fields')
            .select('*, profiles(full_name)')
            .eq('status', 'pending')
            .order('risk_score', { ascending: false })


        const { data: approved } = await supabase
            .from('fields')
            .select('*, profiles(full_name)')
            .eq('status', 'approved')
            .order('queue_position', { ascending: true })

        if (pending) setPendingFields(pending as any)
        if (approved) setApprovedFields(approved as any)
        setLoading(false)
    }

    const handleApprove = async (fieldId: string, fieldName: string) => {
        const confirmed = confirm(`Одобрить полив для "${fieldName}"?`)
        if (!confirmed) return

        const { error } = await supabase
            .from('fields')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString()
            })
            .eq('id', fieldId)

        if (error) {
            alert('Ошибка: ' + error.message)
        } else {
            alert('✅ Заявка одобрена и добавлена в очередь полива!')
            loadFields()
        }
    }

    const handleDelete = async (fieldId: string) => {
        const { error } = await supabase
            .from('fields')
            .delete()
            .eq('id', fieldId)

        if (!error) loadFields()
    }

    const displayedPending = simulationActive
        ? pendingFields.map(f => ({ ...f, risk_score: Math.min(100, f.risk_score + 20) })).sort((a, b) => b.risk_score - a.risk_score)
        : pendingFields

    const pendingByDistrict = displayedPending.reduce((acc, field) => {
        const district = field.district || 'Без района'
        if (!acc[district]) acc[district] = []
        acc[district].push(field)
        return acc
    }, {} as Record<string, Field[]>)

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
            <header className="bg-white dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-30 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">Панель Оператора</h1>
                            <p className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">Управление ресурсами</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={toggleTheme}
                            className="h-9 sm:h-10 w-9 sm:w-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center transition-colors"
                        >
                            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>
                        <Link href="/">
                            <button className="h-9 sm:h-10 px-3 sm:px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl">
                                <Home className="w-4 h-4 inline sm:mr-2" />
                                <span className="hidden sm:inline">Главная</span>
                            </button>
                        </Link>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.push('/login')
                            }}
                            className="h-9 sm:h-10 px-3 sm:px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm rounded-xl"
                        >
                            <LogOut className="w-4 h-4 inline sm:mr-2" />
                            <span className="hidden sm:inline">Выйти</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                {/* TABS NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-lg p-1.5 mb-6 flex gap-1 overflow-x-auto no-scrollbar sticky top-[75px] z-20 mx-[-16px] px-[16px] sm:mx-0 sm:static sm:top-0">
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`flex-1 min-w-[120px] px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'queue'
                                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Очередь</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 min-w-[120px] px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'requests'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Заявки</span>
                        {displayedPending.length > 0 && (
                            <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded text-[10px] shadow-sm">
                                {displayedPending.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`flex-1 min-w-[120px] px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'map'
                                ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        <span>Карта</span>
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div>

                    {/* QUEUE TAB */}
                    {activeTab === 'queue' && (
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 bg-gradient-to-r from-green-600 to-green-500 text-white sticky top-0 z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                                            <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
                                            Очередь полива
                                        </h2>
                                        <p className="text-green-100 text-sm font-medium mt-1">
                                            {approvedFields.length} полей в активной очереди
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-auto min-h-[300px] max-h-[calc(100vh-250px)]">
                                {approvedFields.length === 0 ? (
                                    <div className="p-12 text-center h-[400px] flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                            <Clock className="w-10 h-10 text-green-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Очередь пуста</h3>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                            В данный момент нет одобренных заявок на полив. Перейдите во вкладку "Заявки".
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {approvedFields.map((field: Field) => (
                                            <div key={field.id} className="p-4 sm:p-5 hover:bg-green-50 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg">
                                                            <span className="text-sm sm:text-lg font-black text-white">#{field.queue_position || '—'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-3">
                                                            <h3 className="font-black text-slate-900 text-base sm:text-lg">{field.name}</h3>
                                                            <p className="text-sm text-slate-500">
                                                                {field.profiles?.full_name} • {field.crop_type} • <span className="font-bold text-slate-700">{field.area} га</span>
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {field.district}, {field.street || 'Нет улицы'}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                                    Начало
                                                                </p>
                                                                <p className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                                    {formatTime(field.estimated_start_time)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                                    Длительность
                                                                </p>
                                                                <p className="text-xs sm:text-sm font-black text-slate-700 flex items-center gap-1.5">
                                                                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                                                                    {formatDuration(field.estimated_duration_hours)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white sticky top-0 z-10">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black">Заявки</h2>
                                        <p className="text-blue-100 text-sm font-medium mt-1">
                                            {displayedPending.length} ожидают решения
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSimulationActive(!simulationActive)}
                                        className={`px-3 py-2 rounded-xl font-bold text-xs ${simulationActive
                                                ? 'bg-amber-500 text-white shadow-lg'
                                                : 'bg-white/20 hover:bg-white/30 text-white'
                                            }`}
                                    >
                                        {simulationActive ? '⚠️ Засуха вкл' : '🌡️ Симуляция'}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-auto min-h-[300px] max-h-[calc(100vh-250px)]">
                                {loading ? (
                                    <div className="p-12 text-center h-[400px] flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    </div>
                                ) : displayedPending.length === 0 ? (
                                    <div className="p-12 text-center h-[400px] flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-10 h-10 text-blue-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">Нет новых заявок</h3>
                                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                            Все поступившие заявки были обработаны. Ожидайте новых поступлений от фермеров.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pb-20 sm:pb-0">
                                        {Object.entries(pendingByDistrict).map(([district, fields]: [string, Field[]]) => (
                                            <div key={district} className="border-b-4 border-slate-100 last:border-0">
                                                <div className="bg-slate-50/80 backdrop-blur sticky top-0 z-0 px-5 py-2 flex items-center gap-2 border-b border-slate-100">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                    <span className="font-black text-xs uppercase tracking-wider text-slate-600">
                                                        {district} • {fields.length}
                                                    </span>
                                                </div>

                                                <div className="divide-y divide-slate-100">
                                                    {fields.map((field: Field, index: number) => (
                                                        <div key={field.id} className="p-4 sm:p-5 hover:bg-blue-50/30 transition-colors">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-slate-600 text-sm">
                                                                    #{index + 1}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                                                        <div>
                                                                            <h3 className="font-black text-slate-900 text-base">{field.name}</h3>
                                                                            <p className="text-sm text-slate-500">
                                                                                {field.profiles?.full_name} • {field.crop_type}
                                                                            </p>
                                                                            {field.street && (
                                                                                <p className="text-xs text-slate-400 mt-1">📍 {field.street}</p>
                                                                            )}
                                                                        </div>
                                                                        <div className={`self-start px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1.5 ${field.risk_score > 70 ? 'bg-red-100 text-red-700' :
                                                                                field.risk_score > 40 ? 'bg-amber-100 text-amber-700' :
                                                                                    'bg-green-100 text-green-700'
                                                                            }`}>
                                                                            <Activity className="w-3 h-3" />
                                                                            Риск: {field.risk_score}%
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-3">
                                                                        <button
                                                                            onClick={() => handleApprove(field.id, field.name)}
                                                                            className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                                                                            disabled={field.risk_score > 80 && !confirm}
                                                                        >
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            Одобрить
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(field.id)}
                                                                            className="h-10 w-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors border border-red-100"
                                                                            title="Отклонить"
                                                                        >
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MAP TAB */}
                    {activeTab === 'map' && (
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden h-[calc(100vh-180px)] min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-100 max-w-xs hidden sm:block">
                                <h3 className="font-black text-slate-900 mb-1">Карта полей</h3>
                                <p className="text-xs text-slate-500 mb-3">Визуализация всех заявок и очередей</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-xs font-bold text-slate-600">Заявки ({pendingFields.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-xs font-bold text-slate-600">В очереди ({approvedFields.length})</span>
                                    </div>
                                </div>
                            </div>
                            <MapComponent
                                center={[42.8746, 74.5698]}
                                zoom={10}
                                canals={KYRGYZSTAN_CANALS}
                                markers={[...pendingFields, ...approvedFields].map(f => ({
                                    id: f.id,
                                    lat: f.lat,
                                    lng: f.lng,
                                    label: `${f.name} (${f.risk_score}%)`,
                                    status: f.status,
                                    riskScore: f.risk_score
                                }))}
                                interactive={true}
                            />
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
