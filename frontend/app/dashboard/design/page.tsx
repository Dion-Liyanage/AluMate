"use client";

import { motion } from "framer-motion";
import { PenTool, ArrowRight, PlusCircle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Link from "next/link";

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



export default function DesignGatewayPage() {
  return (
    <DashboardLayout title="Product Customizer">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-xl bg-violet-500/30 border border-violet-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] relative group">
              <PenTool className="h-6 w-6 text-violet-100 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Design Studio</h2>
          </div>
          <p className="mt-2 text-zinc-400">
            Create a new aluminium product from scratch or continue where you left off.
          </p>
        </motion.div>

        {/* Primary Actions */}
        {/* Primary Actions */}
        <motion.div variants={itemVariants} className="w-full">
          {/* Start New */}
          <Link href="/dashboard/design/new" className="block group">
            <div className="relative h-full rounded-2xl border border-violet-500/30 bg-linear-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/10 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%] animate-[shimmer_3s_linear_infinite]" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                 <PlusCircle className="w-48 h-48 text-violet-300" />
              </div>
              <div className="relative z-10 hidden sm:block mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl border border-violet-500/50 bg-violet-500/20 text-violet-300 shadow-lg">
                  <PlusCircle className="h-8 w-8" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-zinc-100 group-hover:text-white transition-colors mb-4">
                  Create Your Own Design
                </h3>
                <p className="text-zinc-400 max-w-md mb-8 text-lg">
                  Select a product type and use our 3D design studio to customize dimensions, colors, and materials.
                </p>
                <div className="flex items-center gap-2 text-base font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                  Create New Project
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        

      </motion.div>
    </DashboardLayout>
  );
}
