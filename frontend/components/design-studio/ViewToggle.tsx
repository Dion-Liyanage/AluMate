"use client";

import { Box, Layers } from "lucide-react";

interface ViewToggleProps {
  activeView: "2d" | "3d";
  onToggle: (view: "2d" | "3d") => void;
}

export default function ViewToggle({ activeView, onToggle }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5">
      <button
        onClick={() => onToggle("2d")}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeView === "2d"
            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Layers className="h-4 w-4" />
        2D Design
      </button>
      <button
        onClick={() => onToggle("3d")}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          activeView === "3d"
            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Box className="h-4 w-4" />
        3D Preview
      </button>
    </div>
  );
}
