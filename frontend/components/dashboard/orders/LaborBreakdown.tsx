"use client";

import { Wrench } from "lucide-react";

interface LaborBreakdownProps {
  area: number;
  rate: number;
}

export function LaborBreakdown({ area, rate }: LaborBreakdownProps) {
  const totalLabor = area * rate;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-4 w-4 text-orange-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Labor Calculation</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4 bg-zinc-900/30 p-4 rounded-lg border border-zinc-800">
        <div>
          <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Total Area</p>
          <p className="text-zinc-200 font-semibold">{area} sq.ft</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Labor Rate</p>
          <p className="text-zinc-200 font-semibold">Rs. {rate} / sq.ft</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Total Labor</p>
          <p className="text-blue-400 font-bold">Rs. {totalLabor.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
