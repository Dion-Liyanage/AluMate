"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, DoorOpen, Layers, Plus, RefreshCw, AppWindow } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminMaterialsApi } from "@/lib/api";
import type { ProductTemplate, SystemType } from "@/types";

const PRODUCT_SYSTEMS: { productType: "window" | "door"; label: string; systems: SystemType[] }[] = [
  { productType: "window", label: "Windows", systems: ["sliding", "swing", "fixed"] },
  { productType: "door", label: "Doors", systems: ["sliding", "swing"] },
];

const describeBand = (band: ProductTemplate["sizeBands"][number]) => {
  const limits = [
    band.maxWidthFt ? `W ≤ ${band.maxWidthFt}ft` : null,
    band.maxHeightFt ? `H ≤ ${band.maxHeightFt}ft` : null,
    band.maxAreaSqFt ? `≤ ${band.maxAreaSqFt} sq.ft` : null,
    band.maxPanelWidthFt ? `panel ≤ ${band.maxPanelWidthFt}ft` : null,
  ].filter(Boolean);
  const size = limits.length ? limits.join(", ") : "any larger size";
  return band.pricePerSqFt ? `${size} · LKR ${band.pricePerSqFt.toLocaleString()}/sq.ft` : size;
};

export default function ProductTemplatesPage() {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminMaterialsApi.getTemplates();
      setTemplates(response.data ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <DashboardLayout title="Product Templates">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-zinc-100">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Layers className="h-5 w-5 text-violet-100" />
              </span>
              Product Templates
            </h2>
            <p className="mt-1 max-w-2xl text-zinc-400">
              Rules that turn a customer&apos;s size into an exact aluminium cut list. Each template has size bands —
              larger openings automatically move to stronger profile series.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadTemplates}
            disabled={isLoading}
            className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {PRODUCT_SYSTEMS.map(({ productType, label, systems }) => {
          const Icon = productType === "window" ? AppWindow : DoorOpen;
          return (
            <section key={productType} className="space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                <Icon className="h-4 w-4" />
                {label}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {systems.map((systemType) => {
                  const template = templates.find(
                    (t) => t.productType === productType && t.systemType === systemType
                  );

                  if (!template) {
                    return (
                      <Card key={systemType} className="border-dashed border-zinc-800 bg-zinc-950/40">
                        <CardContent className="flex h-full min-h-40 flex-col items-center justify-center gap-3 p-5 text-center">
                          <p className="text-sm capitalize text-zinc-400">
                            No {systemType} {productType} template
                          </p>
                          <Link href={`/admin/materials/templates/new?productType=${productType}&systemType=${systemType}`}>
                            <Button size="sm" className="gap-1.5 border border-violet-500/40 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25">
                              <Plus className="h-3.5 w-3.5" />
                              Create template
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Link key={systemType} href={`/admin/materials/templates/${template._id}`} className="group">
                      <Card className="h-full border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 transition-all group-hover:border-violet-500/50 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]">
                        <CardContent className="space-y-3 p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-zinc-100">{template.name}</p>
                              <p className="text-[11px] text-zinc-500">
                                {template.minPanels === template.maxPanels
                                  ? `${template.minPanels} panel`
                                  : `${template.minPanels}–${template.maxPanels} panels (default ${template.defaultPanels})`}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!template.isActive && (
                                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>

                          <ol className="space-y-1.5">
                            {template.sizeBands.map((band, index) => (
                              <li key={index} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                                <p className="text-xs font-medium text-zinc-200">
                                  {index + 1}. {band.name}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                  {describeBand(band)} · {band.lines.length} cut-list lines
                                </p>
                              </li>
                            ))}
                          </ol>

                          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-violet-400/80 group-hover:text-violet-300">
                            Edit rules
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
