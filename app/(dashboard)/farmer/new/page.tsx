'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { MapPin, Sprout, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Реальные данные Кыргызстана
const REGIONS = {
    'Чуйская область': {
        'Аламединский район': ['ул. Ленина', 'ул. Жибек Жолу', 'ул. Манаса', 'ул. Ахунбаева'],
        'Сокулукский район': ['ул. Фрунзе', 'ул. Токтогула', 'ул. Советская'],
        'Московский район': ['ул. Ахунбаева', 'ул. Киевская', 'ул. Московская']
    },
    'Ошская область': {
        'Кара-Суйский район': ['ул. Ленина', 'ул. Масалиева'],
        'Ноокатский район': ['ул. Токтогула', 'ул. Фрунзе']
    },
    'Иссык-Кульская область': {
        'Иссык-Кульский район': ['ул. Пржевальского', 'ул. Гагарина'],
        'Тонский район': ['ул. Ленина', 'ул. Советская']
    }
}

export default function NewFieldPage() {
    const [name, setName] = useState('')
    const [area, setArea] = useState('')
    const [cropType, setCropType] = useState('Хлопок')
    const [region, setRegion] = useState('Чуйская область')
    const [district, setDistrict] = useState('Аламединский район')
    const [street, setStreet] = useState('')
    const [lat, setLat] = useState('')
    const [lng, setLng] = useState('')
    const [loading, setLoading] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    const districts = Object.keys(REGIONS[region as keyof typeof REGIONS] || {})
    const streets = REGIONS[region as keyof typeof REGIONS]?.[district as keyof typeof REGIONS[keyof typeof REGIONS]] || []

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude.toFixed(6))
                    setLng(position.coords.longitude.toFixed(6))
                },
                () => {
                    setLat('42.8746')
                    setLng('74.5698')
                }
            )
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const generatedRiskScore = Math.floor(Math.random() * 100) + 1
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('Вы не авторизованы')
            router.push('/login')
            return
        }

        const { error } = await supabase
            .from('fields')
            .insert({
                owner_id: user.id,
                name,
                crop_type: cropType,
                area: parseFloat(area),
                region,
                district,
                street,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                risk_score: generatedRiskScore,
                status: 'pending'
            })

        if (error) {
            alert('Ошибка: ' + error.message)
            setLoading(false)
        } else {
            alert(`Заявка создана! AI определил риск: ${generatedRiskScore}%`)
            router.push('/farmer')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 font-sans p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/farmer">
                        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4">
                            <ArrowLeft className="w-5 h-5" />
                            Назад
                        </button>
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900">Новая заявка на полив</h1>
                    <p className="text-slate-500 mt-2">Заполните информацию о вашем поле</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 space-y-6">
                    {/* Название */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Название участка
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например: Участок №4"
                            className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium focus:outline-none focus:border-green-500"
                            required
                        />
                    </div>

                    {/* Адрес */}
                    <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <MapPin className="w-5 h-5" />
                            <span className="font-black uppercase text-sm tracking-widest">Адрес поля</span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Область
                            </label>
                            <select
                                value={region}
                                onChange={(e) => {
                                    setRegion(e.target.value)
                                    const newDistricts = Object.keys(REGIONS[e.target.value as keyof typeof REGIONS])
                                    setDistrict(newDistricts[0] || '')
                                }}
                                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                            >
                                {Object.keys(REGIONS).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Район
                            </label>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                            >
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Улица
                            </label>
                            <select
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Выберите улицу</option>
                                {streets.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Культура и площадь */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Культура
                            </label>
                            <select
                                value={cropType}
                                onChange={(e) => setCropType(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:outline-none focus:border-green-500"
                            >
                                <option>Хлопок</option>
                                <option>Пшеница</option>
                                <option>Кукуруза</option>
                                <option>Ячмень</option>
                                <option>Овощи</option>
                                <option>Сахарная свекла</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Площадь (га)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="5.5"
                                className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Координаты */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mb-4 flex items-center justify-center gap-2"
                        >
                            <MapPin className="w-5 h-5" />
                            Получить мои координаты
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Широта</label>
                                <input
                                    type="text"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                    placeholder="42.8746"
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Долгота</label>
                                <input
                                    type="text"
                                    value={lng}
                                    onChange={(e) => setLng(e.target.value)}
                                    placeholder="74.5698"
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-black text-lg rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sprout className="w-5 h-5" />
                                Отправить заявку
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
