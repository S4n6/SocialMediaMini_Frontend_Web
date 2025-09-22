import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { GoHome } from "react-icons/go";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdAddCircleOutline } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import { PiMessengerLogo } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { FiLogOut } from "react-icons/fi";
import { useLogout } from "@/hooks";
import { Loading } from "@/components/ui/loading";
import SearchDrawer from "./SearchDrawer";

const menuItems = [
  { icon: GoHome, label: "Home", id: 0, path: "/" },
  { icon: IoSearchOutline, label: "Search", id: 1, path: "/search" },
  { icon: MdOutlineExplore, label: "Explore", id: 2, path: "/explore" },
  { icon: TfiVideoClapper, label: "Reels", id: 3, path: "/reels" },
  { icon: PiMessengerLogo, label: "Messages", id: 4, path: "/messages" },
  {
    icon: IoIosNotificationsOutline,
    label: "Notifications",
    id: 5,
    path: "/notifications",
  },
  { icon: MdAddCircleOutline, label: "Create", id: 6, path: "/create" },
  { icon: CgDetailsMore, label: "More", id: 8, path: "/more" },
];

export default function LeftSideBar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isLogoutPopoverOpen, setIsLogoutPopoverOpen] = React.useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  const isItemActive = (itemPath: string) => {
    if (itemPath === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(itemPath);
  };

  const handleSearchClick = () => {
    console.log("Search clicked", isSearchOpen);
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setIsCollapsed(false);
    } else {
      setIsSearchOpen(true);
      setIsCollapsed(true);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setIsCollapsed(false);
  };

  const handleLogout = () => {
    try {
      setIsLogoutPopoverOpen(false);
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLogoutPopoverOpen(true);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 h-screen p-4 bg-background flex flex-col gap-4 border-r border-gray-300 transition-all duration-300 z-10 overflow-y-auto",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="mb-8">
          {!isCollapsed ? (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-400 bg-clip-text text-transparent font-serif tracking-tight">
                SocialMini
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-400 mt-1 rounded-full"></div>
            </>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-400 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.label === "Search") {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={handleSearchClick}
                  data-search-toggle
                  className={cn(
                    "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
                    isItemActive(item.path) &&
                      "bg-accent border-l-4 border-blue-500 font-semibold",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {!isCollapsed && <span className="ml-4">{item.label}</span>}
                </Button>
              );
            }

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => router.push(item.path)}
                className={cn(
                  "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
                  isItemActive(item.path) &&
                    "bg-accent border-l-4 border-blue-500 font-semibold",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <Icon className="w-6 h-6" />
                {!isCollapsed && <span className="ml-4">{item.label}</span>}
              </Button>
            );
          })}

          <Link href="/profile">
            <Button
              variant="ghost"
              className={cn(
                "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
                isItemActive("/profile") &&
                  "bg-accent border-l-4 border-blue-500 font-semibold",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Avatar className={cn("w-6 h-6", !isCollapsed && "mr-4")}>
                <AvatarImage src="https://bit.ly/sage-adebayo" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {!isCollapsed && <span>Profile</span>}
            </Button>
          </Link>
        </nav>

        <div className="mt-auto">
          <div>
            <Popover
              open={isLogoutPopoverOpen}
              onOpenChange={setIsLogoutPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start h-12 px-3 py-2 hover:bg-accent w-full text-destructive transition-all duration-200",
                    isCollapsed ? "justify-center" : ""
                  )}
                  onClick={() => setIsLogoutPopoverOpen(true)}
                >
                  <FiLogOut className="w-6 h-6" />
                  {!isCollapsed && <span className="ml-4">Đăng xuất</span>}
                </Button>
              </PopoverTrigger>

              <PopoverContent side="right" align="start" className="w-60 p-3">
                <div className="flex flex-col gap-3">
                  <p className="text-sm">Bạn có chắc muốn đăng xuất?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsLogoutPopoverOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="flex-1 text-white"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center gap-2">
                          <Loading size="sm" variant="spinner" />
                          Đang xử lý...
                        </div>
                      ) : (
                        "Đăng xuất"
                      )}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className={cn("mt-4", isCollapsed && "flex justify-center")}>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <SearchDrawer
        isOpen={isSearchOpen}
        isCollapsed={isCollapsed}
        onClose={handleCloseSearch}
      />
    </>
  );
}
