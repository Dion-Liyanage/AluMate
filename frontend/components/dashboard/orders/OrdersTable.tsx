"use client";

import { useState, useEffect } from "react";
import { Eye, Download, MoreVertical, FileCheck, XCircle, ChevronDown, ChevronUp, History, Loader2 } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";

export interface Order {
  id: string;
  _id: string;
  productType: string;
  designType: "Custom" | "Catalogue";
  date: string;
  price: string;
  status: OrderStatus;
  progress: number;
  finalMaterialCost?: number;
  finalLaborCost?: number;
  finalTotalCost?: number;
  quotationPdfUrl?: string;
  measurements?: Record<string, any>;
  color?: string;
  accessories?: string[];
  estimatedPrice?: number;
  strengthCategory?: string;
  environment?: string;
  purpose?: string;
  notes?: { message: string }[];
  catalogueDesignId?: any;
}

const INACTIVE_STATUSES: OrderStatus[] = ["completed", "cancelled"];

export function OrdersTable({ onViewDetails }: { onViewDetails: (order: any) => void }) {
  const [showInactive, setShowInactive] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getAll();
      if (response.success && response.data) {
        const allOrders = (response.data.orders || response.data || []) as any[];
        // Only show orders that have been approved (past quotation stage)
        const QUOTATION_STATUSES = ['quotation_pending', 'quotation_sent', 'draft'];
        const confirmedOrders = allOrders.filter((o: any) => !QUOTATION_STATUSES.includes(o.status));
        const mappedOrders = confirmedOrders.map((o: any) => ({
          id: o.orderId,
          _id: o._id,
          productType: o.productType,
          designType: o.designType === 'custom' ? 'Custom' : 'Catalogue',
          date: new Date(o.createdAt).toISOString().split('T')[0],
          price: o.finalTotalCost 
            ? `Rs. ${o.finalTotalCost.toLocaleString()}` 
            : o.estimatedPrice 
              ? `Rs. ${o.estimatedPrice.toLocaleString()}` 
              : "Pending",
          status: o.status,
          progress: o.progress,
          finalMaterialCost: o.finalMaterialCost,
          finalLaborCost: o.finalLaborCost,
          finalTotalCost: o.finalTotalCost,
          quotationPdfUrl: o.quotationPdfUrl,
          measurements: o.measurements,
          color: o.color,
          accessories: o.accessories,
          estimatedPrice: o.estimatedPrice,
          strengthCategory: o.strengthCategory,
          environment: o.environment,
          purpose: o.purpose,
          notes: o.notes,
          catalogueDesignId: o.catalogueDesignId
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setIsLoading(false);
    }
  };

  const activeOrders = orders.filter(o => !INACTIVE_STATUSES.includes(o.status));
  const inactiveOrders = orders.filter(o => INACTIVE_STATUSES.includes(o.status));

  const handleApprove = async (id: string) => {
    try {
      const response = await ordersApi.approve(id);
      if (response.success) {
        toast.success("Quotation approved successfully!");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to approve quotation");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await ordersApi.cancel(id);
      if (response.success) {
        toast.success("Order cancelled");
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const renderRow = (order: Order) => (
    <TableRow key={order._id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group cursor-pointer" onClick={() => onViewDetails(order)}>
      <TableCell className="font-mono text-zinc-300 font-medium text-center">{order.id}</TableCell>
      <TableCell className="text-zinc-300 text-center">{order.productType}</TableCell>
      <TableCell className="text-center">
        <span className={`text-xs px-2 py-0.5 rounded border ${
          order.designType === 'Custom' 
            ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
            : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
        }`}>
          {order.designType}
        </span>
      </TableCell>
      <TableCell className="text-zinc-400 text-center">{order.date}</TableCell>
      <TableCell className="text-zinc-200 font-semibold text-center">{order.price}</TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center">
          <OrderStatusBadge status={order.status} />
        </div>
      </TableCell>
      <TableCell className="text-center">
        <OrderProgressTracker progress={order.progress} status={order.status} />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(order);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Download Quotation
              </DropdownMenuItem>
              {order.status === 'quotation_sent' && (
                <DropdownMenuItem 
                  className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(order._id);
                  }}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Accept Quotation
                </DropdownMenuItem>
              )}
              {(!INACTIVE_STATUSES.includes(order.status) && order.status !== 'production' && order.status !== 'installation') && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(order._id);
                    }}
                  >
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
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10 rounded-xl border border-zinc-800">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md overflow-hidden">
        {/* Active Orders Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-zinc-400 font-bold text-center">Order ID</TableHead>
                <TableHead className="text-zinc-400 font-bold text-center">Product</TableHead>
                <TableHead className="text-zinc-400 font-bold text-center">Design</TableHead>
                <TableHead className="text-zinc-400 font-bold text-center">Date</TableHead>
                <TableHead className="text-zinc-400 font-bold text-center">Estimated Price</TableHead>
                <TableHead className="text-zinc-400 font-bold text-center">Status</TableHead>
                <TableHead className="text-zinc-400 font-bold w-[180px] text-center">Progress</TableHead>
                <TableHead className="text-zinc-400 font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeOrders.map(renderRow)}
              {activeOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-zinc-500">
                    No active orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Active Cards */}
        <div className="md:hidden divide-y divide-zinc-800">
          {activeOrders.map((order) => (
            <div key={order._id} className="p-4 bg-zinc-900/20 space-y-4" onClick={() => onViewDetails(order)}>
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
                  <Button size="sm" variant="outline" className="bg-zinc-950 border-zinc-800 text-xs h-8">
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inactive Toggle */}
      {inactiveOrders.length > 0 && (
        <div className="flex flex-col items-center gap-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 h-9 px-4 rounded-lg transition-all"
          >
            {showInactive ? (
              <ChevronUp className="mr-2 h-4 w-4" />
            ) : (
              <ChevronDown className="mr-2 h-4 w-4" />
            )}
            {showInactive ? "Hide Inactive Orders" : "Show Inactive Orders"}
          </Button>

          <AnimatePresence>
            {showInactive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full space-y-4"
              >
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/40 overflow-hidden backdrop-blur-xl">
                  <div className="px-5 py-3 bg-zinc-900/60 border-b border-zinc-800/40 flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                      <History className="h-4 w-4 text-teal-400" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-200">Completed and Cancelled Orders</span>
                  </div>
                  
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-zinc-950/30">
                        <TableRow className="hover:bg-transparent border-zinc-800/50">
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Order ID</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Product</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Design</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Date</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Price</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Status</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider w-[180px] text-center">Progress</TableHead>
                          <TableHead className="text-zinc-500 font-bold text-xs uppercase tracking-wider text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inactiveOrders.map(renderRow)}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Inactive Cards */}
                  <div className="md:hidden divide-y divide-zinc-800/50">
                    {inactiveOrders.map((order) => (
                      <div key={order._id} className="p-4 bg-zinc-900/10 space-y-4" onClick={() => onViewDetails(order)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-mono text-zinc-600 mb-1">{order.id}</p>
                            <h3 className="font-semibold text-zinc-300">{order.productType}</h3>
                          </div>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <OrderProgressTracker progress={order.progress} status={order.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
