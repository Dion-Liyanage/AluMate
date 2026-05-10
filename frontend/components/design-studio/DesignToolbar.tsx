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
  BringToFront,
  SendToBack,
} from "lucide-react";

interface DesignToolbarProps {
  hasSelection: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onToggleGrid: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
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
  onBringToFront,
  onSendToBack,
  onSave,
  onOrder,
}: DesignToolbarProps) {
  const btnBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all";
  const btnDefault =
    "border-stone-300 bg-white text-stone-700 shadow-sm hover:border-stone-400 hover:bg-stone-100 hover:text-stone-950";
  const btnDisabled = "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400";
  const btnAccent =
    "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={onUndo} className={`${btnBase} ${btnDefault}`} title="Undo">
        <Undo2 className="h-3.5 w-3.5" /> Undo
      </button>
      <button onClick={onRedo} className={`${btnBase} ${btnDefault}`} title="Redo">
        <Redo2 className="h-3.5 w-3.5" /> Redo
      </button>

      <div className="mx-1 h-5 w-px bg-stone-300" />

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

      <div className="mx-1 h-5 w-px bg-stone-300" />

      <button
        onClick={onBringToFront}
        disabled={!hasSelection}
        className={`${btnBase} ${hasSelection ? btnDefault : btnDisabled}`}
        title="Bring to Front"
      >
        <BringToFront className="h-3.5 w-3.5" /> Front
      </button>
      <button
        onClick={onSendToBack}
        disabled={!hasSelection}
        className={`${btnBase} ${hasSelection ? btnDefault : btnDisabled}`}
        title="Send to Back"
      >
        <SendToBack className="h-3.5 w-3.5" /> Back
      </button>

      <div className="mx-1 h-5 w-px bg-stone-300" />

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
