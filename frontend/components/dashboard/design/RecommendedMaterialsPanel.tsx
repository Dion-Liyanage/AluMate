"use client";

import { motion } from "framer-motion";
import { Info, Shield, Box, Wrench, Layers } from "lucide-react";
import { AluminiumProfile } from "./quotationConfig";

interface RecommendedMaterialsPanelProps {
  profile: AluminiumProfile | null;
  explanation: string[];
  accessories: string[];
  strength: string;
}

export function RecommendedMaterialsPanel({
  profile,
  explanation,
  accessories,
  strength,
}: RecommendedMaterialsPanelProps) {
  if (!profile) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Layers className="h-3.5 w-3.5" />
        Material Recommendations
      </h4>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-5">
        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Box className="h-3 w-3" />
              Aluminium Profile
            </div>
            <p className="text-sm font-semibold text-violet-300">{profile.name}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="h-3 w-3" />
              Thickness
            </div>
            <p className="text-sm font-semibold text-zinc-200">{profile.thickness}</p>
          </div>
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Strength & Accessories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Wrench className="h-3 w-3" />
              Strength Category
            </div>
            <p className="text-sm font-medium text-zinc-200 capitalize">
              {strength || "Standard"} Duty
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Info className="h-3 w-3" />
              Key Accessories
            </div>
            <p className="text-xs text-zinc-400">
              {accessories.length > 0
                ? accessories.join(", ")
                : "Standard hardware set"}
            </p>
          </div>
        </div>

        <div className="h-px bg-zinc-800" />

        {/* Why this was selected */}
        <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            Why these materials?
          </p>
          <ul className="space-y-1">
            {explanation.map((item, idx) => (
              <li key={idx} className="text-[11px] text-zinc-400 flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-violet-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <p className="text-[10px] text-zinc-600 italic">
          * Materials are automatically selected based on measurements and purpose to ensure safety and durability.
        </p>
      </div>
    </div>
  );
}
