import { Skeleton } from "@/components/ui/Skeleton"

export default function MyPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Hero Skeleton */}
            <div className="relative bg-gray-200 h-80 pb-12">
                <div className="relative max-w-4xl mx-auto px-4 py-8 pt-24 h-full flex flex-col md:flex-row items-center md:items-end gap-6">
                    <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white" />
                    <div className="flex-1 text-center md:text-left mb-2 space-y-2">
                        <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                    </div>
                    <div className="flex gap-3 mt-6 md:mt-0">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="w-20 h-20 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-8">
                {/* Quick Links Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>

                {/* Content Area Skeleton */}
                <div className="space-y-4">
                    <div className="flex justify-center gap-4 py-2">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-10 w-24 rounded-full" />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 h-32">
                                <Skeleton className="w-24 h-full rounded-lg" />
                                <div className="flex-1 space-y-2 py-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4 mt-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
