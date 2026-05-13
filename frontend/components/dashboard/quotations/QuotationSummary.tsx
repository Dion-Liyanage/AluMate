"use client";

import { Receipt, IndianRupee, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotationSummaryProps {
  materialCost: number;
  laborCost: number;
  installationCost: number;
  transportCost: number;
  totalEstimate: number;
}

export function QuotationSummary({
  materialCost,
  laborCost,
  installationCost,
  transportCost,
  totalEstimate
}: QuotationSummaryProps) {
  const lineItems = [
    { label: "Material Cost", amount: materialCost },
    { label: "Labor & Fabrication", amount: laborCost },
    { label: "Installation Service", amount: installationCost },
    { label: "Transport & Logistics", amount: transportCost },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Receipt className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Quotation Summary</h3>
      </div>

      <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-5 space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 font-medium">{item.label}</span>
              <span className="text-zinc-200 font-bold flex items-center">
                <IndianRupee className="h-3 w-3 mr-1 opacity-60" />
                {item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-5 flex justify-between items-center border-t border-zinc-800">
          <span className="text-zinc-100 font-bold uppercase tracking-tight">Total Estimate</span>
          <div className="text-right">
            <span className="text-2xl font-black text-white flex items-center shadow-blue-500/20 drop-shadow-lg">
              <IndianRupee className="h-5 w-5 mr-1 text-blue-400" />
              {totalEstimate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          <span className="text-amber-500/80 font-bold uppercase tracking-tighter mr-1">Note:</span>
          This is a preliminary estimation based on provided dimensions. Final measurements taken on-site by our technicians may slightly affect the final invoice amount.
        </p>
      </div>
    </div>
  );
}
