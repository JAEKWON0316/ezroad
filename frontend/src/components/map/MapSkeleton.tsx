import { Skeleton } from "@/components/ui/Skeleton"

export default function MapSkeleton() {
    return (
        <div className="h-[calc(100vh-64px)] relative bg-gray-100 flex overflow-hidden">
            {/* Search Bar Skeleton */}
            <div className="absolute top-4 left-4 right-4 md:left-8 md:right-auto md:w-96 z-10">
                <div className="h-10 bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 flex items-center p-2">
                    <Skeleton className="h-5 w-5 rounded-full ml-2" />
                    <Skeleton className="h-4 w-40 ml-2" />
                </div>
            </div>

            {/* Theme Toggle Skeleton */}
            <div className="absolute top-20 left-4 md:left-8 z-10">
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            {/* Sidebar Skeleton (Visible for desktop look) */}
            <div className="hidden md:block absolute top-0 left-0 h-full w-96 bg-white z-20 border-r">
                <div className="p-5 border-b border-gray-100 flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex p-2 gap-2 bg-gray-50">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                </div>
                <div className="p-2 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Area Placeholder */}
            <div className="w-full h-full bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    )
}
