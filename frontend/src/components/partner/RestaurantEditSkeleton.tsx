import { Skeleton } from "@/components/ui/Skeleton"
import { ChevronLeft } from "lucide-react"

export default function RestaurantEditSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-100">
                            <ChevronLeft className="h-6 w-6 text-gray-300" />
                        </div>
                        <Skeleton className="h-8 w-40" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-9 w-24 hidden md:block" />
                        <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Images */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl space-y-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-6 w-24" />
                                </div>

                                <div>
                                    <Skeleton className="h-5 w-20 mb-2" />
                                    <Skeleton className="w-full aspect-video rounded-xl" />
                                </div>
                                <div>
                                    <Skeleton className="h-5 w-20 mb-2" />
                                    <Skeleton className="w-full aspect-[3/4] rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white p-6 rounded-2xl space-y-6 border border-gray-100">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white p-6 rounded-2xl space-y-6 border border-gray-100">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-1/3 rounded-xl" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                    <Skeleton className="h-12 w-full rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
