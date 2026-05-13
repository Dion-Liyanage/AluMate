"use client";

import { Box, Layers, MousePointer2 } from "lucide-react";

interface MaterialItem {
  name: string;
  quantity: string;
  price: string;
}

interface MaterialBreakdownProps {
  materials: MaterialItem[];
}

export function MaterialBreakdown({ materials }: MaterialBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Box className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Material Breakdown</h3>
      </div>
      
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {materials.map((item, i) => (
              <tr key={i} className="text-zinc-300">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2 text-right font-medium">Rs. {item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
