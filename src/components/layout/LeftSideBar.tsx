import React from "react";
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

export default function LeftSideBar() {
  const [isActive, setIsActive] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const menuItems = [
    { icon: GoHome, label: "Home", id: 0 },
    { icon: IoSearchOutline, label: "Search", id: 1 },
    { icon: MdOutlineExplore, label: "Explore", id: 2 },
    { icon: TfiVideoClapper, label: "Reels", id: 3 },
    { icon: PiMessengerLogo, label: "Messages", id: 4 },
    { icon: IoIosNotificationsOutline, label: "Notifications", id: 5 },
    { icon: MdAddCircleOutline, label: "Create", id: 6 },
  ];

  return (
    <div className="bg-background p-4 flex flex-col gap-4 min-h-screen border-r border-border">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">SocialMini</h1>
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
                      "justify-start h-12 px-3 py-2 hover:bg-accent",
                      isActive === item.id && "bg-accent"
                    )}
                    onClick={() => setIsActive(item.id)}
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

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "justify-start h-12 px-3 py-2 hover:bg-accent",
                isActive === item.id && "bg-accent"
              )}
              onClick={() => setIsActive(item.id)}
            >
              <Icon className="w-6 h-6 mr-4" />
              <span className="hidden lg:block">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="mt-auto">
        <div>
          <Separator className="mb-4" />
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          className="justify-start h-12 px-3 py-2 hover:bg-accent w-full"
        >
          <Avatar className="w-6 h-6 mr-4">
            <AvatarImage src="https://bit.ly/sage-adebayo" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span className="hidden lg:block">Profile</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start h-12 px-3 py-2 hover:bg-accent w-full"
        >
          <CgDetailsMore className="w-6 h-6 mr-4" />
          <span className="hidden lg:block">More</span>
        </Button>
      </div>
    </div>
  );
}
