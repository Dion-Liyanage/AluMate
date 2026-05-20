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
  bringToFront: () => void;
  sendToBack: () => void;
  undo: () => void;
  redo: () => void;
  toJSON: () => string;
  toDataURL: () => string;
  copySelected: () => void;
  pasteSelected: () => void;
  cutSelected: () => void;
}

interface FabricCanvasProps {
  onSelectionChange?: (hasSelection: boolean) => void;
  onObjectModified?: () => void;
  panMode?: boolean;
}

const GRID_SIZE = 20;
const FABRIC_CUSTOM_PROPS = ["componentId", "componentLabel"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  ({ onSelectionChange, onObjectModified, panMode = false }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridVisibleRef = useRef(true);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const isUndoRedoRef = useRef(false);
    const isPanningRef = useRef(false);
    const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
    const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 500, y: 400 });
    const lastPasteMousePosRef = useRef<{ x: number; y: number } | null>(null);
    const lastPasteOffsetRef = useRef<number>(0);

    const panModeRef = useRef(panMode);
    useEffect(() => {
      panModeRef.current = panMode;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.selection = !panMode;
        canvas.defaultCursor = panMode ? "grab" : "default";
        canvas.renderAll();
      }
    }, [panMode]);

    const saveHistory = useCallback(() => {
      if (isUndoRedoRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const json = JSON.stringify((canvas as AnyObj).toJSON(FABRIC_CUSTOM_PROPS));
      const history = historyRef.current;
      const idx = historyIndexRef.current;
      historyRef.current = history.slice(0, idx + 1);
      historyRef.current.push(json);
      historyIndexRef.current = historyRef.current.length - 1;
    }, []);

    const drawGrid = useCallback((canvas: fabric.Canvas) => {
      // Clean up any legacy grid lines
      const objects = canvas.getObjects().filter((o: AnyObj) => o.isGrid);
      objects.forEach((o) => canvas.remove(o));

      if (!gridVisibleRef.current) {
        canvas.backgroundColor = "#fafaf9";
        canvas.renderAll();
        return;
      }

      // Create a 20x20 canvas tile for repeating grid
      const gridCanvas = document.createElement("canvas");
      gridCanvas.width = GRID_SIZE;
      gridCanvas.height = GRID_SIZE;
      const gridCtx = gridCanvas.getContext("2d");
      
      if (gridCtx) {
        gridCtx.strokeStyle = "#e2e8f0"; // slate-200 (sharper, cleaner grey)
        gridCtx.lineWidth = 1;
        gridCtx.beginPath();
        // Right border line (offset by 0.5 for crisp 1px rendering)
        gridCtx.moveTo(GRID_SIZE - 0.5, 0);
        gridCtx.lineTo(GRID_SIZE - 0.5, GRID_SIZE);
        // Bottom border line (offset by 0.5 for crisp 1px rendering)
        gridCtx.moveTo(0, GRID_SIZE - 0.5);
        gridCtx.lineTo(GRID_SIZE, GRID_SIZE - 0.5);
        gridCtx.stroke();
      }

      const pattern = new fabric.Pattern({
        source: gridCanvas,
        repeat: "repeat",
      });

      canvas.backgroundColor = pattern;
      canvas.renderAll();
    }, []);

    const clipboardRef = useRef<fabric.FabricObject | null>(null);

    const undo = useCallback(() => {
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
    }, [drawGrid, onObjectModified]);

    const redo = useCallback(() => {
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
    }, [drawGrid, onObjectModified]);

    const deleteSelected = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const objs = canvas.getActiveObjects();
      objs.forEach((o) => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.renderAll();
      saveHistory();
      onObjectModified?.();
    }, [saveHistory, onObjectModified]);

    const materializeClone = useCallback((canvas: fabric.Canvas, cloned: fabric.FabricObject) => {
      const activeSelectionClass = (fabric as AnyObj).ActiveSelection;
      const isActiveSelection =
        (cloned as AnyObj).type === "activeSelection" ||
        (cloned as AnyObj).type === "ActiveSelection" ||
        (typeof activeSelectionClass === "function" && cloned instanceof activeSelectionClass);

      if (!isActiveSelection) {
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        return;
      }

      (cloned as AnyObj).canvas = canvas;
      const pastedObjects: fabric.FabricObject[] = [];
      (cloned as AnyObj).forEachObject((obj: fabric.FabricObject) => {
        obj.set({ evented: true });
        obj.setCoords();
        canvas.add(obj);
        pastedObjects.push(obj);
      });

      if (typeof activeSelectionClass === "function" && pastedObjects.length > 0) {
        const newSelection = new activeSelectionClass(pastedObjects, { canvas });
        canvas.setActiveObject(newSelection);
      }
    }, []);

    const duplicateSelected = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.clone(FABRIC_CUSTOM_PROPS).then((cloned: fabric.FabricObject) => {
        cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20, evented: true });

        materializeClone(canvas, cloned);
        canvas.requestRenderAll();
        saveHistory();
        onObjectModified?.();
      });
    }, [materializeClone, saveHistory, onObjectModified]);

    const copySelected = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.clone(FABRIC_CUSTOM_PROPS).then((cloned) => {
        clipboardRef.current = cloned;
      });
    }, []);

    const pasteSelected = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !clipboardRef.current) return;
      clipboardRef.current.clone(FABRIC_CUSTOM_PROPS).then((cloned) => {
        canvas.discardActiveObject();

        const mousePos = lastMousePosRef.current;
        let targetX = mousePos.x - ((cloned.width ?? 0) * (cloned.scaleX ?? 1)) / 2;
        let targetY = mousePos.y - ((cloned.height ?? 0) * (cloned.scaleY ?? 1)) / 2;

        // Cascade if the mouse hasn't moved
        if (
          lastPasteMousePosRef.current &&
          lastPasteMousePosRef.current.x === mousePos.x &&
          lastPasteMousePosRef.current.y === mousePos.y
        ) {
          lastPasteOffsetRef.current += 20;
          targetX += lastPasteOffsetRef.current;
          targetY += lastPasteOffsetRef.current;
        } else {
          lastPasteMousePosRef.current = { x: mousePos.x, y: mousePos.y };
          lastPasteOffsetRef.current = 0;
        }

        const snappedX = Math.round(targetX / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(targetY / GRID_SIZE) * GRID_SIZE;

        cloned.set({
          left: snappedX,
          top: snappedY,
          evented: true,
        });

        materializeClone(canvas, cloned);
        canvas.requestRenderAll();
        saveHistory();
        onObjectModified?.();
      });
    }, [materializeClone, saveHistory, onObjectModified]);

    const cutSelected = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.clone(FABRIC_CUSTOM_PROPS).then((cloned) => {
        clipboardRef.current = cloned;
        const objs = canvas.getActiveObjects();
        objs.forEach((o) => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      });
    }, [saveHistory, onObjectModified]);

    useEffect(() => {
      if (!canvasElRef.current || !containerRef.current) return;

      // Configure default object control styles globally
      if ((fabric as any).FabricObject) {
        Object.assign((fabric as any).FabricObject.ownDefaults, {
          cornerColor: "#0284c7",
          cornerStrokeColor: "#0284c7",
          borderColor: "#0284c7",
          transparentCorners: false,
          cornerSize: 12,
          touchCornerSize: 24,
        });

        const currentCustomProps = (fabric as AnyObj).FabricObject.customProperties;
        const mergedCustomProps = Array.from(
          new Set([
            ...(Array.isArray(currentCustomProps) ? currentCustomProps : []),
            ...FABRIC_CUSTOM_PROPS,
          ])
        );
        (fabric as AnyObj).FabricObject.customProperties = mergedCustomProps;
      }

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

      // Snap-to-grid or snap-to-component on moving
      canvas.on("object:moving", (e: AnyObj) => {
        const obj = e.target;
        if (!obj) return;

        const w = (obj.width ?? 0) * (obj.scaleX ?? 1);
        const h = (obj.height ?? 0) * (obj.scaleY ?? 1);

        // Filter out grid lines and text labels to only snap against physical components
        const otherObjects = canvas.getObjects().filter(
          (o: AnyObj) => o !== obj && !o.isGrid && o.componentId !== "label-text"
        );

        const SNAP_THRESHOLD = 12;
        let snappedX: number | null = null;
        let snappedY: number | null = null;

        let minDiffX = SNAP_THRESHOLD;
        let minDiffY = SNAP_THRESHOLD;

        otherObjects.forEach((other: AnyObj) => {
          const ow = (other.width ?? 0) * (other.scaleX ?? 1);
          const oh = (other.height ?? 0) * (other.scaleY ?? 1);
          const ol = other.left ?? 0;
          const ot = other.top ?? 0;
          const or = ol + ow;
          const ob = ot + oh;
          const ocX = ol + ow / 2;
          const ocY = ot + oh / 2;

          // Define snap guidelines for X (horizontal alignment)
          const xSnaps = [ol, or, ocX];
          // If targeting a frame, snap flush against the inside 10px borders
          if (other.componentId === "frame") {
            xSnaps.push(ol + 10, or - 10);
          }

          // Define snap guidelines for Y (vertical alignment)
          const ySnaps = [ot, ob, ocY];
          // If targeting a frame, snap flush against the inside 10px borders
          if (other.componentId === "frame") {
            ySnaps.push(ot + 10, ob - 10);
          }

          // Test all snap options horizontally
          xSnaps.forEach((sx) => {
            // Dragged left edge to sx
            const diffLeft = Math.abs((obj.left ?? 0) - sx);
            if (diffLeft < minDiffX) {
              minDiffX = diffLeft;
              snappedX = sx;
            }
            // Dragged right edge to sx
            const diffRight = Math.abs((obj.left ?? 0) + w - sx);
            if (diffRight < minDiffX) {
              minDiffX = diffRight;
              snappedX = sx - w;
            }
            // Dragged center line to sx
            const diffCenter = Math.abs((obj.left ?? 0) + w / 2 - sx);
            if (diffCenter < minDiffX) {
              minDiffX = diffCenter;
              snappedX = sx - w / 2;
            }
          });

          // Test all snap options vertically
          ySnaps.forEach((sy) => {
            // Dragged top edge to sy
            const diffTop = Math.abs((obj.top ?? 0) - sy);
            if (diffTop < minDiffY) {
              minDiffY = diffTop;
              snappedY = sy;
            }
            // Dragged bottom edge to sy
            const diffBottom = Math.abs((obj.top ?? 0) + h - sy);
            if (diffBottom < minDiffY) {
              minDiffY = diffBottom;
              snappedY = sy - h;
            }
            // Dragged center line to sy
            const diffCenter = Math.abs((obj.top ?? 0) + h / 2 - sy);
            if (diffCenter < minDiffY) {
              minDiffY = diffCenter;
              snappedY = sy - h / 2;
            }
          });
        });

        // Apply snapping, falling back to grid if no close component edges exist
        const finalLeft = snappedX !== null ? snappedX : Math.round((obj.left ?? 0) / GRID_SIZE) * GRID_SIZE;
        const finalTop = snappedY !== null ? snappedY : Math.round((obj.top ?? 0) / GRID_SIZE) * GRID_SIZE;

        obj.set({
          left: finalLeft,
          top: finalTop,
        });
      });

      // Smart Magnetic snapping on scaling/resizing
      canvas.on("object:scaling", (e: AnyObj) => {
        const obj = e.target;
        if (!obj) return;

        const transform = (canvas as any)._currentTransform;
        if (!transform) return;

        const corner = transform.corner;
        const w = (obj.width ?? 0) * (obj.scaleX ?? 1);
        const h = (obj.height ?? 0) * (obj.scaleY ?? 1);
        const left = obj.left ?? 0;
        const top = obj.top ?? 0;
        const right = left + w;
        const bottom = top + h;

        // Filter out grid lines and text labels
        const otherObjects = canvas.getObjects().filter(
          (o: AnyObj) => o !== obj && !o.isGrid && o.componentId !== "label-text"
        );

        const SNAP_THRESHOLD = 12;
        let snapX: number | null = null;
        let snapY: number | null = null;
        let minDiffX = SNAP_THRESHOLD;
        let minDiffY = SNAP_THRESHOLD;

        otherObjects.forEach((other: AnyObj) => {
          const ow = (other.width ?? 0) * (other.scaleX ?? 1);
          const oh = (other.height ?? 0) * (other.scaleY ?? 1);
          const ol = other.left ?? 0;
          const ot = other.top ?? 0;
          const or = ol + ow;
          const ob = ot + oh;

          // Define snap points for X (horizontal alignment)
          const xSnaps = [ol, or];
          if (other.componentId === "frame") {
            xSnaps.push(ol + 10, or - 10);
          }

          // Define snap points for Y (vertical alignment)
          const ySnaps = [ot, ob];
          if (other.componentId === "frame") {
            ySnaps.push(ot + 10, ob - 10);
          }

          // Check X snaps depending on which handle is dragged
          xSnaps.forEach((sx) => {
            if (corner === "mr" || corner === "tr" || corner === "br") {
              const diff = Math.abs(right - sx);
              if (diff < minDiffX) {
                minDiffX = diff;
                snapX = sx;
              }
            } else if (corner === "ml" || corner === "tl" || corner === "bl") {
              const diff = Math.abs(left - sx);
              if (diff < minDiffX) {
                minDiffX = diff;
                snapX = sx;
              }
            }
          });

          // Check Y snaps depending on which handle is dragged
          ySnaps.forEach((sy) => {
            if (corner === "mb" || corner === "bl" || corner === "br") {
              const diff = Math.abs(bottom - sy);
              if (diff < minDiffY) {
                minDiffY = diff;
                snapY = sy;
              }
            } else if (corner === "mt" || corner === "tl" || corner === "tr") {
              const diff = Math.abs(top - sy);
              if (diff < minDiffY) {
                minDiffY = diff;
                snapY = sy;
              }
            }
          });
        });

        // Apply snaps or fallback to grid alignment
        if (corner === "mr" || corner === "tr" || corner === "br") {
          const targetRight = snapX !== null ? snapX : Math.round(right / GRID_SIZE) * GRID_SIZE;
          const newW = targetRight - left;
          if (newW > 10) {
            obj.set({ scaleX: newW / obj.width });
          }
        } else if (corner === "ml" || corner === "tl" || corner === "bl") {
          const targetLeft = snapX !== null ? snapX : Math.round(left / GRID_SIZE) * GRID_SIZE;
          const currentRight = left + w;
          const newW = currentRight - targetLeft;
          if (newW > 10) {
            obj.set({
              left: targetLeft,
              scaleX: newW / obj.width,
            });
          }
        }

        if (corner === "mb" || corner === "bl" || corner === "br") {
          const targetBottom = snapY !== null ? snapY : Math.round(bottom / GRID_SIZE) * GRID_SIZE;
          const newH = targetBottom - top;
          if (newH > 10) {
            obj.set({ scaleY: newH / obj.height });
          }
        } else if (corner === "mt" || corner === "tl" || corner === "tr") {
          const targetTop = snapY !== null ? snapY : Math.round(top / GRID_SIZE) * GRID_SIZE;
          const currentBottom = top + h;
          const newH = currentBottom - targetTop;
          if (newH > 10) {
            obj.set({
              top: targetTop,
              scaleY: newH / obj.height,
            });
          }
        }
      });

      canvas.on("object:modified", () => {
        saveHistory();
        onObjectModified?.();
      });

      canvas.on("text:changed", () => {
        onObjectModified?.();
      });

      canvas.on("object:added", (e) => {
        const obj = e.target as AnyObj;
        if (!obj || obj.isGrid) return;

        const isHorizontalBar = [
          "horizontal-bar",
          "aluminium-bar",
          "bar",
          "shelf",
          "top-rail",
          "bottom-rail",
        ].includes(obj.componentId);

        const isVerticalBar = [
          "vertical-bar",
          "baluster",
          "post",
          "divider",
        ].includes(obj.componentId);

        if (isHorizontalBar) {
          obj.set({
            lockScalingY: true,
            lockRotation: true,
          });
          obj.setControlsVisibility({
            tl: false,
            tr: false,
            bl: false,
            br: false,
            ml: true,
            mr: true,
            mt: false,
            mb: false,
            mtr: false,
          });
        } else if (isVerticalBar) {
          obj.set({
            lockScalingX: true,
            lockRotation: true,
          });
          obj.setControlsVisibility({
            tl: false,
            tr: false,
            bl: false,
            br: false,
            ml: false,
            mr: false,
            mt: true,
            mb: true,
            mtr: false,
          });
        } else {
          obj.set({
            lockRotation: true,
          });
          obj.setControlsVisibility({
            mtr: false,
          });
        }
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

      // Pan with middle mouse, Alt+drag, or dragging empty background if panMode is active
      canvas.on("mouse:down", (opt: AnyObj) => {
        const e = opt.e;
        const shouldPan = e.button === 1 || e.altKey || (panModeRef.current && !opt.target && !e.shiftKey);
        if (shouldPan) {
          isPanningRef.current = true;
          lastPanPointRef.current = { x: e.clientX, y: e.clientY };
          canvas.selection = false;
          if (panModeRef.current) {
            canvas.defaultCursor = "grabbing";
          }
        }
      });

      canvas.on("mouse:move", (opt: AnyObj) => {
        const pointer = canvas.getPointer(opt.e);
        lastMousePosRef.current = { x: pointer.x, y: pointer.y };

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
        canvas.selection = !panModeRef.current;
        if (panModeRef.current) {
          canvas.defaultCursor = "grab";
        }
      });

      // Resize handler
      const onResize = () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW === 0 || newH === 0) return;
        canvas.setDimensions({ width: newW, height: newH });
        drawGrid(canvas);
      };
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(container);
      // Keyboard shortcuts listener
      const handleKeyDown = (e: KeyboardEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Skip shortcuts if user is typing in an HTML input/textarea, or if Fabric text box is actively being edited
        const activeEl = document.activeElement;
        const isEditingHTML = activeEl && (
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true"
        );
        const activeObj = canvas.getActiveObject();
        const isEditingFabric = activeObj && (activeObj as any).isEditing;

        if (isEditingHTML || isEditingFabric) {
          return;
        }

        const isCtrl = e.ctrlKey || e.metaKey; // Ctrl (Windows/Linux) or Cmd (macOS)
        const key = e.key.toLowerCase();

        if (isCtrl && key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (isCtrl && key === "y") {
          e.preventDefault();
          redo();
        } else if (isCtrl && key === "c") {
          e.preventDefault();
          copySelected();
        } else if (isCtrl && key === "x") {
          e.preventDefault();
          cutSelected();
        } else if (isCtrl && key === "v") {
          e.preventDefault();
          pasteSelected();
        } else if (isCtrl && key === "d") {
          e.preventDefault();
          duplicateSelected();
        } else if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          deleteSelected();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        resizeObserver.disconnect();
        canvas.dispose();
        canvasRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [undo, redo, deleteSelected, duplicateSelected, copySelected, pasteSelected, cutSelected]);

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,

      addComponent: (opts) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // Convert the viewport center (screen coords) into canvas scene (grid) coords
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const screenCenterX = canvasWidth / 2;
        const screenCenterY = canvasHeight / 2;

        const sceneCenterX = (screenCenterX - vpt[4]) / vpt[0];
        const sceneCenterY = (screenCenterY - vpt[5]) / vpt[3];

        // Center the component at the viewport's current center, snapped to grid
        const spawnLeft = Math.round((sceneCenterX - opts.width / 2) / GRID_SIZE) * GRID_SIZE;
        const spawnTop = Math.round((sceneCenterY - opts.height / 2) / GRID_SIZE) * GRID_SIZE;

        if (opts.componentId === "label-text") {
          const textbox: AnyObj = new fabric.Textbox("Label", {
            left: spawnLeft,
            top: spawnTop,
            width: opts.width,
            fontSize: 16,
            fill: opts.fill || "#1f2937",
            fontFamily: "sans-serif",
            cornerColor: "#0284c7",
            cornerStrokeColor: "#0284c7",
            borderColor: "#0284c7",
            transparentCorners: false,
            cornerSize: 12,
            touchCornerSize: 24,
          });
          textbox.componentId = opts.componentId;
          textbox.componentLabel = "Label";

          canvas.add(textbox);
          canvas.setActiveObject(textbox);
          canvas.renderAll();
          saveHistory();
          onObjectModified?.();
          return;
        }

        const rect: AnyObj = new fabric.Rect({
          left: spawnLeft,
          top: spawnTop,
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
          cornerSize: 12,
          touchCornerSize: 24,
        });
        rect.componentId = opts.componentId;
        rect.componentLabel = opts.label;

        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      },

      deleteSelected,

      duplicateSelected,

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

      bringToFront: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        activeObjects.forEach((obj) => {
          canvas.bringObjectToFront(obj);
        });
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      },

      sendToBack: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        activeObjects.forEach((obj) => {
          canvas.sendObjectToBack(obj);
        });
        // Ensure grid stays at the very bottom
        const gridObjects = canvas.getObjects().filter((o: AnyObj) => o.isGrid);
        gridObjects.forEach((grid) => {
          canvas.sendObjectToBack(grid);
        });
        canvas.renderAll();
        saveHistory();
        onObjectModified?.();
      },

      undo,

      redo,

      copySelected,

      pasteSelected,

      cutSelected,

      toJSON: () => {
        const canvas = canvasRef.current;
        if (!canvas) return "{}";
        return JSON.stringify((canvas as AnyObj).toJSON(FABRIC_CUSTOM_PROPS));
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
