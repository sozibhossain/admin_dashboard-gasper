"use client";

import { Bell, CircleDashed, Menu, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { data } = useSession();
  const initials = data?.user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-[#d3dfed] bg-[#dbe8f7]">
      <div className="flex h-[76px] items-center justify-between gap-3 px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:block" />

        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <div className="relative w-[170px] md:w-[190px] lg:w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#818a98]" />
            <Input placeholder="Search" className="h-10 pl-9 text-[16px]" />
          </div>

          <Button variant="default" size="icon" className="h-9 w-9 rounded-full bg-[#1f73e8]">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-[#4f5965] bg-transparent">
            <CircleDashed className="h-4 w-4 text-[#4f5965]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border border-[#8ea0ba] p-0.5">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={undefined} alt="profile" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-[16px] text-[#5f6671]">{data?.user?.email || "admin"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
