import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface RequestStatusBadgeProps {
  status: string;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  if (status === "Request Sent") {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800 gap-1.5 flex w-fit items-center">
        <Clock className="w-3.5 h-3.5" />
        {status}
      </Badge>
    );
  }
  if (status === "Approved") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-500 dark:border-green-800 gap-1.5 flex w-fit items-center">
        <CheckCircle className="w-3.5 h-3.5" />
        {status}
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}
