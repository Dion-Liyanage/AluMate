"use client";

import { Box, IndianRupee, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CostItem {
  type: string;
  description: string;
  cost: number;
  isMaterial?: boolean;
}

interface CostBreakdownProps {
  items: CostItem[];
}

export function CostBreakdown({ items }: CostBreakdownProps) {
  const totalCost = items.reduce((acc, item) => acc + item.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Cost Breakdown</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-zinc-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs max-w-xs">
              This breakdown includes all materials, accessories, and specialized labor required for your project.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-tight">
            <tr>
              <th className="px-4 py-3">Item Type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Estimate (Rs.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {items.map((item, i) => (
              <tr key={i} className="text-zinc-300 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    item.isMaterial ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{item.description}</td>
                <td className="px-4 py-3 text-right font-bold text-zinc-100">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-3 w-3 mr-0.5" />
                    {item.cost.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-900/30 border-t border-zinc-800">
            <tr>
              <td colSpan={2} className="px-4 py-4 text-sm font-bold text-zinc-400 text-right uppercase tracking-wider">Subtotal</td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end text-lg font-black text-blue-400">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  {totalCost.toLocaleString()}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
