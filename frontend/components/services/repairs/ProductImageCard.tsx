"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { OrderDetails } from "./OrderPreviewCard";

interface ProductImageCardProps {
  order: OrderDetails | null;
}

export function ProductImageCard({ order }: ProductImageCardProps) {
  if (!order || !order.imageUrl) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 p-6 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[160px]">
        <div className="bg-zinc-900 rounded-full p-3 border border-zinc-800">
          <ImageIcon className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-400">No Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 group shadow-sm">
      <img 
        src={order.imageUrl} 
        alt={order.productType}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <div className="space-y-0.5">
          <p className="text-[10px] text-fuchsia-400 font-bold tracking-widest uppercase">{order.orderNumber}</p>
          <p className="text-xs text-zinc-200 font-medium">{order.productType}</p>
        </div>
      </div>
    </div>
  );
}
