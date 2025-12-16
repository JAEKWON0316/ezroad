import { Skeleton } from "@/components/ui/Skeleton"

export default function RestaurantDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Hero Image Skeleton */}
            <div className="relative h-[45vh] lg:h-[50vh] w-full overflow-hidden bg-gray-200">
                <Skeleton className="h-full w-full rounded-none" />

                {/* Title Texture Skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 container mx-auto max-w-5xl">
                    <Skeleton className="h-6 w-16 rounded-full mb-3" /> {/* Category */}
                    <Skeleton className="h-10 md:h-14 w-2/3 mb-2" /> {/* Title */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-24 rounded-lg" /> {/* Rating */}
                        <Skeleton className="h-4 w-1 bg-white/30 mx-1" />
                        <Skeleton className="h-5 w-40" /> {/* Address */}
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 -mt-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 min-h-[500px]">
                    {/* Sticky Tabs Skeleton */}
                    <div className="sticky top-[60px] md:top-[70px] bg-white border-b border-gray-100 rounded-t-3xl p-0">
                        <div className="flex">
                            <div className="flex-1 py-4 flex justify-center"><Skeleton className="h-6 w-12" /></div>
                            <div className="flex-1 py-4 flex justify-center"><Skeleton className="h-6 w-12" /></div>
                            <div className="flex-1 py-4 flex justify-center"><Skeleton className="h-6 w-16" /></div>
                        </div>
                    </div>

                    {/* Tab Content Skeleton (Modeling 'Info' tab primarily) */}
                    <div className="p-6 md:p-8 space-y-8">
                        {/* Notice Skeleton */}
                        <div className="bg-gray-50 rounded-2xl p-5 flex gap-3 items-start">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-24 mb-1" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                        </div>

                        {/* Description Skeleton */}
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-16" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>

                        {/* Info Grid Skeleton */}
                        <div>
                            <Skeleton className="h-6 w-24 mb-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-3 w-10" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
