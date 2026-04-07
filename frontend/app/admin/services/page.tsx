"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ServiceManagement } from "@/components/admin/services/ServiceManagement";
import { ServiceOverviewCard } from "@/components/admin/services/ServiceOverviewCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
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

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <DashboardLayout title="Service Management">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-400">Loading service management...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Service Management">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-100">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/30 border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                  <Wrench className="h-5 w-5 text-fuchsia-100" />
                </span>
                Service Requests
              </h2>
              <p className="text-zinc-400">
                Manage on-site measurements and repair requests from your customers.
              </p>
            </div>
            <Link href="/admin/services/availability">
              <Button className="bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40 hover:text-fuchsia-100 hover:bg-fuchsia-500/30 hover:border-fuchsia-500/60 transition-all font-semibold shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                Manage Availability
              </Button>
            </Link>
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
