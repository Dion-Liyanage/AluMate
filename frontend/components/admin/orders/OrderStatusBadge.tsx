"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AdminOrderStatus = 
  | 'draft'
  | 'quotation_pending'
  | 'quotation_sent'
  | 'approved'
  | 'production'
  | 'material_purchasing'
  | 'installation'
  | 'completed'
  | 'cancelled';

interface OrderStatusBadgeProps {
  status: AdminOrderStatus;
  className?: string;
}

const statusConfig: Record<AdminOrderStatus, { label: string; className: string }> = {
  draft: { 
    label: "Draft", 
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" 
  },
  quotation_pending: { 
    label: "Quotation Pending", 
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20" 
  },
  quotation_sent: { 
    label: "Quotation Sent", 
    className: "bg-orange-500/15 text-orange-300 border-orange-500/30" 
  },
  approved: { 
    label: "Approved", 
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20" 
  },
  production: { 
    label: "In Production", 
    className: "bg-purple-500/15 text-purple-300 border-purple-500/30" 
  },
  material_purchasing: { 
    label: "Material Purchasing", 
    className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
  },
  installation: { 
    label: "Installation", 
    className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" 
  },
  completed: { 
    label: "Completed", 
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" 
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-red-500/10 text-red-400 border-red-500/20" 
  }
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.05)] transition-all",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
