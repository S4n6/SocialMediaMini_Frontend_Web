import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { GoHome, GoHomeFill } from "react-icons/go";
import { IoSearchOutline, IoSearch } from "react-icons/io5";
import { MdOutlineExplore, MdExplore } from "react-icons/md";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoIosNotificationsOutline, IoIosNotifications } from "react-icons/io";
import { MdAddCircleOutline, MdAddCircle } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import { PiMessengerLogo } from "react-icons/pi";
import { RiMessengerFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { useLogout } from "@/hooks";
import SearchDrawer from "./SearchDrawer";

const menuItems = [
  { icon: GoHome, filledIcon: GoHomeFill, label: "Home", id: 0, path: "/" },
  {
    icon: IoSearchOutline,
    filledIcon: IoSearch,
    label: "Search",
    id: 1,
    path: "/search",
  },
  {
    icon: MdOutlineExplore,
    filledIcon: MdExplore,
    label: "Explore",
    id: 2,
    path: "/explore",
  },
  { icon: TfiVideoClapper, label: "Reels", id: 3, path: "/reels" },
  {
    icon: PiMessengerLogo,
    filledIcon: RiMessengerFill,
    label: "Messages",
    id: 4,
    path: "/messages",
  },
  {
    icon: IoIosNotificationsOutline,
    filledIcon: IoIosNotifications,
    label: "Notifications",
    id: 5,
    path: "/notifications",
  },
  {
    icon: MdAddCircleOutline,
    filledIcon: MdAddCircle,
    label: "Create",
    id: 6,
    path: "/create",
  },
  { icon: CgDetailsMore, label: "More", id: 8 },
];

export default function LeftSideBar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  const isItemActive = (itemPath?: string) => {
    if (!itemPath) return false;
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
    // Immediately trigger logout (no confirmation)
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 h-screen p-4 flex flex-col gap-4 border-r border-gray-300 transition-all duration-300 z-10 overflow-y-auto bg-[var(--color-background)]",
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
            const active = isItemActive(item.path);
            // Prefer filledIcon when active (if provided)
            // @ts-ignore - dynamic icon component
            const Icon =
              active && (item as any).filledIcon
                ? (item as any).filledIcon
                : item.icon;

            if (item.label === "Search") {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={handleSearchClick}
                  data-search-toggle
                  className={cn(
                    "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
                    active ? "font-bold" : "",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                  <Icon
                    className={cn(
                      active
                        ? "w-7 h-7 fill-current text-foreground"
                        : "w-6 h-6 text-muted-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "ml-4",
                        active ? "text-base" : "text-sm text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            }

            if (item.label === "More") {
              return (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
                        active ? "font-bold" : "",
                        isCollapsed ? "justify-center" : ""
                      )}
                    >
                      <Icon
                        className={cn(
                          active
                            ? "w-7 h-7 fill-current text-foreground"
                            : "w-6 h-6 text-muted-foreground"
                        )}
                      />
                      {!isCollapsed && (
                        <span
                          className={cn(
                            "ml-4",
                            active
                              ? "text-base"
                              : "text-sm text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start" className="w-56 p-2">
                    <DropdownMenuItem className="px-2 py-1 border-none hover:bg-transparent focus:bg-transparent focus:text-inherit outline-none flex justify-between">
                      Theme
                      <ThemeToggle />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <div className="px-2 py-1">
                      <DropdownMenuItem
                        asChild
                        className="px-0 py-0 hover:bg-transparent focus:bg-transparent outline-none cursor-pointer"
                      >
                        <button
                          className="w-full text-left text-destructive"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? "Processing..." : "Log out"}
                        </button>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => item.path && router.push(item.path)}
                className={cn(
                  "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
                  active ? "font-bold" : "",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <Icon
                  className={cn(
                    active
                      ? "w-7 h-7 fill-current text-foreground"
                      : "w-6 h-6 text-muted-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "ml-4",
                      active ? "text-base" : "text-sm text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}

          <Button
            variant="ghost"
            className={cn(
              "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-all duration-200",
              isItemActive("/profile") &&
                "bg-accent border-l-4 border-blue-500 font-semibold",
              isCollapsed ? "justify-center" : ""
            )}
            onClick={() => router.push("/profile/me")}
          >
            <Avatar className={cn("w-6 h-6", !isCollapsed && "mr-4")}>
              <AvatarImage src="https://bit.ly/sage-adebayo" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {!isCollapsed && <span>Profile</span>}
          </Button>
        </nav>

        <div className="mt-auto" />
      </div>

      <SearchDrawer
        isOpen={isSearchOpen}
        isCollapsed={isCollapsed}
        onClose={handleCloseSearch}
      />
    </>
  );
}
