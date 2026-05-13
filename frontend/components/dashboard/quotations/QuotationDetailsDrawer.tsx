"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { 
  FileText, 
  Calendar, 
  Package, 
  Ruler, 
  Paintbrush, 
  ShieldCheck, 
  Download,
  Check,
  X,
  MapPin,
  ExternalLink,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { MaterialBreakdown } from "./MaterialBreakdown";
import { LaborBreakdown } from "./LaborBreakdown";
import { QuotationSummary } from "./QuotationSummary";
import { format } from "date-fns";
import { Quotation } from "@/types";

interface QuotationDetailsDrawerProps {
  quotation: Quotation;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDownload: (id: string) => void;
}

export function QuotationDetailsDrawer({
  quotation,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDownload
}: QuotationDetailsDrawerProps) {
  // Mock breakdown data since it might not be in the Quotation type yet
  const materials = [
    { name: "Aluminium Profile (80mm Sliding)", quantity: "24 ft", rate: 1450, total: 34800 },
    { name: "Tempered Glass (6mm Clear)", quantity: "18 sq.ft", rate: 750, total: 13500 },
    { name: "Rubber Gaskets & Sealants", quantity: "1 set", rate: 2500, total: 2500 },
    { name: "Hardware Kit (Rollers/Locks)", quantity: "2 units", rate: 1800, total: 3600 },
  ];

  const totalMaterialCost = materials.reduce((acc, item) => acc + item.total, 0);
  const laborCost = 8400;
  const installationCost = 5000;
  const transportCost = 2500;
  const totalEstimate = totalMaterialCost + laborCost + installationCost + transportCost;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <SheetHeader className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <QuotationStatusBadge status={quotation.status} />
            <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
              Ref: {quotation.id.slice(-12).toUpperCase()}
            </div>
          </div>
          <SheetTitle className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            Quotation Details
          </SheetTitle>
          <SheetDescription className="text-zinc-400 mt-2">
            Detailed breakdown of material specifications, labor costs, and project estimation.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8 pb-24">
            {/* Basic Info Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
                  <Package className="h-3 w-3" /> Product Type
                </div>
                <div className="text-sm font-bold text-zinc-200 capitalize">{quotation.productType || "Standard Fabrication"}</div>
              </div>
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
                  <Calendar className="h-3 w-3" /> Created On
                </div>
                <div className="text-sm font-bold text-zinc-200">
                  {quotation.createdAt ? format(new Date(quotation.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Configuration Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Design Purpose:</span>
                    <span className="text-zinc-300 font-medium">Residential / High Usage</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Dimensions:</span>
                    <span className="text-zinc-300 font-medium">6.0' x 4.0'</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1"><Paintbrush className="h-3 w-3" /> Color Finish:</span>
                    <span className="text-zinc-300 font-medium">Powder Coated Black</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Strength:</span>
                    <span className="text-zinc-300 font-medium">Heavy Duty (1.2mm)</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Material Breakdown */}
            <MaterialBreakdown materials={materials} />

            <Separator className="bg-zinc-800/50" />

            {/* Labor Breakdown */}
            <LaborBreakdown area={24} ratePerSqFt={350} totalLabor={laborCost} />

            <Separator className="bg-zinc-800/50" />

            {/* Summary */}
            <QuotationSummary 
              materialCost={totalMaterialCost}
              laborCost={laborCost}
              installationCost={installationCost}
              transportCost={transportCost}
              totalEstimate={totalEstimate}
            />
          </div>
        </div>

        <SheetFooter className="p-6 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 shrink-0 absolute bottom-0 left-0 right-0">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 h-12 rounded-xl transition-all"
              onClick={() => onDownload(quotation.id)}
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            
            {(quotation.status === 'pending' || quotation.status === 'pending_approval') ? (
              <div className="flex gap-3 flex-1">
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 h-12 rounded-xl transition-all font-bold"
                  onClick={() => onReject(quotation.id)}
                >
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl transition-all font-black shadow-lg shadow-emerald-500/20 active:scale-95 group"
                  onClick={() => onApprove(quotation.id)}
                >
                  <Check className="h-4 w-4 mr-2" /> Approve Quotation
                  <ArrowRight className="h-4 w-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 h-12 rounded-xl transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-2" /> Contact Admin
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
