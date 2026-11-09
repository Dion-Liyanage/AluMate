"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { PlanComparison } from "@/lib/api";

interface HighWasteOrdersProps {
  orders: PlanComparison[];
  marginPct: number;
  ordersWithPlan: number;
}

const kg = (value: number) => `${Number(value.toFixed(2)).toLocaleString()} kg`;

export function HighWasteOrders({ orders, marginPct, ordersWithPlan }: HighWasteOrdersProps) {
  if (ordersWithPlan === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        No planned orders completed yet. Orders placed with a cut list are compared here once fabrication is completed.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-400">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        Every completed order stayed within {marginPct} points of its planned waste.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="pb-3 font-medium">Order</th>
            <th className="pb-3 text-right font-medium">Planned scrap</th>
            <th className="pb-3 text-right font-medium">Actual scrap</th>
            <th className="pb-3 text-right font-medium">Extra scrap</th>
            <th className="pb-3 text-right font-medium">Waste rate</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={`${order.orderNumber}-${order.recordedAt}`} className="border-b border-zinc-800/70 last:border-0">
              <td className="py-3">
                <p className="font-medium text-zinc-200">{order.orderNumber}</p>
                <p className="text-xs capitalize text-zinc-500">{order.projectName}</p>
              </td>
              <td className="py-3 text-right text-zinc-400">{kg(order.plannedScrapKg)}</td>
              <td className="py-3 text-right text-zinc-200">{kg(order.actualScrapKg)}</td>
              <td className="py-3 text-right text-zinc-200">+{kg(order.extraScrapKg)}</td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-200">
                  <AlertTriangle className="h-3 w-3" />
                  {order.plannedWasteRate}% → {order.actualWasteRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
