"use client";

import { Eye, Download, MoreVertical, FileCheck, XCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderStatusBadge, OrderStatus } from "./OrderStatusBadge";
import { OrderProgressTracker } from "./OrderProgressTracker";
import { motion } from "framer-motion";

interface Order {
  id: string;
  productType: string;
  designType: "Custom" | "Catalogue";
  date: string;
  price: string;
  status: OrderStatus;
  progress: number;
}

const orders: Order[] = [
  {
    id: "ORD-2024-001",
    productType: "Sliding Window",
    designType: "Custom",
    date: "2024-05-10",
    price: "Rs. 45,000",
    status: "production",
    progress: 65,
  },
  {
    id: "ORD-2024-002",
    productType: "Main Door",
    designType: "Catalogue",
    date: "2024-05-12",
    price: "Rs. 120,000",
    status: "approved",
    progress: 25,
  },
  {
    id: "ORD-2024-003",
    productType: "Kitchen Pantry",
    designType: "Custom",
    date: "2024-05-13",
    price: "Rs. 250,000",
    status: "pending",
    progress: 10,
  },
  {
    id: "ORD-2024-004",
    productType: "Office Partition",
    designType: "Custom",
    date: "2024-04-28",
    price: "Rs. 85,000",
    status: "completed",
    progress: 100,
  },
];

export function OrdersTable({ onViewDetails }: { onViewDetails: (order: Order) => void }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-zinc-950/50">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400 font-bold">Order ID</TableHead>
              <TableHead className="text-zinc-400 font-bold">Product</TableHead>
              <TableHead className="text-zinc-400 font-bold">Design</TableHead>
              <TableHead className="text-zinc-400 font-bold">Date</TableHead>
              <TableHead className="text-zinc-400 font-bold">Estimated Price</TableHead>
              <TableHead className="text-zinc-400 font-bold">Status</TableHead>
              <TableHead className="text-zinc-400 font-bold w-[180px]">Progress</TableHead>
              <TableHead className="text-zinc-400 font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                <TableCell className="font-mono text-zinc-300 font-medium">{order.id}</TableCell>
                <TableCell className="text-zinc-300">{order.productType}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    order.designType === 'Custom' 
                      ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
                      : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                  }`}>
                    {order.designType}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-400">{order.date}</TableCell>
                <TableCell className="text-zinc-200 font-semibold">{order.price}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <OrderProgressTracker progress={order.progress} status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10"
                      onClick={() => onViewDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                          <Download className="h-4 w-4 mr-2" />
                          Download Quotation
                        </DropdownMenuItem>
                        {order.status === 'quotation_sent' && (
                          <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Accept Quotation
                          </DropdownMenuItem>
                        )}
                        {(order.status === 'pending' || order.status === 'quotation_sent') && (
                          <>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-zinc-800">
        {orders.map((order) => (
          <div key={order.id} className="p-4 bg-zinc-900/20 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-zinc-500 mb-1">{order.id}</p>
                <h3 className="font-bold text-zinc-200">{order.productType}</h3>
                <p className="text-xs text-zinc-400">{order.date}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            
            <OrderProgressTracker progress={order.progress} status={order.status} />
            
            <div className="flex items-center justify-between pt-2">
              <p className="text-lg font-bold text-zinc-100">{order.price}</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-zinc-950 border-zinc-800 text-xs h-8"
                  onClick={() => onViewDetails(order)}
                >
                  Details
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-400">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
