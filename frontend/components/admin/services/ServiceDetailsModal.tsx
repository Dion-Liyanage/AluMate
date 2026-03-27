"use client";

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
  MapPin, 
  Wrench, 
  Calendar, 
  User, 
  ClipboardList, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ServiceRequest } from "./ServiceManagement";
import { ServiceStatusBadge, ServiceTypeBadge } from "./ServiceStatusBadge";

interface ServiceDetailsModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDetailsModal({ request, isOpen, onOpenChange }: ServiceDetailsModalProps) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                Service Request Details
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-700 bg-zinc-900 text-zinc-400">
                  {request.id}
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
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-blue-400" />
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-500">Location Details</p>
                    <p className="text-sm text-zinc-200">{request.location?.toString() || "No location specified"}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Wrench className="h-4 w-4 mt-1 text-orange-400" />
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Related Order ID</p>
                      <p className="text-sm text-zinc-200 font-mono">{request.orderId || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 mt-1 text-orange-400" />
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Issue Description</p>
                      <p className="text-sm text-zinc-200 italic">"{request.issueDescription || "No description provided"}"</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Visual Evidence (Placeholder if needed) */}
          <div className="space-y-2">
             <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos / Documents
            </h4>
            <div className="h-24 rounded-lg bg-zinc-900 border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
               No attachments provided
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-zinc-800 pt-4 mt-2">
          <div className="flex gap-2 w-full justify-between">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-400/10">
              Reject Request
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Request
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
