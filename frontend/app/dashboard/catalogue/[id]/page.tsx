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
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
              <div className="aspect-video bg-zinc-800/50 flex items-center justify-center border-b border-zinc-800">
                {design.imageUrls && design.imageUrls.length > 0 ? (
                  <img
                    src={design.imageUrls[0].startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${design.imageUrls[0]}` : design.imageUrls[0]}
                    alt={design.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LayoutGrid className="h-8 w-8 text-zinc-600" />
                )}
              </div>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-zinc-100">{design.title}</h2>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-700 capitalize">
                    {design.category}
                  </Badge>
                </div>

                <p className="text-zinc-400 leading-relaxed">{design.description}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
