"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import * as fabric from "fabric";

export interface FabricCanvasHandle {
  getCanvas: () => fabric.Canvas | null;
  addComponent: (opts: {
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rx?: number;
    ry?: number;
    opacity?: number;
    label: string;
    componentId: string;
  }) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  clearCanvas: () => void;
  toggleGrid: () => void;
  undo: () => void;
  redo: () => void;
  toJSON: () => string;
  toDataURL: () => string;
}

interface FabricCanvasProps {
  onSelectionChange?: (hasSelection: boolean) => void;
  onObjectModified?: () => void;
}

const GRID_SIZE = 20;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  ({ onSelectionChange, onObjectModified }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridVisibleRef = useRef(true);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const isUndoRedoRef = useRef(false);
    const isPanningRef = useRef(false);
    const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);

    const saveHistory = useCallback(() => {
      if (isUndoRedoRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const json = JSON.stringify((canvas as AnyObj).toJSON(["componentId", "componentLabel"]));
      const history = historyRef.current;
      const idx = historyIndexRef.current;
      historyRef.current = history.slice(0, idx + 1);
      historyRef.current.push(json);
      historyIndexRef.current = historyRef.current.length - 1;
    }, []);

    const drawGrid = useCallback((canvas: fabric.Canvas) => {
      const objects = canvas.getObjects().filter((o: AnyObj) => o.isGrid);
      objects.forEach((o) => canvas.remove(o));

      if (!gridVisibleRef.current) {
        canvas.renderAll();
        return;
      }

      const width = canvas.getWidth();
      const height = canvas.getHeight();

      for (let x = 0; x <= width; x += GRID_SIZE) {
        const line: AnyObj = new fabric.Line([x, 0, x, height], {
          stroke: "#d6d3d1",
          strokeWidth: 0.5,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        line.isGrid = true;
        canvas.add(line);
        canvas.sendObjectToBack(line);
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        const line: AnyObj = new fabric.Line([0, y, width, y], {
          stroke: "#d6d3d1",
          strokeWidth: 0.5,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        line.isGrid = true;
        canvas.add(line);
        canvas.sendObjectToBack(line);
      }
      canvas.renderAll();
    }, []);

    useEffect(() => {
      if (!canvasElRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const w = container.clientWidth;
      const h = container.clientHeight;

      const canvas = new fabric.Canvas(canvasElRef.current, {
        width: w,
        height: h,
        backgroundColor: "#fafaf9",
        selection: true,
        preserveObjectStacking: true,
      });

      canvasRef.current = canvas;

      drawGrid(canvas);
      saveHistory();

      // Snap-to-grid on moving
      canvas.on("object:moving", (e: AnyObj) => {
        const obj = e.target;
        if (!obj) return;
        obj.set({
          left: Math.round((obj.left ?? 0) / GRID_SIZE) * GRID_SIZE,
          top: Math.round((obj.top ?? 0) / GRID_SIZE) * GRID_SIZE,
        });
      });

      canvas.on("object:modified", () => {
        saveHistory();
        onObjectModified?.();
      });

      canvas.on("selection:created", () => onSelectionChange?.(true));
      canvas.on("selection:updated", () => onSelectionChange?.(true));
      canvas.on("selection:cleared", () => onSelectionChange?.(false));

      // Mouse wheel zoom
      canvas.on("mouse:wheel", (opt: AnyObj) => {
        const e = opt.e;
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        zoom = Math.min(Math.max(zoom, 0.3), 5);
        canvas.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
      });

      // Pan with middle mouse or Alt+drag
      canvas.on("mouse:down", (opt: AnyObj) => {
        const e = opt.e;
        if (e.button === 1 || e.altKey) {
          isPanningRef.current = true;
          lastPanPointRef.current = { x: e.clientX, y: e.clientY };
          canvas.selection = false;
        }
      });

      canvas.on("mouse:move", (opt: AnyObj) => {
        if (!isPanningRef.current || !lastPanPointRef.current) return;
        const e = opt.e;
        const vpt = canvas.viewportTransform;
        if (!vpt) return;
        vpt[4] += e.clientX - lastPanPointRef.current.x;
        vpt[5] += e.clientY - lastPanPointRef.current.y;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
        canvas.requestRenderAll();
      });

      canvas.on("mouse:up", () => {
        isPanningRef.current = false;
        lastPanPointRef.current = null;
        canvas.selection = true;
      });

      // Resize handler
      const onResize = () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        canvas.setDimensions({ width: newW, height: newH });
        drawGrid(canvas);
      };
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        canvas.dispose();
        canvasRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,

      addComponent: (opts) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect: AnyObj = new fabric.Rect({
          left: 100 + Math.random() * 200,
          top: 100 + Math.random() * 200,
          width: opts.width,
          height: opts.height,
          fill: opts.fill,
          stroke: opts.stroke,
          strokeWidth: opts.strokeWidth,
          rx: opts.rx ?? 0,
          ry: opts.ry ?? 0,
          opacity: opts.opacity ?? 1,
          cornerColor: "#0284c7",
          cornerStrokeColor: "#0284c7",
          borderColor: "#0284c7",
          transparentCorners: false,
          cornerSize: 8,
        });
        rect.componentId = opts.componentId;
        rect.componentLabel = opts.label;

        const label = new fabric.FabricText(opts.label, {
          fontSize: 11,
          fill: "#57534e",
          fontFamily: "sans-serif",
          originX: "center",
          originY: "center",
          left: (rect.left ?? 0) + opts.width / 2,
          top: (rect.top ?? 0) + opts.height / 2,
          selectable: false,
          evented: false,
        });

        const group: AnyObj = new fabric.Group([rect, label], {
          left: rect.left,
          top: rect.top,
          cornerColor: "#0284c7",
          cornerStrokeColor: "#0284c7",
          borderColor: "#0284c7",
          transparentCorners: false,
          cornerSize: 8,
        });
        group.componentId = opts.componentId;
        group.componentLabel = opts.label;

        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      },

      deleteSelected: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const objs = canvas.getActiveObjects();
        objs.forEach((o) => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      },

      duplicateSelected: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (!active) return;
        active.clone().then((cloned: fabric.FabricObject) => {
          cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20 });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
          saveHistory();
          onObjectModified?.();
        });
      },

      clearCanvas: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const nonGrid = canvas.getObjects().filter((o: AnyObj) => !o.isGrid);
        nonGrid.forEach((o) => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      },

      toggleGrid: () => {
        gridVisibleRef.current = !gridVisibleRef.current;
        if (canvasRef.current) drawGrid(canvasRef.current);
      },

      undo: () => {
        const canvas = canvasRef.current;
        if (!canvas || historyIndexRef.current <= 0) return;
        isUndoRedoRef.current = true;
        historyIndexRef.current -= 1;
        const json = historyRef.current[historyIndexRef.current];
        canvas.loadFromJSON(JSON.parse(json)).then(() => {
          drawGrid(canvas);
          canvas.renderAll();
          isUndoRedoRef.current = false;
          onObjectModified?.();
        });
      },

      redo: () => {
        const canvas = canvasRef.current;
        if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
        isUndoRedoRef.current = true;
        historyIndexRef.current += 1;
        const json = historyRef.current[historyIndexRef.current];
        canvas.loadFromJSON(JSON.parse(json)).then(() => {
          drawGrid(canvas);
          canvas.renderAll();
          isUndoRedoRef.current = false;
          onObjectModified?.();
        });
      },

      toJSON: () => {
        const canvas = canvasRef.current;
        if (!canvas) return "{}";
        return JSON.stringify((canvas as AnyObj).toJSON(["componentId", "componentLabel"]));
      },

      toDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas) return "";
        return canvas.toDataURL({ format: "png", multiplier: 1 } as AnyObj);
      },
    }));

    return (
      <div ref={containerRef} className="w-full h-full min-h-[400px] relative">
        <canvas ref={canvasElRef} />
      </div>
    );
  }
);

FabricCanvas.displayName = "FabricCanvas";
export default FabricCanvas;
