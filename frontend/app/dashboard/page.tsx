"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, FileText, Wrench, Clock, Save } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DesignEntryCards } from "@/components/dashboard/DesignEntryCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// badge/separator not used after removal of Recent Orders
import { useAuth } from "@/hooks/useAuth";
import { ordersApi, servicesApi } from "@/lib/api";
import { getSavedDesigns } from "@/lib/saved-designs";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  quoted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  confirmed: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "in-progress": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

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

// Dynamic stats (fetched from API / local storage)

const recentOrders: {
  id: string;
  title: string;
  status: string;
  date: string;
  amount?: string;
}[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    quotationsSent: 0,
    approved: 0,
    inProduction: 0,
    completed: 0,
  });
  const [serviceRequestCount, setServiceRequestCount] = useState(0);
  const [savedDesignCount, setSavedDesignCount] = useState(0);

  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [isLoading, router, user?.role]);

  useEffect(() => {
    // fetch user-specific order stats
    const load = async () => {
      try {
        const res = await ordersApi.getStats();
        if (res?.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        // ignore
      }

      try {
        const sr = await servicesApi.getMyRequests();
        if (sr?.success && sr.data) {
          setServiceRequestCount(sr.data.total || 0);
        }
      } catch (err) {
        // ignore
      }

      // saved designs are stored locally
      try {
        const saved = getSavedDesigns();
        setSavedDesignCount(saved.length);
      } catch (err) {
        // ignore
      }
    };

    load();
  }, []);

  if (isLoading || user?.role === "admin") {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-400">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* 1. Welcome Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-zinc-100">
            Welcome back
            {user ? `, ${user.firstName}` : ""}! 👋
          </h2>
          <p className="mt-1 text-zinc-400">
            Start designing your aluminium product or manage your fabrication
            orders.
          </p>
        </motion.div>

        {/* 2. Design Entry Section ⭐ */}
        <motion.div variants={itemVariants}>
          <DesignEntryCards />
        </motion.div>

        {/* 3. Statistics Cards */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          {/* build stats from fetched data */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Orders</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-100">{stats.totalOrders}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-zinc-800`}>
                  <ClipboardList className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Pending Orders</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-100">{stats.pendingOrders}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-zinc-800`}>
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Active Quotations</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-100">{stats.quotationsSent}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 flex items-center justify-center border border-zinc-800`}>
                  <FileText className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Service Requests</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-100">{serviceRequestCount}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-zinc-800`}>
                  <Wrench className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Saved Designs</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-100">{savedDesignCount}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-zinc-800`}>
                  <Save className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions and Recent Orders removed per request */}
      </motion.div>
    </DashboardLayout>
  );
}
