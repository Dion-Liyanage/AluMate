"use client";

import { motion } from "framer-motion";
import { PenTool, ArrowRight, PlusCircle, Clock } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

// Mock saved designs
const savedDesigns = [
  { id: "1", name: "Modern Kitchen Cupboard", type: "Cupboard", date: "2 days ago", thumbnail: "🗄️", status: "Draft" },
  { id: "2", name: "Living Room Partition", type: "Partition", date: "1 week ago", thumbnail: "🧱", status: "Ready to Order" },
  { id: "3", name: "Balcony Sliding Door", type: "Door", date: "2 weeks ago", thumbnail: "🚪", status: "Draft" },
];

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
          <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-2">
            <PenTool className="h-7 w-7 text-violet-400" />
            Design Studio
          </h2>
          <p className="mt-2 text-zinc-400">
            Create a new aluminium product from scratch or continue where you left off.
          </p>
        </motion.div>

        {/* Primary Actions */}
        {/* Primary Actions */}
        <motion.div variants={itemVariants} className="w-full">
          {/* Start New */}
          <Link href="/dashboard/design/new" className="block group">
            <div className="relative h-full rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/10 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
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

        {/* Recent Drafts Section */}
        <motion.div variants={itemVariants} className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-400" />
              Recent Drafts & Saved Designs
            </h3>
            <Link href="/dashboard/designs/saved" className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedDesigns.map((design, i) => (
              <motion.div
                key={design.id}
                variants={itemVariants}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-violet-500/40 transition-all cursor-pointer group overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                  <div className="relative h-32 bg-zinc-800/50 flex items-center justify-center border-b border-zinc-800 text-5xl">
                    {design.thumbnail}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors line-clamp-1">
                        {design.name}
                      </h4>
                      <Badge variant="outline" className="bg-zinc-900/50 text-xs border-zinc-700">
                        {design.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Edited {design.date}
                      </span>
                      <span className="text-sm text-zinc-500 group-hover:text-violet-400 transition-colors flex items-center gap-1">
                        Edit
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
