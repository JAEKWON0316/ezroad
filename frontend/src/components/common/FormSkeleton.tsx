'use client';

export default function FormSkeleton({ title = true }: { title?: boolean }) {
    return (
        <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            {title && (
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-48 bg-gray-200 rounded-lg" />
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Form Groups */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <div className="h-5 w-24 bg-gray-200 rounded-lg" />
                        <div className="h-12 w-full bg-gray-200 rounded-xl" />
                    </div>
                ))}
            </div>

            {/* Button Skeleton */}
            <div className="h-14 w-full bg-gray-200 rounded-xl" />
        </div>
    );
}
