import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

interface RestaurantCardSkeletonProps {
    className?: string
}

export default function RestaurantCardSkeleton({ className }: RestaurantCardSkeletonProps) {
    return (
        <div className={cn("rounded-xl overflow-hidden shadow-sm bg-white", className)}>
            {/* Image Skeleton */}
            <div className="relative aspect-[4/3] w-full">
                <Skeleton className="h-full w-full rounded-none" />
                {/* Category Badge Skeleton */}
                <Skeleton className="absolute top-3 left-3 h-6 w-12 rounded-full z-10" />
                {/* Heart Button Skeleton */}
                <Skeleton className="absolute top-3 right-3 h-8 w-8 rounded-full z-10" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4" />

                {/* Rating Row */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" /> {/* Star icon */}
                    <Skeleton className="h-4 w-8" /> {/* Rating score */}
                    <Skeleton className="h-4 w-12" /> {/* Review count */}
                </div>

                {/* Address Row */}
                <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" /> {/* MapPin icon */}
                    <Skeleton className="h-3.5 w-1/2" /> {/* Address */}
                </div>
            </div>
        </div>
    )
}
