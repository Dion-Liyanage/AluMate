"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  FileText,
  Loader2,
  Package,
  Settings,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOTIFICATIONS_CHANGED_EVENT } from "@/components/layout/TopNav";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

const PAGE_SIZE = 20;

const TYPE_ICONS: Record<Notification["type"], typeof Bell> = {
  order: Package,
  quotation: FileText,
  service: Wrench,
  system: Settings,
};

type Filter = "all" | "unread";

function announceChange() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export default function NotificationList() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      try {
        const res = await notificationsApi.getAll({
          page: nextPage,
          limit: PAGE_SIZE,
          ...(filter === "unread" ? { isRead: false } : {}),
        });
        const list = res.data?.notifications ?? [];
        setItems((prev) => (append ? [...prev, ...list] : list));
        setTotal(res.data?.total ?? 0);
        setPage(nextPage);
      } catch {
        toast.error("Couldn't load notifications");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const hasUnread = items.some((n) => !n.isRead);

  const handleOpen = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) =>
        filter === "unread"
          ? prev.filter((x) => x._id !== n._id)
          : prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)),
      );
      if (filter === "unread") setTotal((t) => Math.max(0, t - 1));
      try {
        await notificationsApi.markAsRead(n._id);
        announceChange();
      } catch {
        // Non-blocking: still navigate.
      }
    }
    if (n.linkTo) router.push(n.linkTo);
  };

  const handleMarkAll = async () => {
    setIsMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      announceChange();
      if (filter === "unread") {
        setItems([]);
        setTotal(0);
      } else {
        setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      }
    } catch {
      toast.error("Couldn't mark notifications as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={!hasUnread || isMarkingAll}
          className="border-zinc-700 text-zinc-300 hover:text-white"
        >
          {isMarkingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-4 w-4" />
          )}
          Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-zinc-800/60" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-3 h-10 w-10 text-zinc-600" />
            <p className="font-medium text-zinc-300">
              {filter === "unread" ? "You're all caught up" : "No notifications yet"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Updates about your orders and quotations will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => handleOpen(n)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                    n.isRead
                      ? "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70"
                      : "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      n.isRead ? "bg-zinc-800 text-zinc-400" : "bg-emerald-500/20 text-emerald-300",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          "font-medium",
                          n.isRead ? "text-zinc-300" : "text-zinc-100",
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                      aria-label="Unread"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && items.length < total && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            onClick={() => load(page + 1, true)}
            disabled={isLoadingMore}
            className="text-zinc-400 hover:text-white"
          >
            {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
