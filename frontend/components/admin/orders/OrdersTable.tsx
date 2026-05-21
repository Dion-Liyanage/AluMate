"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  FileCheck, 
  XCircle,
  FileText,
  Calendar,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronUp,
  History
} from "lucide-react";
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
import { OrderStatusBadge, AdminOrderStatus } from "./OrderStatusBadge";
import { OrderDetailsModal } from "./OrderDetailsModal";

export interface Order {
  id: string;
  _id?: string;
  customerName: string;
  productType: string;
  designType: 'Custom' | 'Catalogue';
  price: string;
  status: AdminOrderStatus;
  progress: number;
  date: string;
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
  notes?: { message: string; createdBy?: string }[];
  catalogueDesignId?: any;
  recommendedMaterials?: any[];
  laborCalculation?: any;
}

interface OrdersTableProps {
  orders: Order[];
  onRefresh?: () => void;
}

export function OrdersTable({ orders, onRefresh }: OrdersTableProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const inactiveOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Orders Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-950/50">
            <TableRow className="hover:bg-transparent border-zinc-800/50">
              <TableHead className="text-zinc-400 font-bold text-center">Order ID</TableHead>
              <TableHead className="text-zinc-400 font-bold text-center">Customer</TableHead>
              <TableHead className="text-zinc-400 font-bold text-center">Product Type</TableHead>
              <TableHead className="text-zinc-400 font-bold text-center">Design</TableHead>
              <TableHead className="text-zinc-400 font-bold text-center">Quotation</TableHead>
              <TableHead className="text-zinc-400 font-bold text-center">Status</TableHead>
              <TableHead className="text-zinc-400 font-bold w-[180px] text-center">Progress</TableHead>
              <TableHead className="text-zinc-400 font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {activeOrders.map((order) => (
                <motion.tr
                  layout
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleViewDetails(order)}
                  className="border-zinc-800/50 hover:bg-zinc-900/40 transition-all duration-200 group cursor-pointer"
                >
                  <TableCell className="font-mono text-zinc-300 font-medium text-center">{order.id}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-200 font-semibold">{order.customerName}</span>
                      <span className="text-[10px] text-zinc-500">Regular Client</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300 text-center">{order.productType}</TableCell>
                  <TableCell className="text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-wider uppercase font-bold ${
                      order.designType === 'Custom' 
                        ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' 
                        : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {order.designType}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-200 font-bold text-center">{order.price}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold px-1">
                        <span className="text-zinc-500 uppercase tracking-tighter">Fabrication</span>
                        <span className="text-emerald-400">{order.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${order.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            order.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                            order.status === 'cancelled' ? 'bg-red-500' :
                            'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          }`}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(order);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:bg-zinc-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 shadow-2xl backdrop-blur-xl">
                          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                            <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                            Manage Quotation
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                            <Calendar className="h-4 w-4 mr-2 text-zinc-400" />
                            Schedule Installation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer py-2 font-semibold">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer py-2 text-red-400">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        
        {activeOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/10">
            <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4">
              <Search className="h-8 w-8 text-zinc-700" />
            </div>
            <h3 className="text-zinc-300 font-semibold text-lg">No active orders found</h3>
            <p className="text-zinc-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Inactive Orders Section */}
      {inactiveOrders.length > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 h-10 px-6 rounded-xl transition-all shadow-lg"
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
                className="w-full rounded-xl border border-zinc-800/50 bg-zinc-950/30 overflow-hidden backdrop-blur-md shadow-2xl"
              >
                <div className="px-5 py-4 bg-zinc-900/60 border-b border-zinc-800/50 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <History className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-100 tracking-tight">Completed and Cancelled Orders</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Historical fabrication records</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/30">
                      <TableRow className="border-zinc-800/50">
                        <TableHead className="text-zinc-400 font-bold text-center text-[10px] uppercase">Order ID</TableHead>
                        <TableHead className="text-zinc-400 font-bold text-center text-[10px] uppercase">Customer</TableHead>
                        <TableHead className="text-zinc-400 font-bold text-center text-[10px] uppercase">Product Type</TableHead>
                        <TableHead className="text-zinc-400 font-bold text-center text-[10px] uppercase">Status</TableHead>
                        <TableHead className="text-zinc-400 font-bold text-center text-[10px] uppercase">Completed Date</TableHead>
                        <TableHead className="text-zinc-400 font-bold text-center text-[10px] uppercase">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveOrders.map((order) => (
                        <TableRow 
                          key={order.id} 
                          className="border-zinc-800/20 bg-zinc-950/10 hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                        >
                          <TableCell className="font-mono text-zinc-400 text-center text-xs">{order.id}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-zinc-300 font-medium">{order.customerName}</span>
                          </TableCell>
                          <TableCell className="text-zinc-400 text-center text-sm">{order.productType}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center scale-90">
                              <OrderStatusBadge status={order.status} />
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-500 text-center text-xs">
                            <div className="flex items-center gap-2 justify-center">
                              <Calendar className="h-3 w-3" />
                              {order.date}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(order);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <OrderDetailsModal 
        order={selectedOrder}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRefresh={onRefresh}
      />
    </div>
  );
}
