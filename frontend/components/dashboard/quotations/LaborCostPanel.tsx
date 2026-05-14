"use client";

import { Wrench, IndianRupee, Ruler, Info } from "lucide-react";

interface LaborCostPanelProps {
  area: number;
  ratePerSqFt: number;
  totalLabor: number;
}

export function LaborCostPanel({ area, ratePerSqFt, totalLabor }: LaborCostPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Labor Cost Breakdown</h3>
      </div>
      
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Wrench className="w-16 h-16 text-emerald-500" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Ruler className="h-3 w-3" /> Calculated Area
            </p>
            <p className="text-xl font-black text-zinc-100">
              {area} <span className="text-xs text-zinc-500">sq.ft</span>
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
              Labor Rate
            </p>
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4 text-zinc-400" />
              <p className="text-xl font-black text-zinc-100">
                {ratePerSqFt.toLocaleString()} <span className="text-xs text-zinc-500">/ sq.ft</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-1 sm:text-right">
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
              Labor Total
            </p>
            <div className="flex items-center gap-1 sm:justify-end">
              <IndianRupee className="h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-black text-emerald-400">
                {totalLabor.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-5 pt-4 border-t border-zinc-800 flex items-start gap-3">
          <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Labor costs include precision cutting, assembly, glass installation, and final quality checks at our fabrication facility. This rate is determined by the complexity of the product design.
          </p>
        </div>
      </div>
    </div>
  );
}
