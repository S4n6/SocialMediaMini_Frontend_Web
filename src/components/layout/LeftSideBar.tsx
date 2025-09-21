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
import { LuSearch } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/theme-toggle";
import { FiLogOut } from "react-icons/fi";
import { useLogout } from "@/hooks";
import { Loading } from "@/components/ui/loading";

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
  { icon: "", label: "Profile", id: 7, path: "/profile" },
  { icon: CgDetailsMore, label: "More", id: 8, path: "/more" },
];

export default function LeftSideBar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isLogoutPopoverOpen, setIsLogoutPopoverOpen] = React.useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  // Function to check if a menu item is active based on current path
  const isItemActive = (itemPath: string) => {
    if (itemPath === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(itemPath);
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
    <div className="p-4 flex flex-col gap-4 min-h-screen border-r border-gray-300 dark:border-gray-600">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-400 bg-clip-text text-transparent font-serif tracking-tight">
          SocialMini
        </h1>
        <div className="w-16 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-400 mt-1 rounded-full"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.label === "Search") {
            return (
              <Popover
                key={item.id}
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "justify-start h-12 px-3 py-2 hover:bg-accent transition-colors",
                      isItemActive(item.path) &&
                        "bg-accent border-l-4 border-blue-500 font-semibold"
                    )}
                  >
                    <Icon className="w-6 h-6 mr-4" />
                    <span className="hidden lg:block">{item.label}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" side="right" align="start">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Search</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        ×
                      </Button>
                    </div>

                    <div className="relative mb-4">
                      <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search"
                        className="pl-10 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <Separator className="mb-4" />

                    <div>
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                        Recent
                      </h4>
                      <div className="space-y-2">
                        {mockUserSearchResults.map((user, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.username}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          if (item.label === "Profile") {
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-colors",
                    isItemActive(item.path) &&
                      "bg-accent border-l-4 border-blue-500 font-semibold"
                  )}
                >
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarImage src="https://bit.ly/sage-adebayo" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block">Profile</span>
                </Button>
              </Link>
            );
          }

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => router.push(item.path)}
              className={cn(
                "justify-start h-12 px-3 py-2 hover:bg-accent w-full transition-colors",
                isItemActive(item.path) &&
                  "bg-accent border-l-4 border-blue-500 font-semibold"
              )}
            >
              <Icon className="w-6 h-6 mr-4" />
              <span className="hidden lg:block">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div>
        <div>
          <Popover
            open={isLogoutPopoverOpen}
            onOpenChange={setIsLogoutPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="justify-start h-12 px-3 py-2 hover:bg-accent w-full text-destructive"
                onClick={() => setIsLogoutPopoverOpen(true)}
              >
                <FiLogOut className="w-6 h-6 mr-4" />
                <span className="hidden lg:block">Đăng xuất</span>
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
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
