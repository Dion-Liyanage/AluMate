"use client";

import { useState, useEffect } from "react";
import { motion, animate } from "framer-motion";
import { 
  Package, 
  Clock, 
  Receipt, 
  CheckCircle2, 
  Wrench,
  ShoppingCart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(val) {
        setCount(Math.round(val));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <>{count}</>;
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

export function OrdersOverviewCards() {
  const [statsData, setStatsData] = useState({
    total: 0,
    pending: 0,
    production: 0,
    completed: 0,
    services: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await ordersApi.getAll();
      if (response.success && response.data) {
        const allOrders = (response.data.orders || response.data || []) as any[];
        // Only count orders past the quotation stage
        const QUOTATION_STATUSES = ['quotation_pending', 'quotation_sent', 'draft'];
        const orders = allOrders.filter((o: any) => !QUOTATION_STATUSES.includes(o.status));
        setStatsData({
          total: orders.length,
          pending: orders.filter(o => o.status === 'approved').length,
          production: orders.filter(o => o.status === 'production' || o.status === 'installation').length,
          completed: orders.filter(o => o.status === 'completed').length,
          services: 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch user order stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: "Total Orders", value: statsData.total, icon: Package, color: "from-indigo-500/30 to-indigo-600/20", iconColor: "text-indigo-300", borderColor: "border-indigo-500/40", glowColor: "hover:shadow-indigo-500/10" },
    { title: "Active Orders", value: statsData.production, icon: Clock, color: "from-amber-500/30 to-amber-600/20", iconColor: "text-amber-300", borderColor: "border-amber-500/40", glowColor: "hover:shadow-amber-500/10" },
    { title: "Pending Quotations", value: statsData.pending, icon: Receipt, color: "from-purple-500/30 to-purple-600/20", iconColor: "text-purple-300", borderColor: "border-purple-500/40", glowColor: "hover:shadow-purple-500/10" },
    { title: "Completed Orders", value: statsData.completed, icon: CheckCircle2, color: "from-blue-500/30 to-blue-600/20", iconColor: "text-blue-300", borderColor: "border-blue-500/40", glowColor: "hover:shadow-blue-500/10" },
    { title: "Service Requests", value: statsData.services, icon: Wrench, color: "from-emerald-500/30 to-emerald-600/20", iconColor: "text-emerald-300", borderColor: "border-emerald-500/40", glowColor: "hover:shadow-emerald-500/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group">
        {/* Color Tints */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/8 to-emerald-500/8 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/35 pointer-events-none" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />

        {/* Background glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute bottom-6 right-24 h-56 w-56 bg-emerald-500/12 rounded-full blur-[75px] opacity-35" />

        {/* Large faded ShoppingCart icon */}
        <div className="absolute top-8 right-8 opacity-[0.15] pointer-events-none group-hover:opacity-[0.2] transition-opacity">
          <ShoppingCart className="w-48 h-48 text-emerald-300" />
        </div>

        <CardHeader className="relative pb-4">
          <div>
            <CardTitle className="text-2xl text-zinc-100">Orders Overview</CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Quick snapshot of all your fabrication orders and service requests.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          >
            {statCards.map((stat, index) => (
              <motion.div key={stat.title} variants={itemVariants} className="h-full">
                <div className={`relative h-full overflow-hidden rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg ${stat.glowColor} group/card`}>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor} group-hover/card:bg-black/60 transition-colors`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-zinc-100 group-hover/card:scale-105 transition-transform origin-left">
                      <AnimatedCounter value={stat.value} />
                    </p>
                    <p className="text-xs text-zinc-400 font-medium group-hover/card:text-zinc-300 transition-colors">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
