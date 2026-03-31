"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, RefreshCw, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DesignTable } from "@/components/admin/designs/DesignTable";
import { AddDesignDialog } from "@/components/admin/designs/AddDesignDialog";
import { designsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = ["All", "Windows", "Doors", "Cupboards", "Pantries", "Ceilings"];

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredDesigns = (designs || []).filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-sky-500/20 text-white/90 border border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
            </div>
          ) : (
            <DesignTable designs={filteredDesigns} onRefresh={fetchDesigns} />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
