"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Wrench, 
  Calendar, 
  User, 
  ClipboardList, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Phone,
  Home
} from "lucide-react";
import { ServiceRequest } from "./ServiceManagement";
import { ServiceStatusBadge, ServiceTypeBadge } from "./ServiceStatusBadge";
import { servicesApi } from "@/lib/api";
import { toast } from "sonner";

interface ServiceDetailsModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function ServiceDetailsModal({ request, isOpen, onOpenChange, onRefresh }: ServiceDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("Request Sent");
  const isCustomerCancelled = request?.status === "Cancelled by Customer";

  useEffect(() => {
    if (request) {
      setSelectedStatus(request.status);
    }
  }, [request]);

  if (!request) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await servicesApi.updateStatus(request.id, { status: newStatus });
      toast.success(`Request status changed to ${newStatus}`);
      onRefresh?.();
    } catch (error: any) {
      const isForbidden = error?.response?.status === 403;
      const message = isForbidden
        ? "You are not authorized as admin in this session. Please log in again with an admin account."
        : error?.response?.data?.message || "Failed to update status.";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                Service Request Details
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-700 bg-zinc-900 text-zinc-400">
                  {request.id.substring(0, 8)}...
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Created on {new Date(request.createdAt).toLocaleDateString()}
              </DialogDescription>
            </div>
            <ServiceStatusBadge status={request.status} />
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Header Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Service Type</p>
              <ServiceTypeBadge type={request.serviceType} />
            </div>
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Customer</p>
              <div className="flex items-center gap-2 text-sm text-zinc-200">
                <User className="h-3.5 w-3.5 text-zinc-500" />
                {request.customerName}
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-800/50" />

          {/* Details Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Request Information
            </h4>

            <div className="grid gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/30">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-fuchsia-400" />
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Scheduled Date</p>
                  <p className="text-sm text-zinc-200">{request.date}</p>
                </div>
              </div>

              {request.serviceType === "on-site-visit" ? (
                <>
                  {request.nearestTown && (
                    <div className="flex items-start gap-3">
                      <Home className="h-4 w-4 mt-1 text-fuchsia-400" />
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Nearest Town</p>
                        <p className="text-sm text-zinc-200">{request.nearestTown}</p>
                      </div>
                    </div>
                  )}
                  {request.manualAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-fuchsia-400" />
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Address</p>
                        <p className="text-sm text-zinc-200">{request.manualAddress}</p>
                      </div>
                    </div>
                  )}
                  {request.location && typeof request.location === "object" && "lat" in request.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-blue-400" />
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">GPS Location</p>
                        <p className="text-sm text-zinc-200 font-mono">
                          {request.location.lat.toFixed(6)}, {request.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Wrench className="h-4 w-4 mt-1 text-cyan-400" />
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Related Order ID</p>
                      <p className="text-sm text-zinc-200 font-mono">{request.orderId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 mt-1 text-cyan-400" />
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Issue Description</p>
                      <p className="text-sm text-zinc-200 italic">"{request.issueDescription || "No description provided"}"</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Visual Evidence */}
          <div className="space-y-2">
             <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos / Documents
            </h4>
            {request.imageUrl ? (
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-2 overflow-hidden">
                <img 
                  src={`${API_BASE}${request.imageUrl}`} 
                  alt="Repair evidence" 
                  className="max-h-48 rounded-md object-cover"
                />
              </div>
            ) : (
              <div className="h-24 rounded-lg bg-zinc-900 border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
                 No attachments provided
              </div>
            )}
          </div>

          {/* Admin Notes */}
          {request.adminNotes && (
            <div className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/30">
              <p className="text-xs text-zinc-500 mb-1">Admin Notes</p>
              <p className="text-sm text-zinc-300">{request.adminNotes}</p>
            </div>
          )}

          <div className="bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/30 space-y-2">
            <p className="text-xs text-zinc-500">Update Status</p>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={isCustomerCancelled}
            >
              <SelectTrigger className="w-full bg-zinc-950/60 border-zinc-800 text-zinc-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {isCustomerCancelled && (
              <p className="text-xs text-zinc-500">
                This request was cancelled by the customer and can no longer be changed.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-zinc-800 pt-4 mt-2">
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="secondary"
              className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleStatusUpdate(selectedStatus)}
              disabled={
                isUpdating ||
                selectedStatus === request.status ||
                isCustomerCancelled
              }
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Update Status
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
