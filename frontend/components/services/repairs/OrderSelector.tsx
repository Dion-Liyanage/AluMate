"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { OrderDetails } from "./OrderPreviewCard";

interface OrderSelectorProps {
  orders: OrderDetails[];
  selectedOrderId: string;
  onSelect: (orderId: string) => void;
  disabled?: boolean;
}

export function OrderSelector({ orders, selectedOrderId, onSelect, disabled }: OrderSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="order-select" className="text-sm font-medium text-zinc-300">
        Select Order Number
      </Label>
      <Select
        value={selectedOrderId}
        onValueChange={onSelect}
        disabled={disabled}
      >
        <SelectTrigger 
          id="order-select"
          className="w-full h-11 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 transition-all focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <SelectValue placeholder="Select a previously completed order" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-950 border-zinc-800 shadow-xl">
          {orders.map((order) => (
            <SelectItem 
              key={order.id} 
              value={order.id}
              className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
            >
              {order.orderNumber} - {order.productType}
            </SelectItem>
          ))}
          {orders.length === 0 && (
            <div className="py-3 px-2 text-sm text-center text-zinc-500">
              No completed orders found.
            </div>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-zinc-500 mt-1">
        Choose the order that requires maintenance or repair.
      </p>
    </div>
  );
}
