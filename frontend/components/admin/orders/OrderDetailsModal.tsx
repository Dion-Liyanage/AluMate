"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Calendar, 
  Info,
  Circle,
  FileDown,
  CheckCircle2,
  Hammer,
  Truck,
  Ruler,
  Eye
} from "lucide-react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Order } from "./OrdersTable";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { adminOrdersApi, designsApi } from "@/lib/api";
import { formatMeasurement } from "@/lib/utils";

interface OrderDetailsModalProps {
  order: (Order & { _id?: string }) | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function OrderDetailsModal({ order, isOpen, onOpenChange, onRefresh }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const res = await designsApi.getAll();
        if (res.success && res.data) {
          setDesigns(res.data);
        }
      } catch (e) {
        console.error("Failed to load designs:", e);
      }
    };
    if (isOpen) {
      loadDesigns();
    }
  }, [isOpen]);

  if (!order) return null;

  const resolvedDesign = typeof order.catalogueDesignId === 'object' && order.catalogueDesignId !== null
    ? order.catalogueDesignId
    : (order.catalogueDesignId ? designs.find(d => d._id === order.catalogueDesignId) : null);

  const getColorHex = (colorName?: string) => {
    if (!colorName) return "#000000";
    const name = colorName.toLowerCase();
    if (name.includes("silver")) return "#c0c0c0";
    if (name.includes("bronze")) return "#cd7f32";
    if (name.includes("white")) return "#ffffff";
    if (name.includes("black")) return "#000000";
    if (name.includes("wood")) return "#8b5a2b";
    return "#555555";
  };

  const getExpectedCompletionDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 14); // 14 days fabrication time
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return "Estimated 14 Days";
    }
  };

  const getPdfDownloadUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order._id) {
      toast.error("Order ID is missing. Cannot update status.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminOrdersApi.updateStatus(order._id, { status });
      if (response.success) {
        toast.success(`Order status updated to ${status}`);
        onRefresh?.();
        onOpenChange(false);
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("An error occurred while updating order status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-2xl overflow-y-auto bg-[#0a0a0a] border-zinc-900 text-zinc-100 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 gap-0">
        <div className="p-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">{order.id}</span>
              <div className="scale-110 origin-right">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <DialogTitle className="text-4xl font-bold text-white tracking-tight leading-tight">
              {order.productType}
            </DialogTitle>
            <p className="text-zinc-400 font-medium">
              Created on {order.date} • <span className="text-zinc-500">{order.designType} Design</span>
            </p>
          </div>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-900/50 p-4 rounded-xl space-y-2 hover:bg-zinc-900/50 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Expected Completion</p>
              <div className="flex items-center gap-2 text-zinc-200">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-semibold">{getExpectedCompletionDate(order.date)}</span>
              </div>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-900/50 p-4 rounded-xl space-y-2 hover:bg-zinc-900/50 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Selected Color</p>
              <div className="flex items-center gap-2 text-zinc-200">
                <div 
                  className="h-3 w-3 rounded-full border border-zinc-700 shadow-inner"
                  style={{ backgroundColor: getColorHex(order.color) }}
                />
                <span className="text-sm font-semibold capitalize">{order.color || "Default"}</span>
              </div>
            </div>
          </div>

          {/* Design Details */}
          {resolvedDesign && (
            <>
              <Separator className="bg-zinc-900" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-400" />
                    Design Details
                  </h4>
                  <Link href={`/dashboard/catalogue/${resolvedDesign._id}`} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-blue-400" />
                      View Design
                    </Button>
                  </Link>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                  {(resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl) && (
                    <div className="w-full md:w-1/3 h-32 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={(resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl).startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl}`
                          : (resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl)}
                        alt={resolvedDesign.title || "Design"}
                        className="max-h-28 object-contain rounded-md"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {resolvedDesign.designCode && (
                        <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10 font-mono tracking-wider font-bold">
                          {resolvedDesign.designCode}
                        </span>
                      )}
                      <h5 className="text-sm font-bold text-zinc-200">{resolvedDesign.title}</h5>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-3">{resolvedDesign.description}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Measurements */}
          {order.measurements && Object.keys(order.measurements).length > 0 && (
            <>
              <Separator className="bg-zinc-900" />
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-blue-400" /> Measurements
                </h4>
                <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(order.measurements).map(([key, value]) => (
                      <div key={key} className="relative flex items-center border-b border-zinc-800/30 pb-2 last:border-0 last:pb-0 h-7">
                        <span className="text-xs text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-zinc-200">{formatMeasurement(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator className="bg-zinc-900" />

          {/* Material Breakdown Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              Material Breakdown
            </h4>
            <div className="rounded-xl border border-zinc-900 overflow-hidden bg-zinc-950/20">
              <Table>
                <TableHeader className="bg-zinc-900/30">
                  <TableRow className="border-zinc-900 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase text-zinc-500 font-bold py-3">Item</TableHead>
                    <TableHead className="text-[10px] uppercase text-zinc-500 font-bold py-3 text-center">Qty</TableHead>
                    <TableHead className="text-[10px] uppercase text-zinc-500 font-bold py-3 text-right pr-4">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.recommendedMaterials && order.recommendedMaterials.length > 0 ? (
                    order.recommendedMaterials.map((item: any, idx: number) => (
                      <TableRow key={idx} className="border-zinc-900/50 hover:bg-zinc-900/20 transition-colors">
                        <TableCell className="text-sm font-bold text-zinc-300 py-3">
                          {item.profileName} {item.thickness ? `(${item.thickness})` : ''}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 font-medium py-3 text-center">
                          {item.quantityFeet} ft
                        </TableCell>
                        <TableCell className="text-sm text-zinc-100 font-black py-3 text-right pr-4">
                          Rs. {item.materialCost?.toLocaleString() || (item.quantityFeet * (item.pricePerFeet || 0)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-zinc-500 text-xs">
                        No material breakdown available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Labor & Fabrication Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-200 flex items-center gap-2">
              <Hammer className="h-4 w-4 text-blue-400" />
              Labor & Fabrication
            </h4>
            <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 space-y-3">
              {order.laborCalculation ? (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">
                      Fabrication Labor ({order.laborCalculation.areaSqFt || 0} sq.ft × Rs. {order.laborCalculation.laborRate || 0})
                    </span>
                    <span className="text-zinc-200 font-bold">Rs. {(order.laborCalculation.laborCost || 0).toLocaleString()}</span>
                  </div>
                  {order.finalLaborCost !== undefined && order.finalLaborCost !== order.laborCalculation.laborCost && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Final Adjusted Labor & Installation</span>
                      <span className="text-zinc-200 font-bold">Rs. {order.finalLaborCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm border-t border-zinc-900 pt-3">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Total Fabrication Cost</span>
                    <span className="text-blue-400 font-black">
                      Rs. {(order.finalLaborCost !== undefined ? order.finalLaborCost : order.laborCalculation.laborCost || 0).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Fabrication & Installation Labor</span>
                    <span className="text-zinc-200 font-bold">
                      {order.finalLaborCost !== undefined ? `Rs. ${order.finalLaborCost.toLocaleString()}` : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-zinc-900 pt-3">
                    <span className="text-zinc-400 font-bold uppercase text-[10px]">Total Fabrication Cost</span>
                    <span className="text-blue-400 font-black">
                      {order.finalLaborCost !== undefined ? `Rs. ${order.finalLaborCost.toLocaleString()}` : "Pending"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator className="bg-zinc-900" />

          {/* Footer Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 font-bold px-8 h-12 rounded-xl transition-all"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              {order.quotationPdfUrl ? (
                <a
                  href={getPdfDownloadUrl(order.quotationPdfUrl)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 font-bold px-8 h-12 rounded-xl transition-all gap-2"
                >
                  <FileDown className="h-5 w-5" />
                  Download PDF
                </a>
              ) : (
                <Button 
                  variant="outline" 
                  disabled
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-500 font-bold px-8 h-12 rounded-xl transition-all"
                >
                  <FileDown className="h-5 w-5 mr-2" />
                  No PDF
                </Button>
              )}
              <Button 
                className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 font-bold px-8 h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center gap-2"
                onClick={() => handleUpdateStatus('completed')}
                disabled={isUpdating || order.status === 'completed'}
              >
                <CheckCircle2 className="h-5 w-5" />
                Complete Order
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 font-bold h-10"
              onClick={() => handleUpdateStatus('cancelled')}
              disabled={isUpdating || order.status === 'cancelled' || order.status === 'completed'}
            >
              Cancel Fabrication Request
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
