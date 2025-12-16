import { Skeleton } from "@/components/ui/Skeleton"

export default function ThemeCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
            {/* Image Area Skeleton */}
            <div className="relative h-48 w-full">
                <Skeleton className="h-full w-full rounded-none" />
                <Skeleton className="absolute bottom-3 right-3 h-6 w-20 rounded-full" />
            </div>

            {/* Content Area Skeleton */}
            <div className="p-5 flex-1 flex flex-col space-y-3">
                <Skeleton className="h-6 w-3/4 mb-2" />

                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    {/* User Info */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                </div>
            </div>
        </div>
    )
}
