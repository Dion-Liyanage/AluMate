"use client";

import { Wrench, IndianRupee } from "lucide-react";

interface LaborBreakdownProps {
  area: number;
  ratePerSqFt: number;
  totalLabor: number;
}

export function LaborBreakdown({ area, ratePerSqFt, totalLabor }: LaborBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Labor Cost Breakdown</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950/30 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Area</p>
          <p className="text-lg font-bold text-zinc-200">{area} <span className="text-sm font-normal text-zinc-500 italic">sq.ft</span></p>
        </div>
        
        <div className="bg-zinc-950/30 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Labor Rate</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-zinc-200 flex items-center">
              <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
              {ratePerSqFt}
            </span>
            <span className="text-xs text-zinc-500 italic">/ sq.ft</span>
          </div>
        </div>
        
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-1">Total Labor</p>
          <p className="text-lg font-bold text-emerald-400 flex items-center">
            <IndianRupee className="h-4 w-4 mr-0.5" />
            {totalLabor.toLocaleString()}
          </p>
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-500 italic px-1">
        * Labor costs are calculated based on the total surface area and complexity of the fabrication process.
      </p>
    </div>
  );
}
