"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Clock, Users, CheckCircle2, Map } from "lucide-react";
import { motion } from "framer-motion";
import { servicesApi } from "@/lib/api";

export function ServiceOverviewCard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    onSiteVisits: 0,
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
            pendingRequests: requests.filter((r: any) => r.status === "Pending" || r.status === "Request Sent").length,
            completedRequests: requests.filter((r: any) => r.status === "Completed").length,
            onSiteVisits: requests.filter((r: any) => r.serviceType === "on-site-visit").length,
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
      color: "from-fuchsia-500/30 to-fuchsia-600/20",
      iconColor: "text-fuchsia-300",
      borderColor: "border-fuchsia-500/40",
    },
    {
      icon: Clock,
      label: "Pending",
      value: stats.pendingRequests,
      color: "from-amber-500/30 to-amber-600/20",
      iconColor: "text-amber-300",
      borderColor: "border-amber-500/40",
    },
    {
      icon: Map,
      label: "On-Site Visits",
      value: stats.onSiteVisits,
      color: "from-cyan-500/30 to-cyan-600/20",
      iconColor: "text-cyan-300",
      borderColor: "border-cyan-500/40",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: stats.completedRequests,
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
      <Card className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-fuchsia-950/40 border-zinc-800 shadow-xl overflow-hidden relative group">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_linear_infinite] pointer-events-none" />

        {/* Decorative background glow (Fuchsia) */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-fuchsia-500/30 rounded-full blur-[100px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] opacity-50" />

        {/* Decorative background icon (Fuchsia) */}
        <div className="absolute top-8 right-8 opacity-[0.2] pointer-events-none group-hover:opacity-[0.25] transition-opacity">
          <Wrench className="w-48 h-48 text-fuchsia-300" />
        </div>

        <CardHeader className="relative pb-4">
          <div className="flex gap-4">
            <div className="mt-1 h-12 w-12 rounded-xl bg-fuchsia-500/30 flex items-center justify-center border border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              <Wrench className="h-6 w-6 text-fuchsia-100" />
            </div>
            <div>
              <CardTitle className="text-2xl text-zinc-100">Service Overview</CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                Quick snapshot of all service requests and on-site visit bookings.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className={`rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-fuchsia-500/10`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor}`}>
                        <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-zinc-100">
                        {isLoading ? "-" : stat.value}
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
