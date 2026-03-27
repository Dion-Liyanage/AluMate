"use client";

import { Badge } from "@/components/ui/badge";

interface RepairStatusBadgeProps {
  status: string;
}

export function RepairStatusBadge({ status }: RepairStatusBadgeProps) {
  let badgeClasses = "bg-zinc-800 text-zinc-300 border-zinc-700";

  switch (status) {
    case "Draft":
      badgeClasses = "bg-zinc-800/50 text-zinc-400 border-zinc-700/50";
      break;
    case "Request Sent":
      badgeClasses = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      break;
    case "Under Review":
      badgeClasses = "bg-amber-500/20 text-amber-500 border-amber-500/30";
      break;
    case "Approved":
      badgeClasses = "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      break;
    case "In Progress":
      badgeClasses = "bg-blue-500/20 text-blue-500 border-blue-500/30";
      break;
    case "Completed":
      badgeClasses = "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
      break;
    case "Rejected":
      badgeClasses = "bg-red-500/20 text-red-500 border-red-500/30";
      break;
  }

  return (
    <Badge variant="outline" className={`${badgeClasses} font-medium tracking-wide shadow-sm py-1 px-3`}>
      {status}
    </Badge>
  );
}
