"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CalendarDays, Palette } from "lucide-react";

export interface OrderDetails {
  id: string;
  orderNumber: string;
  productType: string;
  designType: string;
  installationDate: string;
  imageUrl?: string;
}

interface OrderPreviewCardProps {
  order: OrderDetails | null;
}

export function OrderPreviewCard({ order }: OrderPreviewCardProps) {
  if (!order) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 p-6 flex flex-col items-center justify-center text-center space-y-3 h-full">
        <div className="bg-zinc-900 rounded-full p-3 border border-zinc-800">
          <Package className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-400">No Order Selected</p>
          <p className="text-xs text-zinc-500 mt-1">Please select an order above to view its details.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-sm h-full flex flex-col justify-center">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-medium flex items-center text-zinc-300">
          <Package className="w-4 h-4 mr-2 text-cyan-400" />
          Order Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5" /> Product Type
            </span>
            <p className="text-sm font-medium text-zinc-200">{order.productType}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <Palette className="w-3.5 h-3.5" /> Design Type
            </span>
            <p className="text-sm font-medium text-zinc-200">{order.designType}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <CalendarDays className="w-3.5 h-3.5" /> Installation Date
            </span>
            <p className="text-sm font-medium text-zinc-200">{order.installationDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
