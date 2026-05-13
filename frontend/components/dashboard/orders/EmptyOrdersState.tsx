"use client";

import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function EmptyOrdersState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10"
    >
      <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse" />
        <ClipboardList className="h-10 w-10 text-zinc-500 relative z-10" />
      </div>
      
      <h2 className="text-xl font-bold text-zinc-200 mb-2">No Orders Yet</h2>
      <p className="text-zinc-500 max-w-sm mb-8">
        You haven't placed any fabrication orders. Start by creating a design or requesting a quotation.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/dashboard/design/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Design
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
