"use client";

import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Clock, 
  FileText, 
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
    value: "12",
    icon: ClipboardList,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    title: "Active Orders",
    value: "3",
    icon: Clock,
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/30",
  },
  {
    title: "Pending Quotations",
    value: "2",
    icon: FileText,
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
  {
    title: "Completed Orders",
    value: "7",
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  {
    title: "Service Requests",
    value: "1",
    icon: Wrench,
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
  },
];

export function OrdersOverviewCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
    >
      {stats.map((stat) => (
        <motion.div key={stat.title} variants={itemVariants}>
          <Card className={`relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:${stat.borderColor} transition-all duration-300 group`}>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            <CardContent className="relative p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">{stat.title}</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-100 group-hover:scale-105 transition-transform origin-left">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-all`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor} group-hover:scale-110 transition-transform`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
