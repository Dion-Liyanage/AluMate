"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Receipt, Factory, Truck, CheckCircle2, XCircle, ShoppingCart } from "lucide-react";
import { motion, animate } from "framer-motion";

import { adminOrdersApi } from "@/lib/api";
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

export function OrdersOverviewCard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingQuotations: 0,
    activeProductions: 0,
    installations: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminOrdersApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
      toast.error("Could not load order statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      icon: Package,
      label: "Total Orders",
      value: stats.totalOrders,
      color: "from-indigo-500/30 to-indigo-600/20",
      iconColor: "text-indigo-300",
      borderColor: "border-indigo-500/40",
    },
    {
      icon: Receipt,
      label: "Approved",
      value: (stats as any).approved || 0,
      color: "from-amber-500/30 to-amber-600/20",
      iconColor: "text-amber-300",
      borderColor: "border-amber-500/40",
    },
    {
      icon: Factory,
      label: "Productions",
      value: stats.activeProductions,
      color: "from-purple-500/30 to-purple-600/20",
      iconColor: "text-purple-300",
      borderColor: "border-purple-500/40",
    },
    {
      icon: Truck,
      label: "Installations",
      value: stats.installations,
      color: "from-blue-500/30 to-blue-600/20",
      iconColor: "text-blue-300",
      borderColor: "border-blue-500/40",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: stats.completed,
      color: "from-emerald-500/30 to-emerald-600/20",
      iconColor: "text-emerald-300",
      borderColor: "border-emerald-500/40",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/8 via-teal-500/8 to-emerald-500/8 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />

        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="absolute top-8 right-8 opacity-[0.15] pointer-events-none group-hover:opacity-[0.2] transition-opacity">
          <ShoppingCart className="w-48 h-48 text-emerald-300" />
        </div>

        <CardHeader className="relative pb-4">
          <div>
            <CardTitle className="text-2xl text-zinc-100">Order Overview</CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Quick snapshot of all fabrication orders and delivery status.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className={`relative overflow-hidden rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-emerald-500/10`}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor}`}>
                        <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-zinc-100">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-xs text-zinc-400 font-medium">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
