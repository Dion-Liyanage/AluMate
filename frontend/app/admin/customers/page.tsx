"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomerManagement } from "@/components/admin/customers/CustomerManagement";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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

export default function AdminCustomersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <DashboardLayout title="Customer Management">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-400">Loading customer management...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customer Management">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-1">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/30 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Users className="h-5 w-5 text-violet-100" />
              </span>
              Customer Management
            </h2>
            <p className="text-zinc-400">
              View, search, and manage all registered customers and their
              activity.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <CustomerManagement />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
