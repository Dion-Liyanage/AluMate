"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ServiceManagement } from "@/components/admin/services/ServiceManagement";
import { ServiceOverviewCard } from "@/components/admin/services/ServiceOverviewCard";
import { motion } from "framer-motion";

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

export default function AdminServicesPage() {
  return (
    <DashboardLayout title="Service Management">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-zinc-100">Service Requests</h2>
            <p className="text-zinc-400">
              Manage on-site measurements and repair requests from your customers.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ServiceOverviewCard />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ServiceManagement />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
