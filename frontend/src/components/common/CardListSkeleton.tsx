import { Skeleton } from "@/components/ui/Skeleton"

interface CardListSkeletonProps {
    viewMode?: 'grid' | 'list'; // grid for Favorites, list for Reservations/Reviews
    count?: number;
}

export default function CardListSkeleton({ viewMode = 'grid', count = 6 }: CardListSkeletonProps) {
    return (
        <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${viewMode === 'list' ? 'flex p-4 gap-4' : ''}`}>

                    {/* Thumbnail */}
                    <div className={viewMode === 'list' ? "w-24 h-24 flex-shrink-0" : "h-40"}>
                        <Skeleton className="w-full h-full rounded-lg" />
                    </div>

                    {/* Content */}
                    <div className={`flex flex-col justify-center ${viewMode === 'list' ? 'flex-1' : 'p-4 space-y-2'}`}>
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2 mb-2" />
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
