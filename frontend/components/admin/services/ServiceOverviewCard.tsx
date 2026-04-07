"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Clock, Users, History, MapPin } from "lucide-react";
import { motion, animate } from "framer-motion";
import { servicesApi } from "@/lib/api";

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

const INACTIVE_STATUSES = ["Completed", "Rejected", "Cancelled by Customer"];

export function ServiceOverviewCard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    inactiveRequests: 0,
    onSiteVisits: 0,
    repairRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await servicesApi.getAll();
        if (response.success && response.data) {
          const requests = response.data.serviceRequests || [];
          setStats({
            totalRequests: requests.length,
            activeRequests: requests.filter((r: any) => !INACTIVE_STATUSES.includes(r.status)).length,
            inactiveRequests: requests.filter((r: any) => INACTIVE_STATUSES.includes(r.status)).length,
            onSiteVisits: requests.filter((r: any) => r.serviceType === "on-site-visit").length,
            repairRequests: requests.filter((r: any) => r.serviceType === "repair").length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      icon: Users,
      label: "Total Requests",
      value: stats.totalRequests,
      color: "from-indigo-500/30 to-indigo-600/20",
      iconColor: "text-indigo-300",
      borderColor: "border-indigo-500/40",
    },
    {
      icon: Clock,
      label: "Active",
      value: stats.activeRequests,
      color: "from-amber-500/30 to-amber-600/20",
      iconColor: "text-amber-300",
      borderColor: "border-amber-500/40",
    },
    {
      icon: History,
      label: "Inactive",
      value: stats.inactiveRequests,
      color: "from-emerald-500/30 to-emerald-600/20",
      iconColor: "text-emerald-300",
      borderColor: "border-emerald-500/40",
    },
    {
      icon: MapPin,
      label: "On-Site Visits",
      value: stats.onSiteVisits,
      color: "from-fuchsia-500/30 to-fuchsia-600/20",
      iconColor: "text-fuchsia-300",
      borderColor: "border-fuchsia-500/40",
    },
    {
      icon: Wrench,
      label: "Repair Requests",
      value: stats.repairRequests,
      color: "from-cyan-500/30 to-cyan-600/20",
      iconColor: "text-cyan-300",
      borderColor: "border-cyan-500/40",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative group">
        {/* Main palette tint (Fuchsia + Pink + Rose) while keeping dark base */}
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/8 via-pink-500/8 to-rose-500/8 pointer-events-none" />

        {/* Dark depth layer to match previous darker look */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/35 pointer-events-none" />

        {/* Wave shimmer effect */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />

        {/* Decorative background glow (localized accents) */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute bottom-6 right-24 h-56 w-56 bg-pink-500/12 rounded-full blur-[75px] opacity-35" />
        <div className="absolute top-24 right-1/3 h-48 w-48 bg-rose-500/10 rounded-full blur-[70px] opacity-30" />

        {/* Decorative background icon (Fuchsia) */}
        <div className="absolute top-8 right-8 opacity-[0.15] pointer-events-none group-hover:opacity-[0.2] transition-opacity">
          <Wrench className="w-48 h-48 text-fuchsia-300" />
        </div>

        <CardHeader className="relative pb-4">
          <div>
            <CardTitle className="text-2xl text-zinc-100">Service Overview</CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              Quick snapshot of all service requests and on-site visit bookings.
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
                  <div className={`relative overflow-hidden rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-fuchsia-500/10`}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor}`}>
                        <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-zinc-100">
                        {isLoading ? "-" : <AnimatedCounter value={stat.value} />}
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
