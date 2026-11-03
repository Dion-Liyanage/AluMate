"use client";

import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, ImageIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AuthContext } from "@/contexts/AuthContext";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuotationConfigPanel } from "@/components/dashboard/design/QuotationConfigPanel";
import { getSavedDesignById, type SavedDesign } from "@/lib/saved-designs";

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

export default function SavedDesignQuotationPage() {
  const params = useParams<{ id: string }>();
  const designId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isAuthLoading = auth?.isLoading;
  const isAdmin = user?.role === "admin";

  const [design, setDesign] = useState<SavedDesign | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (designId) {
      const found = getSavedDesignById(designId);
      if (found) {
        setDesign(found);
      }
    }
  }, [designId]);

  if (!isMounted || isAuthLoading) {
    return (
      <DashboardLayout title="Saved Design Details">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Saved Design Details">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Back button */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
          <Link href="/dashboard/design/saved">
            <Button
              variant="outline"
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Saved Designs
            </Button>
          </Link>
        </motion.div>

        {!design ? (
          <motion.div 
            key="not-found"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            variants={itemVariants}
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-12 text-center text-zinc-400">
                Saved design not found.
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key={`content-${design.id}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid gap-6 lg:grid-cols-5"
          >
            {/* Left: Design preview & info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 space-y-4"
            >
              {/* Image/Preview */}
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative group/preview">
                <div className="relative aspect-square sm:aspect-video lg:aspect-[16/10] bg-white flex items-center justify-center">
                  {design.previewImage ? (
                    <img
                      src={design.previewImage}
                      alt={design.name}
                      className="h-full w-full object-contain bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-600">
                      <div className="h-16 w-16 rounded-full bg-zinc-800/80 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <span className="text-sm font-medium">No preview available</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Design info */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-sky-400 uppercase tracking-[0.2em]">Custom Design</span>
                      <h2 className="text-xl font-bold text-zinc-100">{design.name}</h2>
                    </div>
                    <Badge variant="outline" className="bg-sky-500/10 text-sky-300 border-sky-500/20 capitalize">
                      {design.productType}
                    </Badge>
                  </div>
                  {design.description && (
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {design.description}
                    </p>
                  )}

                  {/* Info note */}
                  <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 px-3 py-2.5">
                    <p className="text-[11px] leading-relaxed text-sky-400/80">
                      <strong>Note:</strong> You can configure measurements, colors, accessories, and other options. The design geometry you built in the studio is saved and will be sent with your request.
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
                    productType={design.productType}
                    designData={design.designJson}
                    previewImage={design.previewImage}
                    catalogueDesignTitle={design.name}
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
