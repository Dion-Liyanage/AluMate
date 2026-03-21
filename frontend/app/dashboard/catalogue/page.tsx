"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { designsApi } from "@/lib/api";

interface Design {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrls?: string[];
  isActive: boolean;
}

const categories = ["All", "Windows", "Doors", "Cupboards", "Pantries", "Ceilings"];

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-sky-400" />
            Design Catalogue
          </h2>
          <p className="mt-1 text-zinc-400">
            Browse pre-designed aluminium products. Select a design to place an
            order.
          </p>
        </div>

        {/* Search + Filters */}
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
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Design Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative transition-all duration-300">
            {/* Decorative page-level glow */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {filtered.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/dashboard/catalogue/${item._id}`} className="block h-full group">
                  <Card className="relative h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-sky-950/30 border-zinc-800 hover:border-sky-500/50 transition-all duration-500 overflow-hidden cursor-pointer hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:scale-[1.01]">
                    {/* Shimmer wave */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_linear_infinite]" />
                    
                    {/* Card-level ambient glow */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative h-48 bg-zinc-800/30 flex items-center justify-center border-b border-zinc-800/50 overflow-hidden">
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <img 
                          src={item.imageUrls[0].startsWith('/') ? `http://localhost:4000${item.imageUrls[0]}` : item.imageUrls[0]} 
                          alt={item.title} 
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-zinc-600">
                          <LayoutGrid className="h-8 w-8" />
                          <span className="text-xs uppercase tracking-wider font-semibold">No Preview</span>
                        </div>
                      )}
                      
                      {/* Image Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <CardContent className="relative p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-sky-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge
                          variant="outline"
                          className="bg-sky-500/5 text-zinc-400 border-zinc-800 group-hover:border-sky-500/30 group-hover:text-sky-300 transition-all capitalize"
                        >
                          {item.category}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 group-hover:text-sky-400 transition-colors">
                          View Details
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">
              No designs found matching your criteria.
            </p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
