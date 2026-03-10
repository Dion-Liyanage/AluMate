"use client";

import { motion } from "framer-motion";
import { PenTool, ArrowRight } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const productTypes = [
  { name: "Window", emoji: "🪟", description: "Sliding, casement, fixed & louvre windows" },
  { name: "Door", emoji: "🚪", description: "Entrance, sliding, folding & French doors" },
  { name: "Cupboard", emoji: "🗄️", description: "Kitchen, wardrobe & storage cupboards" },
  { name: "Partition", emoji: "🧱", description: "Office, bathroom & room partitions" },
  { name: "Railing", emoji: "🏗️", description: "Balcony, staircase & boundary railings" },
  { name: "Other", emoji: "✨", description: "Custom aluminium fabrication work" },
];

export default function DesignPage() {
  return (
    <DashboardLayout title="Customize Product">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <PenTool className="h-6 w-6 text-violet-400" />
            Select Product Type
          </h2>
          <p className="mt-1 text-zinc-400">
            Choose the type of aluminium product you want to design.
          </p>
        </div>

        {/* Product Type Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productTypes.map((type, i) => (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-violet-500/40 transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <CardContent className="p-6 min-h-[180px] flex flex-col">
                  <div className="text-4xl mb-3">{type.emoji}</div>
                  <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors">
                    {type.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{type.description}</p>
                  <div className="mt-auto pt-3 flex items-center gap-1 text-sm text-zinc-500 group-hover:text-violet-400 transition-colors">
                    Select
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming soon note */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-sm text-zinc-500">
            🚧 Design Studio integration (Fabric.js / Three.js) coming soon.
            Product selection will link to the full design editor.
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
