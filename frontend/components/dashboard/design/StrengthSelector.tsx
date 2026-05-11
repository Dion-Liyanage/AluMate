"use client";

import { strengthCategories } from "./quotationConfig";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  light: Shield,
  medium: ShieldCheck,
  heavy: ShieldAlert,
};

const colors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  light: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.1)]",
  },
  medium: {
    border: "border-amber-500/50",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  },
  heavy: {
    border: "border-rose-500/50",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.1)]",
  },
};

interface StrengthSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StrengthSelector({ value, onChange }: StrengthSelectorProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Strength Category
        <span className="ml-2 text-[10px] font-medium text-amber-400/80 normal-case tracking-normal">
          Required
        </span>
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {strengthCategories.map((cat) => {
          const isSelected = value === cat.value;
          const Icon = icons[cat.value] || Shield;
          const color = colors[cat.value] || colors.light;

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onChange(cat.value)}
              className={`group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 ${
                isSelected
                  ? `${color.border} ${color.bg} ${color.text} ${color.glow}`
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isSelected ? color.text : "text-zinc-600"
                }`}
              />
              <span className="text-sm font-semibold">{cat.label}</span>
              <span className="text-[10px] leading-tight text-zinc-500">
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
