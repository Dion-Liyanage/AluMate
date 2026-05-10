"use client";

import { productAccessories, AccessoryOption } from "./quotationConfig";
import { Package, Check } from "lucide-react";

interface AccessoriesSelectorProps {
  productType: string;
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function AccessoriesSelector({
  productType,
  selected,
  onChange,
}: AccessoriesSelectorProps) {
  const accessories = productAccessories[productType] || productAccessories.other;

  const toggleAccessory = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
        <Package className="h-3.5 w-3.5" />
        Accessories
        <span className="text-[10px] font-normal text-zinc-600 normal-case tracking-normal">
          Optional
        </span>
      </h4>
      <div className="space-y-2">
        {accessories.map((acc: AccessoryOption) => {
          const isSelected = selected.includes(acc.key);
          return (
            <button
              key={acc.key}
              type="button"
              onClick={() => toggleAccessory(acc.key)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-zinc-600 bg-transparent"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-emerald-300" : "text-zinc-400"
                  }`}
                >
                  {acc.label}
                </span>
                {acc.description && (
                  <p className="text-[11px] text-zinc-600 mt-0.5 truncate">
                    {acc.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
