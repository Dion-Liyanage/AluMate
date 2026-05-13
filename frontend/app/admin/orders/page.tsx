"use client";

import { motion } from "framer-motion";
import { 
  ShoppingCart, 
} from "lucide-react";
import { OrdersOverviewCard } from "@/components/admin/orders/OrdersOverviewCard";
import { OrdersManagement } from "@/components/admin/orders/OrdersManagement";
import { DashboardLayout } from "@/components/layout/DashboardLayout";


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

export default function AdminOrdersPage() {
  return (
    <DashboardLayout title="Orders Management">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Page Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-100">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/30 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <ShoppingCart className="h-5 w-5 text-emerald-100" />
                </span>
                Orders Management
              </h2>
              <p className="text-zinc-400">
                Monitor fabrication workflows, review quotations, and track production progress.
              </p>
            </div>

          </div>
        </motion.div>

        {/* 2. Overview Statistics Section (Containerized) */}
        <motion.div variants={itemVariants}>
          <OrdersOverviewCard />
        </motion.div>

        {/* 3. Main Management Section (Search + Tabs + Table) */}
        <motion.div variants={itemVariants}>
          <OrdersManagement />
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
