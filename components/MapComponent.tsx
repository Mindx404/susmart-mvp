'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

const LeafletMap = dynamic(() => import('./map/LeafletMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700">
            <p className="text-zinc-400 font-medium">Loading Map...</p>
        </div>
    ),
})

export default LeafletMap
