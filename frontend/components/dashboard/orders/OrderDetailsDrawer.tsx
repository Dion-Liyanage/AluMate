"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { OrderStatusBadge, OrderStatus } from "./OrderStatusBadge";
import { Separator } from "@/components/ui/separator";
import { FileDown, Ruler, Package, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { designsApi } from "@/lib/api";
import { formatMeasurement } from "@/lib/utils";

export interface Order {
  id: string;
  _id: string;
  productType: string;
  designType: "Custom" | "Catalogue";
  date: string;
  price: string;
  status: OrderStatus;
  progress: number;
  finalMaterialCost?: number;
  finalLaborCost?: number;
  finalTotalCost?: number;
  quotationPdfUrl?: string;
  measurements?: Record<string, any>;
  color?: string;
  accessories?: string[];
  estimatedPrice?: number;
  strengthCategory?: string;
  environment?: string;
  purpose?: string;
  notes?: { message: string }[];
  catalogueDesignId?: any;
}

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

export function OrderDetailsDrawer({ order, isOpen, onClose }: OrderDetailsDrawerProps) {
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const res = await designsApi.getAll();
        if (res.success && res.data) {
          setDesigns(res.data);
        }
      } catch (e) {
        console.error("Failed to load designs:", e);
      }
    };
    if (isOpen) {
      loadDesigns();
    }
  }, [isOpen]);

  if (!order) return null;

  const getPdfDownloadUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes('cloudinary.com') && !url.includes('fl_attachment')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const resolvedDesign = typeof order.catalogueDesignId === 'object' && order.catalogueDesignId !== null
    ? order.catalogueDesignId
    : (order.catalogueDesignId ? designs.find(d => d._id === order.catalogueDesignId) : null);

  const designImage = resolvedDesign
    ? (resolvedDesign.imageUrls?.[0] || resolvedDesign.imageUrl)
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl bg-zinc-950 border-zinc-800 p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        <SheetHeader className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-500">{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <SheetTitle className="text-2xl font-bold text-zinc-100">{order.productType}</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Created on {order.date} • {order.designType} Design
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-24">
          {/* Design Details Card */}
          {resolvedDesign ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-400" />
                  Design Details
                </h4>
                <Link href={`/dashboard/catalogue/${resolvedDesign._id}`} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1 text-blue-400" />
                    View Design
                  </Button>
                </Link>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start">
              {designImage && (
                <div className="w-full sm:w-1/3 h-32 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={designImage.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${designImage}`
                      : designImage}
                    alt={resolvedDesign.title || "Design"}
                    className="max-h-28 object-contain rounded-md"
                  />
                </div>
              )}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {resolvedDesign.designCode && (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 bg-blue-500/10 font-mono tracking-wider font-bold">
                      {resolvedDesign.designCode}
                    </span>
                  )}
                  <h5 className="text-sm font-bold text-zinc-200">{resolvedDesign.title}</h5>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-3">{resolvedDesign.description}</p>
              </div>
            </div>
          </div>
          ) : designImage ? (
            <div className="rounded-xl border border-zinc-800/50 overflow-hidden bg-zinc-900/40 p-4 flex items-center justify-center">
              <img
                src={designImage.startsWith('/')
                  ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${designImage}`
                  : designImage}
                alt={order.catalogueDesignId?.title || "Design"}
                className="max-h-48 object-contain rounded-lg shadow-md"
              />
            </div>
          ) : null}

          {/* Product Specifications */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Product Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Product Type</p>
                <p className="text-sm text-zinc-200 capitalize font-medium">{order.productType}</p>
              </div>
              <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Source</p>
                <p className="text-sm text-zinc-200 capitalize font-medium">{order.designType === 'Catalogue' ? 'Catalogue Selection' : 'Custom Design'}</p>
              </div>
              {resolvedDesign ? (
                <>
                  <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Code</p>
                    <p className="text-sm text-zinc-200 font-mono font-medium">{resolvedDesign.designCode || resolvedDesign._id}</p>
                  </div>
                  <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design Name</p>
                    <p className="text-sm text-zinc-200 font-medium">{resolvedDesign.title || 'Catalogue Design'}</p>
                  </div>
                </>
              ) : order.catalogueDesignId ? (
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Design ID</p>
                  <p className="text-sm text-zinc-200 font-mono font-medium">
                    {typeof order.catalogueDesignId === 'string' ? order.catalogueDesignId : order.catalogueDesignId._id}
                  </p>
                </div>
              ) : null}
              <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Color / Finish</p>
                <p className="text-sm text-zinc-200 capitalize font-medium">{order.color || 'Default'}</p>
              </div>
              {order.strengthCategory && (
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Strength</p>
                  <p className="text-sm text-zinc-200 capitalize font-medium">{order.strengthCategory}</p>
                </div>
              )}
              {order.environment && (
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Environment</p>
                  <p className="text-sm text-zinc-200 capitalize font-medium">{order.environment}</p>
                </div>
              )}
              {order.purpose && (
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Purpose</p>
                  <p className="text-sm text-zinc-200 capitalize font-medium">{order.purpose}</p>
                </div>
              )}
            </div>
          </section>

          {/* Measurements */}
          {order.measurements && Object.keys(order.measurements).length > 0 && (
            <section className="space-y-3">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-zinc-400" /> Measurements
              </h4>
              <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(order.measurements).map(([key, value]) => (
                    <div key={key} className="relative flex items-center border-b border-zinc-800/30 pb-2 last:border-0 last:pb-0 h-7">
                      <span className="text-xs text-zinc-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-zinc-200">{formatMeasurement(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Accessories */}
          {order.accessories && order.accessories.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-zinc-400" /> Accessories
              </h4>
              <div className="flex flex-wrap gap-2">
                {order.accessories.map((accessory, index) => (
                  <span key={index} className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 text-zinc-300">
                    {accessory}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Customer Notes */}
          {order.notes && order.notes.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-zinc-400" /> Customer Notes
              </h4>
              <div className="bg-zinc-900/20 rounded-xl p-4 border border-zinc-800/30">
                {order.notes.map((n, idx) => (
                  <p key={idx} className="text-sm text-zinc-400 italic font-medium">&quot;{n.message}&quot;</p>
                ))}
              </div>
            </section>
          )}

          <Separator className="bg-zinc-800/50" />

          {/* Price Details */}
          <section className="space-y-4">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Price Details</h4>
            <div className="space-y-3">
              {order.finalMaterialCost !== undefined && (
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                  <span className="text-xs text-zinc-400 font-medium">Material Cost</span>
                  <span className="text-sm font-bold text-zinc-200">{formatLKR(order.finalMaterialCost)}</span>
                </div>
              )}
              {order.finalLaborCost !== undefined && (
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                  <span className="text-xs text-zinc-400 font-medium">Labor Cost</span>
                  <span className="text-sm font-bold text-zinc-200">{formatLKR(order.finalLaborCost)}</span>
                </div>
              )}

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex justify-between items-center shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <div>
                  <p className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] mb-1">Total Confirmed Cost</p>
                  <p className="text-2xl font-black text-emerald-400">
                    {order.finalTotalCost !== undefined ? formatLKR(order.finalTotalCost) : order.price}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 shrink-0 absolute bottom-0 left-0 right-0 z-20 flex justify-end gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <Button 
            variant="outline" 
            className="bg-zinc-950/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold px-6 h-12 rounded-xl transition-all"
            onClick={onClose}
          >
            Close
          </Button>
          {order.quotationPdfUrl && (
            <a
              href={getPdfDownloadUrl(order.quotationPdfUrl)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 font-bold px-6 h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] gap-2"
            >
              <FileDown className="h-5 w-5" />
              Download Quotation PDF
            </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
