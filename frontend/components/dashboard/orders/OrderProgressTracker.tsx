"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrderProgressTrackerProps {
  progress: number;
  status: string;
  className?: string;
}

export function OrderProgressTracker({ progress, status, className }: OrderProgressTrackerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-400 font-medium">{status}</span>
        <span className="text-blue-400 font-bold">{progress}%</span>
      </div>
      <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full relative",
            progress < 100 
              ? "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
              : "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          )}
        >
          {progress < 100 && (
            <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
