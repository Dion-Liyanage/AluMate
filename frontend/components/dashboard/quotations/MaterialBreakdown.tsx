"use client";

import { Box } from "lucide-react";
import { IndianRupee } from "lucide-react";

interface MaterialItem {
  name: string;
  quantity: string;
  rate: number;
  total: number;
}

interface MaterialBreakdownProps {
  materials: MaterialItem[];
}

export function MaterialBreakdown({ materials }: MaterialBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Box className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Material Recommendations</h3>
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-tight">
            <tr>
              <th className="px-4 py-3">Material Spec</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {materials.map((item, i) => (
              <tr key={i} className="text-zinc-300 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-zinc-400">
                  <span className="flex items-center justify-end">
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                    {item.rate.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-zinc-100">
                  <span className="flex items-center justify-end">
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                    {item.total.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
        <p className="text-[10px] text-blue-400 font-semibold uppercase mb-1">Recommendation Logic</p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          These materials were automatically selected based on your product dimensions, usage environment, and strength requirements to ensure maximum durability.
        </p>
      </div>
    </div>
  );
}
