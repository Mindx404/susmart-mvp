'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Activity, Trash2, CheckCircle2, Clock, Home, MapPin, Calendar, Timer } from 'lucide-react'
import MapComponent from '@/components/MapComponent'
import Link from 'next/link'

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
        <div className="min-h-screen bg-slate-50 font-sans">

            <header className="bg-white border-b-2 border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">Панель Оператора</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Управление водными ресурсами</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <button className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl">
                                <Home className="w-4 h-4 inline mr-2" />
                                Главная
                            </button>
                        </Link>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.push('/login')
                            }}
                            className="h-10 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl"
                        >
                            <LogOut className="w-4 h-4 inline mr-2" />
                            Выйти
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 space-y-6">

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-green-600 to-green-500 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black flex items-center gap-2">
                                    <Calendar className="w-7 h-7" />
                                    Очередь полива
                                </h2>
                                <p className="text-green-100 text-sm font-medium mt-1">
                                    {approvedFields.length} полей в очереди
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                        {approvedFields.length === 0 ? (
                            <div className="p-12 text-center">
                                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Очередь пуста</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {approvedFields.map((field: Field) => (
                                    <div key={field.id} className="p-5 hover:bg-green-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-lg">
                                                    <span className="text-lg font-black text-white">#{field.queue_position || '—'}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-black text-slate-900">{field.name}</h3>
                                                        <p className="text-sm text-slate-500">
                                                            {field.profiles?.full_name} • {field.crop_type} • {field.area} га
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            📍 {field.district}, {field.street}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                            Начало полива
                                                        </p>
                                                        <p className="text-sm font-black text-slate-700 flex items-center gap-1">
                                                            <Clock className="w-4 h-4 text-blue-500" />
                                                            {formatTime(field.estimated_start_time)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                            Длительность
                                                        </p>
                                                        <p className="text-sm font-black text-slate-700 flex items-center gap-1">
                                                            <Timer className="w-4 h-4 text-amber-500" />
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-black">Заявки в ожидании</h2>
                                    <p className="text-blue-100 text-sm font-medium mt-1">
                                        {displayedPending.length} заявок
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSimulationActive(!simulationActive)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm ${simulationActive
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white/20 hover:bg-white/30'
                                        }`}
                                >
                                    {simulationActive ? '⚠️ Засуха' : '🌡️ Симуляция'}
                                </button>
                            </div>
                        </div>

                        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : displayedPending.length === 0 ? (
                                <div className="p-12 text-center">
                                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-slate-900">Нет заявок</p>
                                </div>
                            ) : (
                                <div>
                                    {Object.entries(pendingByDistrict).map(([district, fields]: [string, Field[]]) => (
                                        <div key={district} className="border-b-4 border-slate-100">
                                            <div className="bg-slate-100 px-5 py-3 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-600" />
                                                <span className="font-black text-sm uppercase tracking-wider text-slate-700">
                                                    {district} ({fields.length})
                                                </span>
                                            </div>

                                            <div className="divide-y divide-slate-100">
                                                {fields.map((field: Field, index: number) => (
                                                    <div key={field.id} className="p-5 hover:bg-slate-50">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                                                <span className="text-sm font-black text-slate-700">#{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div>
                                                                        <h3 className="font-black text-slate-900 text-sm">{field.name}</h3>
                                                                        <p className="text-xs text-slate-500">
                                                                            {field.profiles?.full_name} • {field.crop_type}
                                                                        </p>
                                                                        {field.street && (
                                                                            <p className="text-xs text-slate-400 mt-1">📍 {field.street}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className={`px-3 py-1 rounded-lg font-black text-xs ${field.risk_score > 70 ? 'bg-red-100 text-red-700' :
                                                                        field.risk_score > 40 ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-green-100 text-green-700'
                                                                        }`}>
                                                                        {field.risk_score}%
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2 mt-3">
                                                                    <button
                                                                        onClick={() => handleApprove(field.id, field.name)}
                                                                        className="h-9 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                                                                    >
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Одобрить
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(field.id)}
                                                                        className="h-9 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                        Удалить
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


                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-slate-700 to-slate-600 text-white">
                            <h2 className="text-2xl font-black">Карта Кыргызстана</h2>
                            <p className="text-slate-300 text-sm font-medium mt-1">
                                Визуализация полей
                            </p>
                        </div>
                        <div style={{ height: '600px' }}>
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
                    </div>
                </div>
            </div>
        </div>
    )
}
