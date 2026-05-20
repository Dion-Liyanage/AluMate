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
  const [panMode, setPanMode] = useState(false);
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
    const collectRenderableObjects = (obj: any) => {
      if (!obj || obj.isGrid) return;

      const childObjects = typeof obj.getObjects === "function" ? obj.getObjects() : [];

      // Groups/active selections can contain real components; always flatten them.
      if (Array.isArray(childObjects) && childObjects.length > 0) {
        childObjects.forEach((child: any) => collectRenderableObjects(child));
        return;
      }

      const rawComponentId = typeof obj.componentId === "string" ? obj.componentId : "";
      let componentId = rawComponentId;

      if (!componentId) {
        const type = typeof obj.type === "string" ? obj.type : "";
        const fill = typeof obj.fill === "string" ? obj.fill : "";
        const stroke = typeof obj.stroke === "string" ? obj.stroke : "";
        const strokeWidth = (obj.strokeWidth as number) ?? 0;

        if (type === "textbox" || type === "text" || obj.text) {
          componentId = "label-text";
        } else if (
          fill === "transparent" &&
          strokeWidth >= 4 &&
          (stroke === "#52525b" || stroke === "rgb(82,82,91)")
        ) {
          componentId = "frame";
        } else if (fill.includes("191,219,254") || fill === "#bfdbfe") {
          componentId = "glass-panel";
        } else {
          componentId = "board-panel";
        }
      }

      let bounds = {
        left: (obj.left as number) ?? 0,
        top: (obj.top as number) ?? 0,
        width: ((obj.width as number) ?? 50) * ((obj.scaleX as number) ?? 1),
        height: ((obj.height as number) ?? 50) * ((obj.scaleY as number) ?? 1),
      };

      // Use transformed corner coordinates so duplicated/grouped children keep correct world position.
      if (typeof obj.getCoords === "function") {
        const coords = obj.getCoords();
        if (Array.isArray(coords) && coords.length > 0) {
          const xs = coords.map((p: { x: number }) => p.x);
          const ys = coords.map((p: { y: number }) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          bounds = {
            left: minX,
            top: minY,
            width: Math.max(1, maxX - minX),
            height: Math.max(1, maxY - minY),
          };
        }
      } else if (typeof obj.getBoundingRect === "function") {
        bounds = obj.getBoundingRect();
      }

      objs.push({
        componentId,
        label: obj.text ? (obj.text as string) : ((obj.componentLabel as string) ?? ""),
        x: (bounds.left as number) ?? 0,
        y: (bounds.top as number) ?? 0,
        width: Math.max(1, (bounds.width as number) ?? 50),
        height: Math.max(1, (bounds.height as number) ?? 50),
        fill: typeof obj.fill === "string" ? obj.fill : "#a3a3a3",
        opacity: (obj.opacity as number) ?? 1,
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.getObjects().forEach((obj: any) => collectRenderableObjects(obj));
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
            onBringToFront={() => fabricRef.current?.bringToFront()}
            onSendToBack={() => fabricRef.current?.sendToBack()}
            onSave={handleSave}
            onOrder={handleOrder}
            panMode={panMode}
            onTogglePanMode={() => setPanMode((prev) => !prev)}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="flex flex-1 overflow-hidden bg-stone-100 relative">
          {/* 2D Design View (stays mounted, toggled visually) */}
          <div
            style={{ display: activeView === "2d" ? "flex" : "none" }}
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
                panMode={panMode}
              />
            </div>
          </div>

          {/* 3D Preview (conditionally rendered for WebGL lifecycle management) */}
          {activeView === "3d" && (
            <div className="flex-1 bg-white">
              <ThreePreview objects={threeObjects} />
            </div>
          )}
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
