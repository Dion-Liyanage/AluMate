"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type OrderStatus = 
  | "draft"
  | "pending" 
  | "quotation_sent" 
  | "approved" 
  | "production" 
  | "installation" 
  | "completed" 
  | "cancelled";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  draft: { 
    label: "Draft", 
    className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" 
  },
  pending: { 
    label: "Pending", 
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse-subtle" 
  },
  quotation_sent: { 
    label: "Quotation Sent", 
    className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
  },
  approved: { 
    label: "Approved", 
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30" 
  },
  production: { 
    label: "In Production", 
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30" 
  },
  installation: { 
    label: "Installing", 
    className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" 
  },
  completed: { 
    label: "Completed", 
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-red-500/20 text-red-400 border-red-500/30" 
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-all",
        config.className,
        className
      )}
    >
      <span className="relative flex h-2 w-2 mr-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          config.className.split(' ')[1].replace('text-', 'bg-')
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          config.className.split(' ')[1].replace('text-', 'bg-')
        )}></span>
      </span>
      {config.label}
    </Badge>
  );
}
