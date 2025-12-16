import { Skeleton } from "@/components/ui/Skeleton"

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Skeleton */}
                <div className="hidden md:block col-span-1 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                </div>

                {/* Main Content Skeleton */}
                <div className="col-span-1 md:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 h-96">
                        <Skeleton className="h-8 w-48 mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-lg" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
