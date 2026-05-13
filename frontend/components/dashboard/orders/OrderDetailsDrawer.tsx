"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { OrderStatusBadge, OrderStatus } from "./OrderStatusBadge";
import { OrderProgressTracker } from "./OrderProgressTracker";
import { QuotationSummary } from "./QuotationSummary";
import { MaterialBreakdown } from "./MaterialBreakdown";
import { LaborBreakdown } from "./LaborBreakdown";
import { Separator } from "@/components/ui/separator";
import { FileDown, Calendar, Info, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  productType: string;
  designType: "Custom" | "Catalogue";
  date: string;
  price: string;
  status: OrderStatus;
  progress: number;
}

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ order, isOpen, onClose }: OrderDetailsDrawerProps) {
  if (!order) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="h-full overflow-y-auto">
          <div className="p-6 pb-20 space-y-8">
            <SheetHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">{order.id}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <SheetTitle className="text-2xl font-bold text-zinc-100">{order.productType}</SheetTitle>
              <SheetDescription className="text-zinc-400">
                Created on {order.date} • {order.designType} Design
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  Order Progress
                </h4>
                <OrderProgressTracker progress={order.progress} status={order.status} />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50">
                  <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Expected Completion</p>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm">June 15, 2024</span>
                  </div>
                </div>
                <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50">
                  <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Selected Color</p>
                  <div className="flex items-center gap-2 text-zinc-200">
                    <div className="h-3 w-3 rounded-full bg-black border border-zinc-700" />
                    <span className="text-sm">Black Powder Coated</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Recommended Materials */}
              <MaterialBreakdown 
                materials={[
                  { name: "80mm Sliding Profile", quantity: "22ft", price: "35,200" },
                  { name: "Tempered Glass (6mm)", quantity: "18sq.ft", price: "14,000" },
                  { name: "Double Roller Tracks", quantity: "4 sets", price: "2,500" },
                ]} 
              />

              {/* Labor Cost */}
              <LaborBreakdown area={24} rate={350} />

              <Separator className="bg-zinc-800" />

              {/* Quotation Summary */}
              <QuotationSummary 
                materialCost={51700} 
                laborCost={8400} 
                installation={5000} 
                transport={2500} 
              />

              <Separator className="bg-zinc-800" />

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 pb-6">
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 font-bold px-8 h-12 rounded-xl transition-all"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button 
                    className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 font-bold px-8 h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center gap-2"
                  >
                    <FileDown className="h-5 w-5" />
                    Download Quotation PDF
                  </Button>
                </div>
                {order.status === 'quotation_sent' && (
                  <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 py-4 rounded-xl font-bold">
                    Approve & Proceed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
