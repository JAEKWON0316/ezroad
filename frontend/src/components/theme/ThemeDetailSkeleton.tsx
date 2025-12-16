import { Skeleton } from "@/components/ui/Skeleton"
import { ChevronLeft } from "lucide-react"

export default function ThemeDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Header Skeleton */}
            <div className="relative bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                    <div className="flex gap-4 mb-6">
                        <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-full mb-6" />

                    {/* User Info & Stats */}
                    <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-[1px] bg-gray-200 mx-2" />
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-24 rounded-lg" />
                            <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
