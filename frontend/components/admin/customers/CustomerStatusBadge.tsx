"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CustomerStatusBadgeProps {
  status: string;
  className?: string;
}

export function CustomerStatusBadge({ status, className }: CustomerStatusBadgeProps) {
  const isActive = status?.toLowerCase() === "active";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 border",
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-zinc-700/20 text-zinc-500 border-zinc-600/30",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
          isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
        )}
      />
      {status || "Unknown"}
    </Badge>
  );
}
