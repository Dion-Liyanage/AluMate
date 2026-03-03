"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Wrench,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

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

// Placeholder data — will be replaced with API calls
const summaryStats = [
  {
    title: "Total Orders",
    value: "0",
    icon: ClipboardList,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
  },
  {
    title: "Pending Orders",
    value: "0",
    icon: Clock,
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
  },
  {
    title: "Active Quotations",
    value: "0",
    icon: FileText,
    color: "from-indigo-500/20 to-indigo-600/10",
    iconColor: "text-indigo-400",
  },
  {
    title: "Service Requests",
    value: "0",
    icon: Wrench,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
  },
];

const recentOrders: {
  id: string;
  title: string;
  status: string;
  date: string;
  amount?: string;
}[] = [];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-zinc-100">
            Welcome back
            {user ? `, ${user.firstName}` : ""}! 👋
          </h2>
          <p className="mt-1 text-zinc-400">
            Here&apos;s an overview of your fabrication orders and services.
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {summaryStats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold text-zinc-100">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center border border-zinc-800`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-zinc-100">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link href="/orders/new">
                  <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </Link>
                <Link href="/quotations/request">
                  <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Request Quotation
                  </Button>
                </Link>
                <Link href="/services/new">
                  <Button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
                    <Wrench className="h-4 w-4 mr-2" />
                    Service Request
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg text-zinc-100">
                Recent Orders
              </CardTitle>
              <Link href="/orders">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                    <AlertCircle className="h-6 w-6 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 text-sm">No orders yet</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Place your first fabrication order to get started
                  </p>
                  <Link href="/orders/new" className="mt-4">
                    <Button
                      size="sm"
                      className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Place Order
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order, index) => (
                    <div key={order.id}>
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center justify-between py-2 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <ClipboardList className="h-4 w-4 text-zinc-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                              {order.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {order.amount && (
                            <span className="text-sm text-zinc-400">
                              {order.amount}
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={statusColors[order.status] || ""}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </Link>
                      {index < recentOrders.length - 1 && (
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
