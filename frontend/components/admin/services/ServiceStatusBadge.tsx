import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  "Pending": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Approved": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Completed": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "Request Sent": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Rejected": "bg-red-500/10 text-red-400 border-red-500/20",
};

export function ServiceStatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  
  return (
    <Badge variant="outline" className={`font-medium ${colorClass}`}>
      {status}
    </Badge>
  );
}

export function ServiceTypeBadge({ type }: { type: "on-site-visit" | "repair" }) {
  if (type === "on-site-visit") {
    return (
      <Badge variant="outline" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20">
        On-Site Visit
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
      Repair Request
    </Badge>
  );
}
