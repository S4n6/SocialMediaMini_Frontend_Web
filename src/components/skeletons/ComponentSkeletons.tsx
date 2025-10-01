import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const StorySkeleton = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
};

export const FriendSuggestionSkeleton = () => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-16 h-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
        >
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotificationSkeleton = () => {
  return (
    <div className="space-y-1">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-3 p-3 hover:bg-gray-50"
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SearchSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2 p-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2 p-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
