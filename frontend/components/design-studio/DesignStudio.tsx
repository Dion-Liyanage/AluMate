"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, SlidersHorizontal, X, PenTool } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { aluminiumComponents, AluminiumComponent } from "./aluminiumComponents";
import ProductComponentLibrary from "./ProductComponentLibrary";
import ViewToggle from "./ViewToggle";
import DesignToolbar from "./DesignToolbar";
import type { FabricCanvasHandle } from "./FabricCanvas";
import { QuotationConfigPanel } from "@/components/dashboard/design/QuotationConfigPanel";

// Dynamic imports to avoid SSR issues with canvas/WebGL
const FabricCanvas = dynamic(() => import("./FabricCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-stone-100">
      <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
    </div>
  ),
});

const ThreePreview = dynamic(() => import("./ThreePreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-stone-100">
      <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
    </div>
  ),
});

interface ThreeObject {
  componentId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
}

interface DesignStudioProps {
  productType: string;
}

const productLabels: Record<string, string> = {
  window: "Window",
  door: "Door",
  cupboard: "Cupboard",
  partition: "Partition",
  railing: "Railing",
  other: "Other",
};

export default function DesignStudio({ productType }: DesignStudioProps) {
  const [activeView, setActiveView] = useState<"2d" | "3d">("2d");
  const [hasSelection, setHasSelection] = useState(false);
  const [threeObjects, setThreeObjects] = useState<ThreeObject[]>([]);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const fabricRef = useRef<FabricCanvasHandle>(null);

  const components = useMemo(
    () => aluminiumComponents[productType] ?? aluminiumComponents.other,
    [productType]
  );

  const syncToThree = useCallback(() => {
    const canvas = fabricRef.current?.getCanvas();
    if (!canvas) return;

    const objs: ThreeObject[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.getObjects().forEach((obj: any) => {
      if (obj.isGrid) return;
      objs.push({
        componentId: (obj.componentId as string) ?? "unknown",
        label: (obj.componentLabel as string) ?? "",
        x: (obj.left as number) ?? 0,
        y: (obj.top as number) ?? 0,
        width: ((obj.width as number) ?? 50) * ((obj.scaleX as number) ?? 1),
        height: ((obj.height as number) ?? 50) * ((obj.scaleY as number) ?? 1),
        fill: typeof obj.fill === "string" ? obj.fill : "#a3a3a3",
        opacity: (obj.opacity as number) ?? 1,
      });
    });
    setThreeObjects(objs);
  }, []);

  const handleAddComponent = useCallback(
    (comp: AluminiumComponent) => {
      fabricRef.current?.addComponent({
        ...comp.fabricDefaults,
        label: comp.name,
        componentId: comp.id,
      });
    },
    []
  );

  const handleSave = useCallback(() => {
    const json = fabricRef.current?.toJSON();
    const preview = fabricRef.current?.toDataURL();
    if (json) {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `design-${productType}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    // Future: send to backend API
    console.log("Design saved", { json: json?.length, preview: preview?.length });
  }, [productType]);

  const handleOrder = useCallback(() => {
    const json = fabricRef.current?.toJSON();
    const preview = fabricRef.current?.toDataURL();
    // Store in sessionStorage for the order page
    if (json && preview) {
      sessionStorage.setItem(
        "design_order",
        JSON.stringify({ designJson: json, previewImage: preview, productType })
      );
      window.location.href = "/dashboard/orders/new";
    }
  }, [productType]);

  const handleViewToggle = useCallback(
    (view: "2d" | "3d") => {
      if (view === "3d") syncToThree();
      setActiveView(view);
    },
    [syncToThree]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      {/* Studio header */}
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/design/new"
            className="inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-5 w-px bg-stone-300" />
          <h2 className="text-lg font-semibold text-stone-900">
            Design Studio
            <span className="ml-2 text-sm font-normal text-sky-600">
              {productLabels[productType] ?? "Custom"}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle activeView={activeView} onToggle={handleViewToggle} />

          {/* Quotation Config Toggle */}
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              showConfigPanel
                ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            {showConfigPanel ? (
              <X className="h-4 w-4" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {showConfigPanel ? "Hide Config" : "Configure & Quote"}
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar (visible in 2D mode) */}
      {activeView === "2d" && (
        <div className="border-b border-stone-200 bg-white px-4 py-2">
          <DesignToolbar
            hasSelection={hasSelection}
            onDelete={() => fabricRef.current?.deleteSelected()}
            onDuplicate={() => fabricRef.current?.duplicateSelected()}
            onUndo={() => fabricRef.current?.undo()}
            onRedo={() => fabricRef.current?.redo()}
            onClear={() => fabricRef.current?.clearCanvas()}
            onToggleGrid={() => fabricRef.current?.toggleGrid()}
            onSave={handleSave}
            onOrder={handleOrder}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex flex-1 overflow-hidden bg-stone-100">
          <AnimatePresence mode="wait">
            {activeView === "2d" ? (
              <motion.div
                key="2d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-1 overflow-hidden"
              >
                {/* Component library sidebar */}
                <div className="flex w-52 flex-shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-stone-50">
                  <ProductComponentLibrary
                    components={components}
                    onAddComponent={handleAddComponent}
                  />
                </div>

                {/* Fabric canvas */}
                <div className="relative flex-1 bg-white">
                  <FabricCanvas
                    ref={fabricRef}
                    onSelectionChange={setHasSelection}
                    onObjectModified={syncToThree}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 bg-white"
              >
                <ThreePreview objects={threeObjects} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quotation Configuration Panel */}
        <AnimatePresence>
          {showConfigPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-shrink-0 overflow-hidden border-l border-zinc-800 bg-zinc-950"
            >
              <div className="h-full w-[400px] flex flex-col">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Quotation Configuration
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowConfigPanel(false)}
                    className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Config panel content */}
                <QuotationConfigPanel
                  productType={productType}
                  designData={fabricRef.current?.toJSON()}
                  previewImage={fabricRef.current?.toDataURL()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
