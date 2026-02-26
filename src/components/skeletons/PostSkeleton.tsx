import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const PostSkeleton = () => {
  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* Image placeholder */}
      <Skeleton className="w-full h-64 rounded-lg" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>

      {/* Stats */}
      <div className="space-y-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
};

export const PostGridSkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
    </div>
  );
};

export const PostListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
};
