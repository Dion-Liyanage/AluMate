"use client";

import { motion } from "framer-motion";
import { 
  Package, 
  Clock, 
  Receipt, 
  CheckCircle2, 
  Wrench 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

const stats = [
  {
    title: "Total Orders",
    value: 12,
    icon: Package,
    color: "from-blue-500/30 to-blue-600/20",
    iconColor: "text-blue-300",
    borderColor: "border-blue-500/40",
    glowColor: "hover:shadow-blue-500/10",
  },
  {
    title: "Active Orders",
    value: 3,
    icon: Clock,
    color: "from-amber-500/30 to-amber-600/20",
    iconColor: "text-amber-300",
    borderColor: "border-amber-500/40",
    glowColor: "hover:shadow-amber-500/10",
  },
  {
    title: "Pending Quotations",
    value: 2,
    icon: Receipt,
    color: "from-purple-500/30 to-purple-600/20",
    iconColor: "text-purple-300",
    borderColor: "border-purple-500/40",
    glowColor: "hover:shadow-purple-500/10",
  },
  {
    title: "Completed Orders",
    value: 7,
    icon: CheckCircle2,
    color: "from-emerald-500/30 to-emerald-600/20",
    iconColor: "text-emerald-300",
    borderColor: "border-emerald-500/40",
    glowColor: "hover:shadow-emerald-500/10",
  },
  {
    title: "Service Requests",
    value: 1,
    icon: Wrench,
    color: "from-cyan-500/30 to-cyan-600/20",
    iconColor: "text-cyan-300",
    borderColor: "border-cyan-500/40",
    glowColor: "hover:shadow-cyan-500/10",
  },
];

export function OrdersOverviewCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
    >
      {stats.map((stat, index) => (
        <motion.div key={stat.title} variants={itemVariants} className="h-full">
          <div className={`relative h-full overflow-hidden rounded-lg border ${stat.borderColor} bg-gradient-to-br ${stat.color} p-4 backdrop-blur-sm transition-all hover:shadow-lg ${stat.glowColor} group`}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
            
            {/* Icon section */}
            <div className="flex items-start justify-between mb-4">
              <div className={`h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border ${stat.borderColor} group-hover:bg-black/60 transition-colors`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>

            {/* Content section */}
            <div className="space-y-1">
              <p className="text-2xl font-bold text-zinc-100 group-hover:scale-105 transition-transform origin-left">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
                {stat.title}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}


