'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapMarker {
    id: string
    lat: number
    lng: number
    label?: string
    status?: string
    riskScore?: number
}

interface Canal {
    id: string | number
    name: string
    type?: string
    path: [number, number][]
}

interface LeafletMapProps {
    center?: [number, number]
    zoom?: number
    markers?: MapMarker[]
    canals?: Canal[]
    onMapClick?: (lat: number, lng: number) => void
    interactive?: boolean
}

export default function LeafletMap({
    center = [42.8746, 74.5698],
    zoom = 10,
    markers = [],
    canals = [],
    onMapClick,
    interactive = true,
}: LeafletMapProps) {
    const [realCanals, setRealCanals] = useState<Canal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        fetch('/data/kyrgyzstan-canals.json')
            .then(res => res.json())
            .then(data => {
                console.log('✅ Загружено каналов из OSM:', data.length)
                setRealCanals(data)
                setLoading(false)
            })
            .catch(err => {
                console.log('⚠️ Файл с каналами не найден, используем моковые данные')
                setLoading(false)
            })
    }, [])

    const displayCanals = realCanals.length > 0 ? realCanals : canals

    const getCanalColor = (type?: string) => {
        switch (type) {
            case 'canal': return '#0ea5e9'
            case 'drain': return '#06b6d4'
            default: return '#3b82f6'
        }
    }

    const getCanalWeight = (pathLength: number) => {
        if (pathLength > 50) return 5
        if (pathLength > 20) return 4
        return 3
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', borderRadius: '0' }}
            zoomControl={interactive}
            scrollWheelZoom={interactive}
        >
            { }
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />

            { }
            {displayCanals.map((canal: Canal, index: number) => {
                const color = getCanalColor(canal.type)
                const weight = getCanalWeight(canal.path.length)

                return (
                    <Polyline
                        key={`canal-${canal.id || index}`}
                        positions={canal.path}
                        pathOptions={{
                            color: color,
                            weight: weight,
                            opacity: 0.8,
                            lineCap: 'round',
                            lineJoin: 'round',
                            dashArray: canal.type === 'drain' ? '5, 10' : undefined
                        }}
                    >
                        <Popup>
                            <div className="p-2">
                                <p className="font-bold text-blue-700">{canal.name}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {canal.type === 'canal' ? '🌊 Канал' : '💧 Дренаж'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Длина: ~{(canal.path.length * 0.1).toFixed(1)} км
                                </p>
                            </div>
                        </Popup>
                    </Polyline>
                )
            })}

            { }
            {markers.map((marker: MapMarker) => {
                let fillColor = '#10b981'
                let strokeColor = '#059669'

                if (marker.riskScore !== undefined) {
                    if (marker.riskScore >= 80) {
                        fillColor = '#ef4444'
                        strokeColor = '#dc2626'
                    } else if (marker.riskScore > 50) {
                        fillColor = '#f59e0b'
                        strokeColor = '#d97706'
                    }
                }

                return (
                    <CircleMarker
                        key={marker.id}
                        center={[marker.lat, marker.lng]}
                        radius={8}
                        pathOptions={{
                            fillColor: fillColor,
                            color: strokeColor,
                            weight: 3,
                            opacity: 1,
                            fillOpacity: 0.8
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <p className="font-bold text-slate-900">{marker.label}</p>
                                {marker.status && (
                                    <p className="text-xs uppercase tracking-wider text-slate-500 mt-1">
                                        {marker.status === 'pending' ? '⏳ В ожидании' : '✅ Одобрено'}
                                    </p>
                                )}
                                {marker.riskScore !== undefined && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-600">Риск:</span>
                                        <span className={`text-sm font-black ${marker.riskScore >= 80 ? 'text-red-600' :
                                            marker.riskScore > 50 ? 'text-amber-600' : 'text-green-600'
                                            }`}>
                                            {marker.riskScore}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                )
            })}

            { }
            {loading && (
                <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                        <p className="text-xs font-medium text-blue-600">🌍 Загрузка каналов...</p>
                    </div>
                </div>
            )}

            { }
            {!loading && displayCanals.length > 0 && (
                <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '30px', marginLeft: '10px' }}>
                    <div className="bg-white px-4 py-3 rounded-xl shadow-xl border-2 border-slate-100">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Легенда</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 bg-blue-500 rounded"></div>
                                <span className="text-xs font-medium text-slate-600">Каналы ({displayCanals.filter(c => c.type === 'canal').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 bg-cyan-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #06b6d4 0, #06b6d4 5px, transparent 5px, transparent 10px)' }}></div>
                                <span className="text-xs font-medium text-slate-600">Дренаж ({displayCanals.filter(c => c.type === 'drain').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-red-700"></div>
                                <span className="text-xs font-medium text-slate-600">Высокий риск</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-amber-700"></div>
                                <span className="text-xs font-medium text-slate-600">Средний риск</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-700"></div>
                                <span className="text-xs font-medium text-slate-600">Низкий риск</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MapContainer>
    )
}
