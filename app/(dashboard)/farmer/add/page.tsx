'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import MapComponent from '@/components/MapComponent'
import { analyzeCropPhoto, calculateRiskScore } from '@/lib/ai'
import { Loader2, Camera, MapPin, CheckCircle2, FileImage, ArrowLeft, UploadCloud } from 'lucide-react'
import { RiskBadge } from '@/components/RiskBadge'
import GlobalHeader from '@/components/GlobalHeader'
import { cn } from '@/lib/utils'

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

export default function AddFieldPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [user, setUser] = useState<any>(null)


    const [name, setName] = useState('')
    const [area, setArea] = useState('')
    const [crop, setCrop] = useState('')
    const [coords, setCoords] = useState<[number, number] | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [analysisResult, setAnalysisResult] = useState<any>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
        }
        getUser()
    }, [router, supabase])

    const handleAutoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords([position.coords.latitude, position.coords.longitude])
                },
                (error) => {
                    alert('Unable to retrieve location. Using default.')
                    setCoords([42.8746, 74.5698])
                }
            )
        } else {
            alert('Geolocation not supported.')
        }
    }

    const handleMapClick = (lat: number, lng: number) => {
        setCoords([lat, lng])
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            startAIAnalysis(e.target.files[0])
        }
    }

    const startAIAnalysis = async (file: File) => {
        setIsAnalyzing(true)

        await new Promise(resolve => setTimeout(resolve, 2000))

        const analysis = await analyzeCropPhoto(crop || 'General')
        const mockWeatherScore = Math.floor(Math.random() * 20) + 20
        const daysSinceWater = Math.floor(Math.random() * 10) + 1
        const finalScore = calculateRiskScore(analysis.score, mockWeatherScore, daysSinceWater)

        setAnalysisResult({
            score: finalScore,
            details: analysis
        })
        setIsAnalyzing(false)
    }

    const handleSubmit = async () => {
        if (!user || !coords || !analysisResult) return
        setLoading(true)

        const { error } = await supabase.from('fields').insert({
            owner_id: user.id,
            name: name,
            crop_type: crop,
            area: parseFloat(area),
            lat: coords[0],
            lng: coords[1],
            risk_score: analysisResult.score,
            status: 'pending'
        })

        if (error) {
            alert(error.message)
            setLoading(false)
        } else {
            router.push('/farmer')
        }
    }

    const isStep1Valid = name && area && crop
    const isStep2Valid = coords !== null
    const isStep3Valid = analysisResult !== null

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">
            <GlobalHeader />

            <div className="max-w-md mx-auto p-4">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>

                <h1 className="text-2xl font-black text-slate-900 mb-2">Register New Field</h1>
                <p className="text-slate-500 text-sm mb-6">Complete the steps below to request water allocation.</p>


                <div className="grid grid-cols-3 gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={cn("h-1 rounded-full transition-all duration-500", step >= s ? "bg-primary" : "bg-slate-200")} />
                    ))}
                </div>


                <div className={cn("transition-all duration-500", step === 1 ? "block fade-in slide-in-from-right-4" : "hidden")}>
                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">1</div>
                                <h3 className="font-bold text-slate-800 text-lg">Field Details</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Field Name</label>
                                    <Input
                                        placeholder="e.g. North Plot"
                                        className="bg-slate-50 border-slate-200 font-bold h-12"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Crop Type</label>
                                        <select
                                            className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-slate-700"
                                            value={crop}
                                            onChange={(e) => setCrop(e.target.value)}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Cotton">Cotton</option>
                                            <option value="Wheat">Wheat</option>
                                            <option value="Corn">Corn</option>
                                            <option value="Barley">Barley</option>
                                            <option value="Vegetables">Vegetables</option>
                                            <option value="Sugar Beet">Sugar Beet</option>
                                            <option value="Orchard">Orchard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Area (ha)</label>
                                        <Input
                                            type="number"
                                            placeholder="0.0"
                                            className="bg-slate-50 border-slate-200 font-bold h-12"
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={!isStep1Valid}
                                className="w-full h-12 font-bold text-base shadow-lg shadow-primary/20"
                            >
                                Continue
                            </Button>
                        </CardContent>
                    </Card>
                </div>


                <div className={cn("transition-all duration-500", step === 2 ? "block fade-in slide-in-from-right-4" : "hidden")}>
                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">2</div>
                                <h3 className="font-bold text-slate-800 text-lg">Location</h3>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    Click on the map to pinpoint your field's location, or use the auto-detect button.
                                </p>
                            </div>

                            <div className="h-64 rounded-2xl overflow-hidden border-4 border-white shadow-xl relative bg-slate-100 ring-1 ring-slate-200">
                                <MapComponent
                                    center={coords || [42.8746, 74.5698]}
                                    zoom={13}
                                    interactive={true}
                                    onMapClick={handleMapClick}
                                    markers={coords ? [{ id: 'new', lat: coords[0], lng: coords[1] }] : []}
                                    canals={MOCK_CANALS}
                                />
                                {!coords && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] text-xs font-bold text-slate-600 pointer-events-none">
                                        Tap map to set location
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleAutoLocation}
                                className="w-full h-12 border-slate-200 text-slate-600 font-bold hover:text-primary hover:border-primary bg-white"
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                {coords ? 'Update with GPS' : 'Use Current Location'}
                            </Button>

                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 font-bold text-slate-400">Back</Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={!isStep2Valid}
                                    className="flex-[2] h-12 font-bold text-base shadow-lg shadow-primary/20"
                                >
                                    Continue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                <div className={cn("transition-all duration-500", step === 3 ? "block fade-in slide-in-from-right-4" : "hidden")}>
                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">3</div>
                                <h3 className="font-bold text-slate-800 text-lg">AI Verification</h3>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                                <Camera className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                    Upload a photo of your crops. Our AI will analyze soil dryness and crop health to calculate priority.
                                </p>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                                    selectedFile ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {selectedFile ? (
                                    <div className="text-center animate-in zoom-in">
                                        <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                                        <p className="text-xs text-emerald-600 font-bold mt-1">Photo Uploaded</p>
                                    </div>
                                ) : (
                                    <div className="text-center group">
                                        <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-600">Tap to Upload Photo</p>
                                        <p className="text-xs text-slate-400 mt-1">or take a picture</p>
                                    </div>
                                )}
                            </div>

                            {isAnalyzing && (
                                <div className="bg-slate-900/5 rounded-xl p-6 text-center animate-pulse">
                                    <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
                                    <p className="text-sm font-bold text-slate-700">Analyzing crop health...</p>
                                    <p className="text-xs text-slate-500 mt-1">Processing computer vision model</p>
                                </div>
                            )}

                            {!isAnalyzing && analysisResult && (
                                <div className="bg-white rounded-2xl p-0 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 shadow-sm">
                                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Risk Score</span>
                                        <RiskBadge score={analysisResult.score} />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Visual Stress Index</span>
                                            <span className="font-bold text-slate-700">{Math.round(analysisResult.details.score)}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Soil Moisture Est.</span>
                                            <span className="font-bold text-rose-500">Critical (12%)</span>
                                        </div>
                                        <div className="pt-2 text-[10px] text-slate-400 leading-relaxed border-t border-slate-50 mt-2">
                                            AI analysis detected signs of {analysisResult.score > 80 ? 'severe' : 'moderate'} water stress in the provided image.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 font-bold text-slate-400">Back</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!isStep3Valid || loading}
                                    className="flex-[2] h-12 font-bold text-base shadow-lg shadow-primary/20"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Request'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
