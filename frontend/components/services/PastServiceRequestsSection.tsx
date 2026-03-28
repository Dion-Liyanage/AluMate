"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { servicesApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock3, Loader2, RefreshCw, Wrench, MapPin } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { toast } from "sonner";

interface PastServiceRequestsSectionProps {
  serviceType?: "repair" | "on-site-visit";
  title?: string;
  description?: string;
  refreshToken?: number;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Request Sent":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "Pending":
      return "bg-orange-500/20 text-orange-300 border-orange-500/40";
    case "Approved":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "In Progress":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    case "Completed":
      return "bg-zinc-500/20 text-zinc-300 border-zinc-500/40";
    case "Rejected":
      return "bg-red-500/20 text-red-300 border-red-500/40";
    case "Cancelled by Customer":
      return "bg-zinc-600/20 text-zinc-300 border-zinc-500/40";
    default:
      return "bg-zinc-700/30 text-zinc-300 border-zinc-600/50";
  }
}

const CANCELLABLE_STATUSES: ServiceRequest["status"][] = [
  "Request Sent",
  "Pending",
  "Approved",
];

export function PastServiceRequestsSection({
  serviceType,
  title = "Past Service Requests",
  description = "Track your previous requests, current status, and technician notes.",
  refreshToken,
}: PastServiceRequestsSectionProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await servicesApi.getMyRequests();
      if (response.success && response.data?.serviceRequests) {
        setRequests(response.data.serviceRequests);
      } else {
        setRequests([]);
      }
    } catch {
      setError("Unable to load your request history right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshToken]);

  const filteredRequests = useMemo(() => {
    if (!serviceType) return requests;
    return requests.filter((request) => request.serviceType === serviceType);
  }, [requests, serviceType]);

  const handleCancelRequest = useCallback(
    async (requestId: string) => {
      setCancellingRequestId(requestId);
      try {
        await servicesApi.cancelMyRequest(requestId);
        toast.success("Service request cancelled successfully.");
        await fetchRequests();
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to cancel request.";
        toast.error(message);
      } finally {
        setCancellingRequestId(null);
      }
    },
    [fetchRequests]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl text-zinc-100">{title}</CardTitle>
              <CardDescription className="mt-1 text-zinc-400">{description}</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={isLoading}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-zinc-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading request history...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-sm text-zinc-400">
              No past requests found yet.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const requestId = request._id || request.id;
                const canCancel = CANCELLABLE_STATUSES.includes(request.status);
                const isCancelling = cancellingRequestId === requestId;

                return (
                  <div
                    key={requestId}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-zinc-700 bg-zinc-900 text-zinc-200",
                            request.serviceType === "repair"
                              ? "text-cyan-300"
                              : "text-fuchsia-300"
                          )}
                        >
                          {request.serviceType === "repair" ? "Repair" : "On-site Visit"}
                        </Badge>
                      </div>
                      <span className="text-xs text-zinc-500">Request ID: {requestId}</span>
                    </div>

                    <div className="mt-3 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-zinc-500" />
                        Requested Date: {request.date}
                      </p>

                      {request.orderId && (
                        <div className="flex items-center gap-2 justify-between -ml-6 sm:-ml-7">
                          <p className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-zinc-500" />
                            Order ID: {request.orderId}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("font-medium", getStatusClasses(request.status))}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      )}

                      {request.timeSlot && (
                        <p className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-zinc-500" />
                          Time Slot: {request.timeSlot}
                        </p>
                      )}

                      {request.nearestTown && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-zinc-500" />
                          Nearest Town: {request.nearestTown}
                        </p>
                      )}
                    </div>

                    {request.issueDescription && (
                      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Issue Description</p>
                        <p className="mt-1 text-sm text-zinc-300">{request.issueDescription}</p>
                      </div>
                    )}

                    {request.manualAddress && (
                      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Address</p>
                        <p className="mt-1 text-sm text-zinc-300">{request.manualAddress}</p>
                      </div>
                    )}

                    {request.adminNotes && (
                      <div className="mt-3 rounded-md border border-emerald-600/30 bg-emerald-600/10 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">Admin Notes</p>
                        <p className="mt-1 text-sm text-emerald-100">{request.adminNotes}</p>
                      </div>
                    )}

                    {canCancel && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRequest(requestId)}
                          disabled={isCancelling}
                          className="border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Request"}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
