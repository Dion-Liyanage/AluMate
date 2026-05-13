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
  Truck
} from "lucide-react";
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
import { useState } from "react";

import { adminOrdersApi } from "@/lib/api";

interface OrderDetailsModalProps {
  order: (Order & { _id?: string }) | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function OrderDetailsModal({ order, isOpen, onOpenChange, onRefresh }: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

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

          {/* Progress Tracker Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-2xl space-y-5 relative overflow-hidden group">
            <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              Order Progress
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                  {order.status.replace('_', ' ')}
                </span>
                <span className="text-blue-400 font-bold text-sm">{order.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${order.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    order.progress < 100 
                      ? "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                      : "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 border border-zinc-900/50 p-4 rounded-xl space-y-2 hover:bg-zinc-900/50 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Expected Completion</p>
              <div className="flex items-center gap-2 text-zinc-200">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-semibold">June 15, 2024</span>
              </div>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-900/50 p-4 rounded-xl space-y-2 hover:bg-zinc-900/50 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Selected Color</p>
              <div className="flex items-center gap-2 text-zinc-200">
                <div className="h-3 w-3 rounded-full bg-black border border-zinc-700 shadow-inner" />
                <span className="text-sm font-semibold">Black Powder Coated</span>
              </div>
            </div>
          </div>

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
                  {[
                    { name: "80mm Sliding Profile", qty: "22ft", price: "Rs. 35,200" },
                    { name: "Tempered Glass (6mm)", qty: "18sq.ft", price: "Rs. 14,000" },
                    { name: "Double Roller Tracks", qty: "4 sets", price: "Rs. 2,500" },
                  ].map((item, idx) => (
                    <TableRow key={idx} className="border-zinc-900/50 hover:bg-zinc-900/20 transition-colors">
                      <TableCell className="text-sm font-bold text-zinc-300 py-3">{item.name}</TableCell>
                      <TableCell className="text-xs text-zinc-500 font-medium py-3 text-center">{item.qty}</TableCell>
                      <TableCell className="text-sm text-zinc-100 font-black py-3 text-right pr-4">{item.price}</TableCell>
                    </TableRow>
                  ))}
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
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Fabrication Cost (24 sq.ft × Rs. 350)</span>
                <span className="text-zinc-200 font-bold">Rs. 8,400</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Installation & Fitting</span>
                <span className="text-zinc-200 font-bold">Rs. 5,000</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-zinc-900 pt-3">
                <span className="text-zinc-400 font-bold uppercase text-[10px]">Total Fabrication</span>
                <span className="text-blue-400 font-black">Rs. 13,400</span>
              </div>
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
              <Button 
                variant="outline" 
                className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 font-bold px-8 h-12 rounded-xl transition-all"
              >
                <FileDown className="h-5 w-5 mr-2" />
                Download PDF
              </Button>
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
            >
              Cancel Fabrication Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
