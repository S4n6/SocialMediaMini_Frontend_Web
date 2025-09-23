import { Loading, LoadingSkeleton } from "@/components/ui/loading";

export default function FeedLoading() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header skeleton */}
      <LoadingSkeleton className="h-12 w-full" />

      {/* Post skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <LoadingSkeleton className="flex-1 h-4" />
          </div>
          <LoadingSkeleton className="h-64 w-full" />
          <LoadingSkeleton className="h-4 w-3/4" />
        </div>
      ))}

      <div className="text-center">
        <Loading variant="spinner" text="Loading posts..." />
      </div>
    </div>
  );
}
