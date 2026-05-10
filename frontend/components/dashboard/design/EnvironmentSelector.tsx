"use client";

import { environmentOptions } from "./quotationConfig";
import { Sun, Home, Droplets, Cloud } from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  indoor: Home,
  outdoor: Cloud,
  "wet-area": Droplets,
  "high-sun": Sun,
};

interface EnvironmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EnvironmentSelector({ value, onChange }: EnvironmentSelectorProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Environment
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {environmentOptions.map((env) => {
          const isSelected = value === env.value;
          const Icon = icons[env.value] || Home;
          return (
            <button
              key={env.value}
              type="button"
              onClick={() => onChange(env.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200 ${
                isSelected
                  ? "border-sky-500/50 bg-sky-500/10 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.1)]"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? "text-sky-400" : "text-zinc-600"}`} />
              <span className="text-sm font-medium">{env.label}</span>
              <span className="text-[10px] leading-tight text-zinc-500">{env.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
