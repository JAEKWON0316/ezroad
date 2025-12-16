import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

export default function ReviewCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
            {/* Review Image Skeleton */}
            <div className="relative h-56 w-full">
                <Skeleton className="h-full w-full rounded-none" />
                {/* Badge Skeletons */}
                <Skeleton className="absolute top-3 left-3 h-6 w-20 rounded-lg" />
                <Skeleton className="absolute bottom-3 right-3 h-6 w-12 rounded-lg" />
            </div>

            {/* Content Area Skeleton */}
            <div className="p-5 flex-1 flex flex-col space-y-3">
                {/* Restaurant Name */}
                <Skeleton className="h-7 w-3/4 mb-2" />

                {/* Review Title & Content */}
                <Skeleton className="h-5 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Footer: User & Date */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-2 w-20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
