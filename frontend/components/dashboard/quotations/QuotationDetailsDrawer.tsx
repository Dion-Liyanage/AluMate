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
  MessageSquare,
  ArrowRight,
  Info,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { CostBreakdown } from "./CostBreakdown";
import { MaterialRecommendation } from "./MaterialRecommendation";
import { AlternativeMaterials } from "./AlternativeMaterials";
import { LaborCostPanel } from "./LaborCostPanel";
import { VersionHistory } from "./VersionHistory";
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
  // Mock detailed data for the revised UI
  const costItems = [
    { type: "Profile", description: "Aluminium Profile (80mm Sliding)", cost: 34800, isMaterial: true },
    { type: "Glass", description: "Tempered Glass (6mm Clear)", cost: 13500, isMaterial: true },
    { type: "Hardware", description: "Hardware Kit (Rollers/Locks)", cost: 3600, isMaterial: true },
    { type: "Accessory", description: "Rubber Gaskets & Sealants", cost: 2500, isMaterial: true },
    { type: "Labor", description: "Fabrication & Assembly", cost: 8400 },
    { type: "Service", description: "Installation & Delivery", cost: 7500 },
  ];

  const recommendations = [
    { material: "80mm Sliding Profile", reason: "Selected due to large dimensions (6.0' x 4.0') to ensure structural integrity and smooth operation." },
    { material: "Tempered Glass", reason: "Recommended for high-usage residential environments to provide enhanced safety and impact resistance." },
    { material: "Heavy-duty Rollers", reason: "Matches the weight requirements of tempered glass for long-term durability." }
  ];

  const alternativeOptions = [
    { id: "opt1", type: "Budget" as const, material: "70mm Sliding System / 5mm Normal Glass", estimatedTotal: 58000 },
    { id: "opt2", type: "Standard" as const, material: "80mm Sliding System / 6mm Tempered Glass", estimatedTotal: 70300, isSelected: true },
    { id: "opt3", type: "Premium" as const, material: "100mm Luxury System / 8mm Tinted Tempered Glass", estimatedTotal: 92000 },
  ];

  const revisions = [
    { version: 3, totalAmount: 70300, date: new Date().toISOString(), changes: "Updated labor rates", isCurrent: true },
    { version: 2, totalAmount: 72500, date: new Date(Date.now() - 86400000 * 2).toISOString(), changes: "Revised glass thickness" },
    { version: 1, totalAmount: 68000, date: new Date(Date.now() - 86400000 * 5).toISOString(), changes: "Initial estimation" },
  ];

  const totalMaterialCost = costItems.filter(i => i.isMaterial).reduce((acc, item) => acc + item.cost, 0);
  const laborCost = 8400;
  const installationCost = 5000;
  const transportCost = 2500;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <SheetHeader className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <QuotationStatusBadge status={quotation.status} />
            <div className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
              Ref: {quotation.id.slice(-12).toUpperCase()}
            </div>
          </div>
          <SheetTitle className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            Quotation Review
          </SheetTitle>
          <SheetDescription className="text-zinc-400 mt-2">
            Review your fabrication estimate, material recommendations, and cost transparency.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-10 pb-32">
            
            {/* Section 1: Product Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Product Preview</h3>
              </div>
              <div className="relative aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-bold uppercase tracking-widest text-xs">
                  [ 3D Render Preview Placeholder ]
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                   <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] font-bold text-zinc-300">3D View</div>
                   <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] font-bold text-zinc-300">2D Sketch</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Product Type</p>
                  <p className="text-sm font-bold text-zinc-200 capitalize">{quotation.productType || "Standard Fabrication"}</p>
                </div>
                <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Design Type</p>
                  <p className="text-sm font-bold text-zinc-200">Custom Design</p>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Section 2: Customer Inputs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Your Specifications</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Width", value: "6.0 ft", icon: Ruler },
                  { label: "Height", value: "4.0 ft", icon: Ruler },
                  { label: "Color", value: "Matte Black", icon: Paintbrush },
                  { label: "Usage", value: "Heavy Daily Use", icon: ShieldCheck },
                  { label: "Environment", value: "Outdoor Installation", icon: Info },
                  { label: "Strength", value: "Heavy Duty", icon: ShieldCheck },
                ].map((spec, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <spec.icon className="h-3 w-3" /> {spec.label}
                    </p>
                    <p className="text-sm font-bold text-zinc-200">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-zinc-800/50" />

            {/* Section 3: Cost Breakdown */}
            <CostBreakdown items={costItems} />

            <Separator className="bg-zinc-800/50" />

            {/* Section 4: Material Recommendation */}
            <MaterialRecommendation recommendations={recommendations} />

            <Separator className="bg-zinc-800/50" />

            {/* Section 5: Alternative Materials */}
            <AlternativeMaterials options={alternativeOptions} />

            <Separator className="bg-zinc-800/50" />

            {/* Section 6: Labor Cost */}
            <LaborCostPanel area={24} ratePerSqFt={350} totalLabor={laborCost} />

            <Separator className="bg-zinc-800/50" />

            {/* Section 7: Version History */}
            <VersionHistory revisions={revisions} />

            <Separator className="bg-zinc-800/50" />

            {/* Section 8: Final Summary */}
            <QuotationSummary 
              materialCost={totalMaterialCost}
              laborCost={laborCost}
              installationCost={installationCost}
              transportCost={transportCost}
              totalEstimate={quotation.totalAmount || 70300}
            />

            {/* Important Notice */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
              <Info className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/70 leading-relaxed">
                <span className="font-bold text-amber-400">Important Notice:</span> Final measurements and actual site conditions may slightly affect the final quotation amount. This estimate is valid until {quotation.validUntil ? format(new Date(quotation.validUntil), 'MMM dd, yyyy') : 'next 30 days'}.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-6 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 shrink-0 absolute bottom-0 left-0 right-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
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
                  className="flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10 h-12 rounded-xl transition-all font-bold group"
                  onClick={() => onReject(quotation.id)}
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Request Mod.
                </Button>
                <Button
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl transition-all font-black shadow-lg shadow-blue-500/20 active:scale-95 group"
                  onClick={() => onApprove(quotation.id)}
                >
                  <Check className="h-4 w-4 mr-2" /> Approve Quote
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
