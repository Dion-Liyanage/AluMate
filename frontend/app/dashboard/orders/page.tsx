"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrdersOverviewCards } from "@/components/dashboard/orders/OrdersOverviewCards";
import { OrdersSearchFilters } from "@/components/dashboard/orders/OrdersSearchFilters";
import { OrdersTable } from "@/components/dashboard/orders/OrdersTable";
import { OrderDetailsDrawer } from "@/components/dashboard/orders/OrderDetailsDrawer";
import { OrderStatus } from "@/components/dashboard/orders/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  productType: string;
  designType: "Custom" | "Catalogue";
  date: string;
  price: string;
  status: OrderStatus;
  progress: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  return (
    <DashboardLayout title="My Orders">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-zinc-800 flex items-center justify-center relative group">
                <div className="absolute inset-0 rounded-lg bg-blue-400/5 blur-sm group-hover:bg-blue-400/10 transition-all" />
                <ShoppingCart className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] relative z-10" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">My Orders</h1>
            </div>
            <p className="text-zinc-400">
              Track fabrication progress, quotations, payments, and delivery updates.
            </p>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants}>
          <OrdersOverviewCards />
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={itemVariants}>
          <OrdersSearchFilters />
        </motion.div>

        {/* Orders Table */}
        <motion.div variants={itemVariants}>
          <OrdersTable onViewDetails={handleViewDetails} />
        </motion.div>

        {/* Order Details Drawer */}
        <OrderDetailsDrawer 
          order={selectedOrder} 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
        />
      </motion.div>
    </DashboardLayout>
  );
}
