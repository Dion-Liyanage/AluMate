"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  Users,
  LayoutGrid,
  Wrench,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminOperationCards } from "@/components/admin/AdminOperationCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Placeholder analytics — will be replaced with API data
const analyticsCards = [
  {
    title: "Total Orders",
    value: "0",
    trend: "+0%",
    icon: ClipboardList,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    trendUp: true,
  },
  {
    title: "Revenue",
    value: "Rs. 0",
    trend: "+0%",
    icon: DollarSign,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    trendUp: true,
  },
  {
    title: "Active Customers",
    value: "0",
    trend: "+0%",
    icon: Users,
    color: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-400",
    trendUp: true,
  },
  {
    title: "Pending Quotations",
    value: "0",
    trend: "",
    icon: FileText,
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
    trendUp: false,
  },
  {
    title: "Service Requests",
    value: "0",
    trend: "",
    icon: Wrench,
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    trendUp: false,
  },
];

const quickLinks = [
  { href: "/admin/orders", label: "Manage Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "View Customers", icon: Users },
  { href: "/admin/designs", label: "Design Catalogue", icon: LayoutGrid },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/services", label: "Service Requests", icon: Wrench },
];

const recentActivity: {
  id: string;
  message: string;
  time: string;
  type: string;
}[] = [];

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  if (isLoading || (user && user.role !== "admin")) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-zinc-400">Loading admin dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* 1. Welcome Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-zinc-100">
            Welcome back, Admin! 👋
          </h2>
          <p className="mt-1 text-zinc-400">
            Monitor and manage your aluminium fabrication business operations.
          </p>
        </motion.div>

        {/* 2. Business Operations Section ⭐ */}
        <motion.div variants={itemVariants}>
          <AdminOperationCards />
        </motion.div>

        {/* 3. Statistics Cards */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
        >
          {analyticsCards.map((card) => (
            <Card
              key={card.title}
              className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
              <CardContent className="relative p-5">
                <div className="flex flex-col gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center border border-zinc-800`}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      {card.title}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-2xl font-bold text-zinc-100">
                        {card.value}
                      </p>
                      {card.trend && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            card.trendUp
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {card.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts placeholder + Quick links */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart placeholder */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-zinc-100">
                  Orders Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm">
                    Charts will appear here once order data is available
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Connect the backend to start tracking analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-zinc-100">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                      >
                        <link.icon className="h-4 w-4 mr-3 text-zinc-500" />
                        {link.label}
                        <ArrowRight className="h-4 w-4 ml-auto text-zinc-600" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-zinc-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-6 w-6 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm">No recent activity</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Activity will appear as customers place orders
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-400" />
                          <p className="text-sm text-zinc-300">
                            {activity.message}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {activity.time}
                        </span>
                      </div>
                      {index < recentActivity.length - 1 && (
                        <Separator className="bg-zinc-800/50" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
