"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuotationStatusBadgeProps {
  status: string;
  className?: string;
}

export function QuotationStatusBadge({ status, className }: QuotationStatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "revision_requested":
      case "draft":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]";
      case "pending_approval":
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
      case "approved":
      case "accepted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
      case "rejected":
      case "declined":
        return "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
      case "expired":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 shadow-[0_0_10px_rgba(113,113,122,0.1)]";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-3 py-1 rounded-full font-medium transition-all duration-300",
        getStatusStyles(status),
        className
      )}
    >
      <span className="relative flex h-2 w-2 mr-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          status.toLowerCase() === 'approved' ? 'bg-emerald-400' : 
          status.toLowerCase() === 'pending' || status.toLowerCase() === 'pending_approval' ? 'bg-amber-400' :
          status.toLowerCase() === 'rejected' ? 'bg-red-400' :
          status.toLowerCase() === 'draft' || status.toLowerCase() === 'revision_requested' ? 'bg-purple-400' : 'bg-zinc-400'
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          status.toLowerCase() === 'approved' ? 'bg-emerald-500' : 
          status.toLowerCase() === 'pending' || status.toLowerCase() === 'pending_approval' ? 'bg-amber-500' :
          status.toLowerCase() === 'rejected' ? 'bg-red-500' :
          status.toLowerCase() === 'draft' || status.toLowerCase() === 'revision_requested' ? 'bg-purple-500' : 'bg-zinc-500'
        )}></span>
      </span>
      {formatStatus(status)}
    </Badge>
  );
}
