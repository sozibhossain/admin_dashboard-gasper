"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DASHBOARD_NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      <aside className="flex h-full w-full flex-col border-r border-[#d6dee8] bg-[#dbe8f7]">
        <div className="px-6 py-5">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="text-[24px] font-semibold tracking-[0.18em] text-[#101820] md:text-[28px]"
          >
            {APP_NAME}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-sm px-3 text-[16px] font-medium text-[#535b66] transition-colors",
                  isActive && "bg-[#1f73e8] !text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-2">
          <button
            className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-[16px] font-medium text-[#e10000] hover:bg-[#f5dfe0]"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Logout</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to log out from this admin panel?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:grid sm:grid-cols-2 sm:gap-3">
            <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
              Yes
            </Button>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
