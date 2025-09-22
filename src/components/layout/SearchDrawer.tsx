import React from "react";
import { useRouter } from "next/navigation";
import { LuSearch } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const mockUserSearchResults = [
  {
    name: "Segun Adebayo",
    username: "segun.adebayo",
    avatarUrl: "https://bit.ly/sage-adebayo",
  },
  {
    name: "Jane Doe",
    username: "jane.doe",
    avatarUrl: "https://bit.ly/jane-doe",
  },
  {
    name: "John Smith",
    username: "john.smith",
    avatarUrl: "https://bit.ly/john-smith",
  },
];

interface SearchDrawerProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export default function SearchDrawer({
  isOpen,
  isCollapsed,
  onClose,
}: SearchDrawerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close drawer
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore clicks that originate from the search toggle (so clicking the search button
      // doesn't immediately re-open the drawer after an outside-click close).
      const target = event.target as HTMLElement | null;
      if (target) {
        const toggleEl =
          target.closest && target.closest("[data-search-toggle]");
        if (toggleEl) return;
      }

      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Search Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 left-0 bg-background h-screen z-20 border-r border-gray-200 w-96 transition-all duration-300 ease-in-out overflow-y-auto",
          isOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none"
        )}
        style={{
          left: isCollapsed ? "80px" : "256px",
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tìm kiếm</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0"
            >
              <IoClose className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm"
              className="pl-10 rounded-lg border py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
              >
                <IoClose className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Recent Searches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Mới đây</h3>
              <Button
                variant="ghost"
                className="text-blue-500 text-sm p-0 h-auto"
              >
                Xóa tất cả
              </Button>
            </div>

            <div className="space-y-1">
              {mockUserSearchResults.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                  onClick={() => router.push(`/profile/${user.username}`)}
                >
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Remove from recent");
                    }}
                  >
                    <IoClose className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
