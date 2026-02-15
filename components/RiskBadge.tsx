import { cn } from '@/lib/utils'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface RiskBadgeProps {
    score: number
    className?: string
}

export function RiskBadge({ score, className }: RiskBadgeProps) {
    let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100'
    let label = 'Low Risk'
    let dotClass = 'bg-emerald-500'

    if (score >= 80) {
        colorClass = 'bg-rose-50 text-rose-700 border-rose-100'
        label = 'Critical'
        dotClass = 'bg-rose-500'
    } else if (score >= 60) {
        colorClass = 'bg-orange-50 text-orange-700 border-orange-100'
        label = 'High Risk'
        dotClass = 'bg-orange-500'
    } else if (score >= 30) {
        colorClass = 'bg-amber-50 text-amber-700 border-amber-100'
        label = 'Medium'
        dotClass = 'bg-amber-500'
    }

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm',
                colorClass,
                className
            )}
        >
            <div className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotClass)} />
            {label} ({score}%)
        </div>
    )
}
