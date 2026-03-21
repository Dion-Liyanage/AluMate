"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { designsApi } from "@/lib/api";

interface Design {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrls?: string[];
}

export default function CatalogueDesignDetailPage() {
  const params = useParams<{ id: string }>();
  const designId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [design, setDesign] = useState<Design | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDesign = async () => {
      if (!designId) return;

      setIsLoading(true);
      try {
        const response = await designsApi.getById(designId);
        setDesign(response.data || null);
      } catch (error) {
        console.error("Failed to fetch design details:", error);
        setDesign(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesign();
  }, [designId]);

  return (
    <DashboardLayout title="Design Details">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard/catalogue">
            <Button
              variant="outline"
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalogue
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </div>
        ) : !design ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-12 text-center text-zinc-400">
              Design not found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-5 relative">
            {/* Page-level ambient glows (Increased brightness) */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none opacity-80" />
            <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none opacity-60" />

            {/* Left Column: Image/Visual */}
            <motion.div 
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-sky-950/40 border-zinc-800 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_5s_linear_infinite]" />
                
                <div className="relative aspect-video bg-zinc-800/20 flex items-center justify-center overflow-hidden">
                  {design.imageUrls && design.imageUrls.length > 0 ? (
                    <img
                      src={design.imageUrls[0].startsWith("/") ? `http://localhost:4000${design.imageUrls[0]}` : design.imageUrls[0]}
                      alt={design.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-600">
                      <LayoutGrid className="h-12 w-12" />
                      <span className="text-sm font-semibold tracking-wider uppercase">Preview Unavailable</span>
                    </div>
                  )}
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent" />
                </div>
              </Card>
            </motion.div>

            {/* Right Column: Details/Info */}
            <motion.div 
              className="lg:col-span-2 flex flex-col gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="flex-1 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl" />
                 
                <CardContent className="relative p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-sky-500/10 text-sky-300 border-sky-500/30 font-semibold px-3 py-1 uppercase tracking-wider text-[10px]">
                        {design.category}
                      </Badge>
                      <LayoutGrid className="h-5 w-5 text-zinc-700" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-zinc-100 tracking-tight leading-tight">
                        {design.title}
                      </h2>
                      <div className="h-1 w-12 bg-sky-500/50 rounded-full mt-4" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Premium design from our architectural collection. Perfectly suite for modern homes.
                    </p>
                  </div>
                  
                  <div className="pt-8 flex flex-col gap-3">
                    <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(2,132,199,0.3)] transition-all active:scale-[0.98]">
                      Use this design
                    </Button>
                    <p className="text-center text-xs text-zinc-500">
                      Prices are calculated based on your custom requirements.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
