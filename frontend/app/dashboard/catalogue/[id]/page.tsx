"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, LayoutGrid, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { designsApi } from "@/lib/api";
import { Design3DViewer } from "@/components/catalogue/Design3DViewer";
import { QuotationConfigPanel } from "@/components/dashboard/design/QuotationConfigPanel";

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

interface Design {
  _id: string;
  title: string;
  category: string;
  description: string;
  imageUrls?: string[];
  modelUrl?: string;
}

// Map category to product type for the quotation config
const categoryToProductType: Record<string, string> = {
  windows: "window",
  doors: "door",
  cupboards: "cupboard",
  pantries: "pantry",
  ceilings: "other",
  partitions: "partition",
  railings: "railing",
};

export default function CatalogueDesignDetailPage() {
  const params = useParams<{ id: string }>();
  const designId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [design, setDesign] = useState<Design | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const productType =
    categoryToProductType[design?.category?.toLowerCase() || ""] || "other";

  const imageUrls = design?.imageUrls || [];
  const hasMultipleImages = imageUrls.length > 1;

  return (
    <DashboardLayout title="Design Details">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Back button */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
          <Link href="/dashboard/catalogue">
            <Button
              variant="outline"
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalogue
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-24"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          </motion.div>
        ) : !design ? (
          <motion.div 
            key="not-found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            variants={itemVariants}
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-12 text-center text-zinc-400">
                Design not found.
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key={`content-${design._id}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid gap-6 lg:grid-cols-5"
          >
            {/* Left: Design preview & info (3 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 space-y-4"
            >
              {/* Image/3D preview */}
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative group/preview">
                <div className="relative aspect-square sm:aspect-video lg:aspect-[16/10] bg-zinc-800/50 flex items-center justify-center">
                  {design.modelUrl ? (
                    <div className="w-full h-full">
                      <Design3DViewer modelUrl={design.modelUrl} />
                    </div>
                  ) : imageUrls.length > 0 ? (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeImageIndex}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                          src={
                            imageUrls[activeImageIndex].startsWith("/")
                              ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${imageUrls[activeImageIndex]}`
                              : imageUrls[activeImageIndex]
                          }
                          alt={design.title}
                          className="h-full w-full object-cover"
                        />
                      </AnimatePresence>

                      {/* Navigation arrows */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={() =>
                              setActiveImageIndex((prev) =>
                                prev === 0 ? imageUrls.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 opacity-0 group-hover/preview:opacity-100 hover:bg-sky-500/80 hover:border-sky-400/50 transition-all z-10"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() =>
                              setActiveImageIndex((prev) =>
                                prev === imageUrls.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 opacity-0 group-hover/preview:opacity-100 hover:bg-sky-500/80 hover:border-sky-400/50 transition-all z-10"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                        </>
                      )}

                      {/* Dot indicators */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                          {imageUrls.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImageIndex(i)}
                              className={`h-1.5 rounded-full transition-all ${
                                i === activeImageIndex
                                  ? "w-6 bg-sky-400"
                                  : "w-1.5 bg-white/30 hover:bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-600">
                      <div className="h-16 w-16 rounded-full bg-zinc-800/80 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <span className="text-sm font-medium">No preview available</span>
                    </div>
                  )}

                  {/* 3D Indicator */}
                  {design.modelUrl && (
                    <div className="absolute top-4 right-4 bg-sky-500/20 backdrop-blur-md border border-sky-500/30 text-sky-300 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest pointer-events-none shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                      Interactive 3D View
                    </div>
                  )}
                </div>
              </Card>

              {/* Design info */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-zinc-100">{design.title}</h2>
                    <Badge variant="outline" className="text-zinc-400 border-zinc-700 capitalize">
                      {design.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {design.description}
                  </p>

                  {/* Info note */}
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 px-3 py-2.5">
                    <p className="text-[11px] leading-relaxed text-sky-400/80">
                      <strong>Note:</strong> You can customize the measurements, color,
                      accessories, and other options. The design structure cannot be
                      modified.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Quotation Configuration Panel (2 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <div className="border-b border-zinc-800 px-5 py-3 flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-sky-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    Configure & Request Quotation
                  </h3>
                </div>
                <div className="h-[calc(100vh-16rem)] min-h-[500px] overflow-hidden">
                  <QuotationConfigPanel
                    productType={productType}
                    catalogueDesignId={design._id}
                    catalogueDesignTitle={design.title}
                  />
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
