"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Design3DViewer } from "@/components/catalogue/Design3DViewer";
import { designsApi } from "@/lib/api";

interface Design {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrls?: string[];
  modelUrl?: string;
  isActive: boolean;
}

const categories = ["All", "Windows", "Doors", "Pantries", "Cupboards", "Partitions", "Railings", "Ceilings"];

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

export default function CataloguePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [designs, setDesigns] = useState<Design[]>([]);
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

  const filtered = (designs || []).filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout title="Design Catalogue">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 rounded-xl bg-sky-500/30 border border-sky-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)] relative group">
              <LayoutGrid className="h-6 w-6 text-sky-100 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Design Catalogue</h2>
          </div>
          <p className="mt-1 text-zinc-400">
            Browse pre-designed aluminium products. Select a design to place an
            order.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
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
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Design Grid */}
        {isLoading ? (
          <motion.div variants={itemVariants} className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${filtered.length}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link href={`/dashboard/catalogue/${item._id}`} className="block">
                  <Card className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-sky-500/40 transition-all group overflow-hidden cursor-pointer hover:shadow-[0_0_20px_rgba(56,189,248,0.08)]">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
                    <div className="relative h-64 bg-zinc-800/50 flex items-center justify-center border-b border-zinc-800">
                      {item.modelUrl ? (
                        <Design3DViewer modelUrl={item.modelUrl} />
                      ) : item.imageUrls && item.imageUrls.length > 0 ? (
                        <img 
                          src={item.imageUrls[0].startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${item.imageUrls[0]}` : item.imageUrls[0]} 
                          alt={item.title} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="text-zinc-600 text-sm">Design Preview</div>
                      )}
                    </div>
                    <CardContent className="relative p-4">
                      <h3 className="font-semibold text-zinc-100 group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge
                          variant="outline"
                          className="text-zinc-400 border-zinc-700 capitalize"
                        >
                          {item.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm text-zinc-500 group-hover:text-sky-400 transition-colors">
                          Use Design
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filtered.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <p className="text-zinc-500">
              No designs found matching your criteria.
            </p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
