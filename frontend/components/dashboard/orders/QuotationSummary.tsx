"use client";

import { Separator } from "@/components/ui/separator";

interface QuotationSummaryProps {
  materialCost: number;
  laborCost: number;
  installation: number;
  transport: number;
}

export function QuotationSummary({ materialCost, laborCost, installation, transport }: QuotationSummaryProps) {
  const total = materialCost + laborCost + installation + transport;

  return (
    <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-5 space-y-4">
      <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Quotation Summary</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Material Cost</span>
          <span className="text-zinc-200">Rs. {materialCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Labor Cost</span>
          <span className="text-zinc-200">Rs. {laborCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Installation Fee</span>
          <span className="text-zinc-200">Rs. {installation.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Transport</span>
          <span className="text-zinc-200">Rs. {transport.toLocaleString()}</span>
        </div>
        
        <Separator className="bg-zinc-800 my-4" />
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-zinc-100">Total Estimate</span>
          <span className="text-2xl font-black text-blue-400 shadow-blue-500/20 drop-shadow-glow">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
