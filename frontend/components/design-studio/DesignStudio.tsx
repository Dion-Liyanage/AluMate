"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { aluminiumComponents, AluminiumComponent } from "./aluminiumComponents";
import ProductComponentLibrary from "./ProductComponentLibrary";
import ViewToggle from "./ViewToggle";
import DesignToolbar from "./DesignToolbar";
import type { FabricCanvasHandle } from "./FabricCanvas";
import { useSidebar } from "@/contexts/SidebarContext";

// Dynamic imports to avoid SSR issues with canvas/WebGL
const FabricCanvas = dynamic(() => import("./FabricCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-zinc-900">
      <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
    </div>
  ),
});

const ThreePreview = dynamic(() => import("./ThreePreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full min-h-[400px] bg-zinc-900">
      <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
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
  const { setIsCollapsed } = useSidebar();
  const [activeView, setActiveView] = useState<"2d" | "3d">("2d");
  const [hasSelection, setHasSelection] = useState(false);
  const [threeObjects, setThreeObjects] = useState<ThreeObject[]>([]);
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
      // Automatically collapse sidebar when a component is selected
      setIsCollapsed(true);
    },
    [setIsCollapsed]
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Studio header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/design/new"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="w-px h-5 bg-zinc-700" />
          <h2 className="text-lg font-semibold text-zinc-100">
            Design Studio
            <span className="ml-2 text-sm font-normal text-violet-400">
              {productLabels[productType] ?? "Custom"}
            </span>
          </h2>
        </div>

        <ViewToggle activeView={activeView} onToggle={handleViewToggle} />
      </div>

      {/* Toolbar (visible in 2D mode) */}
      {activeView === "2d" && (
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
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
      <div className="flex-1 flex overflow-hidden">
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
              <div className="w-52 flex-shrink-0 border-r border-zinc-800 bg-zinc-950/60 overflow-hidden flex flex-col">
                <ProductComponentLibrary
                  components={components}
                  onAddComponent={handleAddComponent}
                />
              </div>

              {/* Fabric canvas */}
              <div className="flex-1 relative">
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
              className="flex-1"
            >
              <ThreePreview objects={threeObjects} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
