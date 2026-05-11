"use client";

import { motion } from "framer-motion";
import { Info, Shield, Box, Wrench, Layers, CheckCircle2, Package } from "lucide-react";
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

  const details = [
    {
      icon: <Box className="h-4 w-4 text-violet-400" />,
      label: "Aluminium Profile",
      value: profile.name,
      subValue: profile.description,
    },
    {
      icon: <Shield className="h-4 w-4 text-sky-400" />,
      label: "Material Thickness",
      value: profile.thickness,
    },
    {
      icon: <Wrench className="h-4 w-4 text-emerald-400" />,
      label: "Strength Category",
      value: `${strength || "Standard"} Duty`,
    },
    {
      icon: <Package className="h-4 w-4 text-amber-400" />,
      label: "Selected Accessories",
      value: accessories.length > 0 ? accessories.join(", ") : "Standard hardware set",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5" />
          System Recommendations
        </h4>
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-tight flex items-center gap-1">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Auto-Selected
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        {/* Detail List */}
        <div className="divide-y divide-zinc-800/50">
          {details.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-zinc-900/30 transition-colors flex items-start gap-4">
              <div className="mt-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                {item.icon}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-zinc-100">
                  {item.value}
                </p>
                {item.subValue && (
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {item.subValue}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Why this was selected */}
        <div className="bg-violet-600/5 border-t border-zinc-800 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
            <Info className="h-3.5 w-3.5" />
            Selection Rationale
          </div>
          <ul className="space-y-2">
            {explanation.map((item, idx) => (
              <li key={idx} className="text-[11px] text-zinc-400 flex items-start gap-2.5">
                <CheckCircle2 className="h-3 w-3 text-violet-500/50 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-600 italic px-1">
        * Our engine automatically selects industrial-grade materials optimized for your specific measurements and environment.
      </p>
    </div>
  );
}
