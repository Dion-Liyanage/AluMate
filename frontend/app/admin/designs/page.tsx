"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DesignTable } from "@/components/admin/designs/DesignTable";
import { AddDesignDialog } from "@/components/admin/designs/AddDesignDialog";
import { designsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const response = await designsApi.getAll();
      setDesigns(response.data || []);
    } catch (error) {
      console.error("Failed to fetch designs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  return (
    <DashboardLayout title="Manage Catalogue">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-sky-400" />
              Design Catalogue
            </h2>
            <p className="mt-1 text-zinc-400">
              Manage pre-designed aluminium products shown to customers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchDesigns}
              disabled={isLoading}
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <AddDesignDialog onSuccess={fetchDesigns} />
          </div>
        </div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
          ) : (
            <DesignTable designs={designs} onRefresh={fetchDesigns} />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
