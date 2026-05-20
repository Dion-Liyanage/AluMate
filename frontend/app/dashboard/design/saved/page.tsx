"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, Clock, PlusCircle, PencilLine, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  deleteSavedDesign,
  getSavedDesigns,
  type SavedDesign,
} from "@/lib/saved-designs";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const prettyDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));

export default function SavedDesignsPage() {
  const router = useRouter();
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const loadSavedDesigns = () => setSavedDesigns(getSavedDesigns());

  useEffect(() => {
    setIsMounted(true);
    loadSavedDesigns();
  }, []);

  const designCount = useMemo(() => savedDesigns.length, [savedDesigns]);

  const handleDelete = (id: string) => {
    deleteSavedDesign(id);
    loadSavedDesigns();
    toast.success("Saved design deleted");
  };

  const handleOpen = (design: SavedDesign) => {
    router.push(`/dashboard/design/studio?type=${design.productType}&savedDesignId=${design.id}`);
  };

  if (!isMounted) {
    return (
      <DashboardLayout title="Saved Designs">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Saved Designs">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-xl bg-violet-500/30 border border-violet-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] relative group">
                <Bookmark className="h-6 w-6 text-violet-100 relative z-10" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Saved Designs</h2>
                <p className="mt-2 text-zinc-400">
                  Reopen a saved custom design and continue editing from where you left off.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/design/new"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition-all hover:bg-violet-500/20 hover:text-white hover:border-violet-400/60"
          >
            <PlusCircle className="h-4 w-4" />
            New Design
          </Link>
        </motion.div>

        {designCount === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="border-zinc-800 bg-zinc-950/80 overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  <Bookmark className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">No saved designs yet</h3>
                <p className="mt-2 max-w-md text-zinc-400">
                  Save a design from the studio and it will appear here so you can continue editing later.
                </p>
                <Link
                  href="/dashboard/design/new"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition-all hover:bg-violet-500/20 hover:text-white"
                >
                  Start Designing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {savedDesigns.map((design, index) => (
              <motion.div
                key={design.id}
                variants={itemVariants}
                transition={{ delay: index * 0.05, duration: 0.35 }}
              >
                <Card 
                  onMouseEnter={() => setHoveredCardId(design.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`relative overflow-hidden bg-linear-to-br from-zinc-900 to-zinc-950 transition-all duration-300 group ${
                    hoveredCardId === design.id
                      ? "border-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.22)]"
                      : "border-zinc-800 hover:border-violet-500/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.12)]"
                  }`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.03)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite] pointer-events-none" />
                  <div className="block w-full text-left">
                    <div className="relative h-28 border-b border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {design.previewImage ? (
                        <img
                          src={design.previewImage}
                          alt={design.name}
                          className="h-full w-full object-contain bg-zinc-950/40"
                        />
                      ) : (
                        <div className="text-6xl text-violet-400/70">
                          {design.productType[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent opacity-70" />
                    </div>

                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-zinc-100 transition-colors">
                            {design.name}
                          </h4>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-violet-400/80">
                            {design.productType}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-zinc-700 bg-zinc-900/60 text-zinc-300">
                          Saved
                        </Badge>
                      </div>

                      {design.description && (
                        <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                          {design.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Updated {prettyDate(design.updatedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="border-t border-zinc-800 bg-zinc-950/80 px-3 py-3 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpen(design)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:bg-violet-500/20 ${
                        hoveredCardId === design.id
                          ? "border-violet-500 bg-violet-500/20 text-violet-100 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                          : "border-violet-500/30 bg-violet-500/10 text-violet-200"
                      }`}
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(design.id)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:border-rose-500/40 hover:text-rose-300 hover:bg-rose-500/10 ${
                        hoveredCardId === design.id
                          ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    <Link
                      href={`/dashboard/design/quote/${design.id}`}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:bg-emerald-600/20 ${
                        hoveredCardId === design.id
                          ? "border-emerald-500 bg-emerald-600/20 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : "border-emerald-600/30 bg-emerald-600/10 text-emerald-200"
                      }`}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Order
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}