"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { notificationsApi } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** Fired by the notifications page after marking items read so the badge refreshes. */
export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

interface TopNavProps {
  title: string;
  onMenuToggle: () => void;
}

export function TopNav({ title, onMenuToggle }: TopNavProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(() => {
    if (!user) return;
    notificationsApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data?.count ?? 0))
      .catch(() => {
        // Badge is non-critical; keep the last known value.
      });
  }, [user]);

  // Refresh on login, on navigation, every minute, and when the list page changes read state.
  useEffect(refreshUnread, [refreshUnread, pathname]);

  useEffect(() => {
    const interval = setInterval(refreshUnread, 60_000);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnread);
    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refreshUnread);
    };
  }, [refreshUnread]);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Link href="/notifications" aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 flex items-center justify-center text-[10px] bg-red-500 border-zinc-950"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <Avatar className="h-8 w-8 border border-zinc-700">
                  <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-200 text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-900 border-zinc-700"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
