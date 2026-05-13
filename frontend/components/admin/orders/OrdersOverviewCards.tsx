"use client";

import { useState, useEffect } from "react";
import { motion, animate } from "framer-motion";
import { 
  Package, 
  Receipt, 
  Factory, 
  Truck, 
  CheckCircle2, 
  XCircle,
  LayoutGrid
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

const stats = [
  {
    title: "Total Orders",
    value: 48,
    trend: "+12%",
    trendUp: true,
    icon: Package,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
  },
  {
    title: "Pending Quotations",
    value: 12,
    trend: "8 new",
    trendUp: true,
    icon: Receipt,
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
  },
  {
    title: "Active Productions",
    value: 18,
    trend: "+2",
    trendUp: true,
    icon: Factory,
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
  },
  {
    title: "Installation Scheduled",
    value: 5,
    trend: "Today",
    trendUp: true,
    icon: Truck,
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
  },
  {
    title: "Completed Orders",
    value: 145,
    trend: "+24%",
    trendUp: true,
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
  },
  {
    title: "Cancelled Orders",
    value: 3,
    trend: "-1",
    trendUp: false,
    icon: XCircle,
    color: "from-red-500/20 to-red-600/10",
    iconColor: "text-red-400",
  },
];

export function OrdersOverviewCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
    >
      {stats.map((card) => (
        <motion.div key={card.title} variants={itemVariants}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 transition-all duration-300 group">
            {/* Shimmer wave */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
            
            <CardContent className="relative p-5">
              <div className="flex flex-col gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-zinc-100 group-hover:translate-x-0.5 transition-transform">
                      <AnimatedCounter value={card.value} />
                    </p>
                    {card.trend && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        card.trendUp
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {card.trend}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
