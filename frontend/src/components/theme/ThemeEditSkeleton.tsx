import { Skeleton } from "@/components/ui/Skeleton"
import { ChevronLeft } from "lucide-react"

export default function ThemeEditSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>

                <div className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <div className="flex gap-4">
                            <Skeleton className="w-24 h-24 rounded-xl" />
                            <Skeleton className="h-10 w-32 self-center rounded-lg" />
                        </div>
                    </div>

                    {/* Restaurant Search & List Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <div className="flex gap-2">
                            <Skeleton className="h-12 flex-1 rounded-xl" />
                            <Skeleton className="h-12 w-24 rounded-xl" />
                        </div>

                        <div className="space-y-2 mt-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-3 border rounded-xl bg-gray-50">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                    <Skeleton className="w-8 h-8 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
