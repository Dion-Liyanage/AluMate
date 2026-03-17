"use client";

import { Box, Layers } from "lucide-react";

interface ViewToggleProps {
  activeView: "2d" | "3d";
  onToggle: (view: "2d" | "3d") => void;
}

export default function ViewToggle({ activeView, onToggle }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
      <button
        onClick={() => onToggle("2d")}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeView === "2d"
            ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        <Layers className="h-4 w-4" />
        2D Design
      </button>
      <button
        onClick={() => onToggle("3d")}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeView === "3d"
            ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        <Box className="h-4 w-4" />
        3D Preview
      </button>
    </div>
  );
}
