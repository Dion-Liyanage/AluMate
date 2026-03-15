"use client";

import {
  Trash2,
  Copy,
  Undo2,
  Redo2,
  XCircle,
  Grid3X3,
  Save,
  ShoppingCart,
} from "lucide-react";

interface DesignToolbarProps {
  hasSelection: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onToggleGrid: () => void;
  onSave: () => void;
  onOrder: () => void;
}

export default function DesignToolbar({
  hasSelection,
  onDelete,
  onDuplicate,
  onUndo,
  onRedo,
  onClear,
  onToggleGrid,
  onSave,
  onOrder,
}: DesignToolbarProps) {
  const btnBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all";
  const btnDefault =
    "border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100";
  const btnDisabled = "border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed";
  const btnAccent =
    "border-violet-500/40 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 hover:text-violet-200";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={onUndo} className={`${btnBase} ${btnDefault}`} title="Undo">
        <Undo2 className="h-3.5 w-3.5" /> Undo
      </button>
      <button onClick={onRedo} className={`${btnBase} ${btnDefault}`} title="Redo">
        <Redo2 className="h-3.5 w-3.5" /> Redo
      </button>

      <div className="w-px h-5 bg-zinc-700 mx-1" />

      <button
        onClick={onDelete}
        disabled={!hasSelection}
        className={`${btnBase} ${hasSelection ? btnDefault : btnDisabled}`}
        title="Delete selected"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
      <button
        onClick={onDuplicate}
        disabled={!hasSelection}
        className={`${btnBase} ${hasSelection ? btnDefault : btnDisabled}`}
        title="Duplicate selected"
      >
        <Copy className="h-3.5 w-3.5" /> Duplicate
      </button>

      <div className="w-px h-5 bg-zinc-700 mx-1" />

      <button onClick={onToggleGrid} className={`${btnBase} ${btnDefault}`} title="Toggle grid">
        <Grid3X3 className="h-3.5 w-3.5" /> Grid
      </button>
      <button onClick={onClear} className={`${btnBase} ${btnDefault}`} title="Clear canvas">
        <XCircle className="h-3.5 w-3.5" /> Clear
      </button>

      <div className="flex-1" />

      <button onClick={onSave} className={`${btnBase} ${btnAccent}`} title="Save design">
        <Save className="h-3.5 w-3.5" /> Save
      </button>
      <button onClick={onOrder} className={`${btnBase} ${btnAccent}`} title="Continue to order">
        <ShoppingCart className="h-3.5 w-3.5" /> Order
      </button>
    </div>
  );
}
